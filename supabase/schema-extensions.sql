-- Max OS: schema extensions
-- Run after schema.sql. Safe to rerun.
-- Ensures all core tables exist before policies/alters, then adds deals/calendar
-- and publishable-key cloud access policies.

create extension if not exists "pgcrypto";

-- ===========================================================================
-- 1. Ensure core tables exist (dependency order, uuid PKs/FKs)
--    Skips tables that already exist from schema.sql.
-- ===========================================================================

create table if not exists public.accounts (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  business_name text not null default '',
  owner text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  city text not null default '',
  state text not null default '',
  website text not null default '',
  brands_carried text[] not null default '{}',
  outstanding_balance numeric(12, 2) not null default 0,
  last_visit date,
  next_follow_up date,
  notes jsonb not null default '[]'::jsonb,
  legacy_tasks jsonb not null default '[]'::jsonb,
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists public.brands (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  brand_name text not null default '',
  description text not null default '',
  website text not null default '',
  main_contact text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  commission_default numeric(5, 2) not null default 0,
  status text not null default 'Active',
  notes text not null default '',
  monthly_sales numeric(12, 2) not null default 0,
  note_entries jsonb not null default '[]'::jsonb,
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists public.brand_products (
  id uuid primary key,
  brand_id uuid not null references public.brands (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  product_name text not null default '',
  sku text not null default '',
  category text not null default '',
  distributor_price numeric(12, 2) not null default 0,
  wholesale_price numeric(12, 2) not null default 0,
  msrp numeric(12, 2) not null default 0,
  commission_override numeric(5, 2),
  notes text not null default '',
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists public.contacts (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  account_id uuid references public.accounts (id) on delete set null,
  brand_id uuid references public.brands (id) on delete set null,
  company text not null default '',
  role text not null default '',
  type text not null default 'Buyer',
  phone text not null default '',
  email text not null default '',
  preferred_contact_method text not null default 'Call',
  city text not null default '',
  state text not null default '',
  notes text not null default '',
  last_contact_date date,
  next_follow_up_date date,
  import_batch_id text,
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists public.orders (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_number text not null default '',
  account_id uuid not null references public.accounts (id) on delete restrict,
  brand_id uuid not null references public.brands (id) on delete restrict,
  order_date date,
  products_notes text not null default '',
  order_amount numeric(12, 2) not null default 0,
  commission_percent numeric(5, 2) not null default 0,
  commission_amount numeric(12, 2) not null default 0,
  order_status text not null default 'Draft',
  payment_status text not null default 'Unpaid',
  payment_due_date date,
  notes text not null default '',
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists public.commissions (
  order_id uuid primary key references public.orders (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'Pending',
  due_date date,
  paid_date date,
  amount_manual boolean not null default false,
  amount_override numeric(12, 2),
  notes text not null default ''
);

create table if not exists public.tasks (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  description text not null default '',
  type text not null default 'Other',
  priority text not null default 'Medium',
  status text not null default 'Open',
  due_date date,
  due_time text not null default '',
  account_id uuid references public.accounts (id) on delete set null,
  contact_id uuid references public.contacts (id) on delete set null,
  brand_id uuid references public.brands (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  notes text not null default '',
  created_at timestamptz,
  updated_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.activity_events (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null default '',
  label text not null default '',
  detail text not null default '',
  occurred_at timestamptz not null,
  link_path text not null default '',
  account_id uuid references public.accounts (id) on delete set null,
  contact_id uuid references public.contacts (id) on delete set null,
  brand_id uuid references public.brands (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  task_id uuid references public.tasks (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb
);

-- Core indexes (idempotent)
create index if not exists accounts_user_id_idx on public.accounts (user_id);
create index if not exists brands_user_id_idx on public.brands (user_id);
create index if not exists brand_products_brand_id_idx on public.brand_products (brand_id);
create index if not exists brand_products_user_id_idx on public.brand_products (user_id);
create index if not exists contacts_user_id_idx on public.contacts (user_id);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists commissions_user_id_idx on public.commissions (user_id);
create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists activity_events_user_id_idx on public.activity_events (user_id);

-- Enable RLS on core tables (no-op if already enabled)
alter table public.accounts enable row level security;
alter table public.brands enable row level security;
alter table public.brand_products enable row level security;
alter table public.contacts enable row level security;
alter table public.orders enable row level security;
alter table public.commissions enable row level security;
alter table public.tasks enable row level security;
alter table public.activity_events enable row level security;

-- ===========================================================================
-- 2. Extension tables: deals, calendar_events
--    Drop and recreate only if a prior run used incompatible text FK columns.
-- ===========================================================================

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'calendar_events'
      and column_name = 'account_id' and udt_name = 'text'
  ) then
    drop table public.calendar_events cascade;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'deals'
      and column_name = 'account_id' and udt_name = 'text'
  ) then
    drop table public.deals cascade;
  end if;
end $$;

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  account_id uuid references public.accounts (id) on delete set null,
  brand_id uuid references public.brands (id) on delete set null,
  stage text not null default 'Prospect',
  value numeric(12, 2) not null default 0,
  notes text not null default '',
  created_at timestamptz,
  updated_at timestamptz
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  event_date date,
  event_time text not null default '',
  event_type text not null default 'Meeting',
  account_id uuid references public.accounts (id) on delete set null,
  contact_id uuid references public.contacts (id) on delete set null,
  notes text not null default '',
  created_at timestamptz,
  updated_at timestamptz
);

create index if not exists deals_user_id_idx on public.deals (user_id);
create index if not exists deals_account_id_idx on public.deals (account_id);
create index if not exists deals_brand_id_idx on public.deals (brand_id);
create index if not exists calendar_events_user_id_idx on public.calendar_events (user_id);
create index if not exists calendar_events_event_date_idx on public.calendar_events (event_date);
create index if not exists calendar_events_account_id_idx on public.calendar_events (account_id);
create index if not exists calendar_events_contact_id_idx on public.calendar_events (contact_id);

-- Extension RLS + policies
alter table public.deals enable row level security;
alter table public.calendar_events enable row level security;

drop policy if exists "deals_select_own" on public.deals;
drop policy if exists "deals_insert_own" on public.deals;
drop policy if exists "deals_update_own" on public.deals;
drop policy if exists "deals_delete_own" on public.deals;
create policy "deals_select_own" on public.deals for select using (auth.uid() = user_id);
create policy "deals_insert_own" on public.deals for insert with check (auth.uid() = user_id);
create policy "deals_update_own" on public.deals for update using (auth.uid() = user_id);
create policy "deals_delete_own" on public.deals for delete using (auth.uid() = user_id);

drop policy if exists "calendar_events_select_own" on public.calendar_events;
drop policy if exists "calendar_events_insert_own" on public.calendar_events;
drop policy if exists "calendar_events_update_own" on public.calendar_events;
drop policy if exists "calendar_events_delete_own" on public.calendar_events;
create policy "calendar_events_select_own" on public.calendar_events for select using (auth.uid() = user_id);
create policy "calendar_events_insert_own" on public.calendar_events for insert with check (auth.uid() = user_id);
create policy "calendar_events_update_own" on public.calendar_events for update using (auth.uid() = user_id);
create policy "calendar_events_delete_own" on public.calendar_events for delete using (auth.uid() = user_id);

-- ===========================================================================
-- 3. Publishable-key cloud access (all tables guaranteed to exist above)
-- ===========================================================================

alter table public.accounts drop constraint if exists accounts_user_id_fkey;
alter table public.accounts alter column user_id drop not null;
drop policy if exists "accounts_publishable_access" on public.accounts;
create policy "accounts_publishable_access"
  on public.accounts for all to anon, authenticated using (true) with check (true);

alter table public.brands drop constraint if exists brands_user_id_fkey;
alter table public.brands alter column user_id drop not null;
drop policy if exists "brands_publishable_access" on public.brands;
create policy "brands_publishable_access"
  on public.brands for all to anon, authenticated using (true) with check (true);

alter table public.brand_products drop constraint if exists brand_products_user_id_fkey;
alter table public.brand_products alter column user_id drop not null;
drop policy if exists "brand_products_publishable_access" on public.brand_products;
create policy "brand_products_publishable_access"
  on public.brand_products for all to anon, authenticated using (true) with check (true);

alter table public.contacts drop constraint if exists contacts_user_id_fkey;
alter table public.contacts alter column user_id drop not null;
drop policy if exists "contacts_publishable_access" on public.contacts;
create policy "contacts_publishable_access"
  on public.contacts for all to anon, authenticated using (true) with check (true);

alter table public.orders drop constraint if exists orders_user_id_fkey;
alter table public.orders alter column user_id drop not null;
drop policy if exists "orders_publishable_access" on public.orders;
create policy "orders_publishable_access"
  on public.orders for all to anon, authenticated using (true) with check (true);

alter table public.commissions drop constraint if exists commissions_user_id_fkey;
alter table public.commissions alter column user_id drop not null;
drop policy if exists "commissions_publishable_access" on public.commissions;
create policy "commissions_publishable_access"
  on public.commissions for all to anon, authenticated using (true) with check (true);

alter table public.tasks drop constraint if exists tasks_user_id_fkey;
alter table public.tasks alter column user_id drop not null;
drop policy if exists "tasks_publishable_access" on public.tasks;
create policy "tasks_publishable_access"
  on public.tasks for all to anon, authenticated using (true) with check (true);

alter table public.activity_events drop constraint if exists activity_events_user_id_fkey;
alter table public.activity_events alter column user_id drop not null;
drop policy if exists "activity_events_publishable_access" on public.activity_events;
create policy "activity_events_publishable_access"
  on public.activity_events for all to anon, authenticated using (true) with check (true);

alter table public.deals drop constraint if exists deals_user_id_fkey;
alter table public.deals alter column user_id drop not null;
drop policy if exists "deals_publishable_access" on public.deals;
create policy "deals_publishable_access"
  on public.deals for all to anon, authenticated using (true) with check (true);

alter table public.calendar_events drop constraint if exists calendar_events_user_id_fkey;
alter table public.calendar_events alter column user_id drop not null;
drop policy if exists "calendar_events_publishable_access" on public.calendar_events;
create policy "calendar_events_publishable_access"
  on public.calendar_events for all to anon, authenticated using (true) with check (true);
