-- Max OS — Supabase schema (v1)
-- Run this in the Supabase SQL Editor after creating a project.
-- Requires Supabase Auth; RLS scopes all rows to auth.uid().

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- accounts
-- ---------------------------------------------------------------------------
create table if not exists public.accounts (
  id text primary key,
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

create index if not exists accounts_user_id_idx on public.accounts (user_id);
create index if not exists accounts_business_name_idx on public.accounts (business_name);

-- ---------------------------------------------------------------------------
-- brands
-- ---------------------------------------------------------------------------
create table if not exists public.brands (
  id text primary key,
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

create index if not exists brands_user_id_idx on public.brands (user_id);
create index if not exists brands_brand_name_idx on public.brands (brand_name);

-- ---------------------------------------------------------------------------
-- brand_products (normalized from brands.products in localStorage)
-- ---------------------------------------------------------------------------
create table if not exists public.brand_products (
  id text primary key,
  brand_id text not null references public.brands (id) on delete cascade,
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

create index if not exists brand_products_brand_id_idx on public.brand_products (brand_id);
create index if not exists brand_products_user_id_idx on public.brand_products (user_id);

-- ---------------------------------------------------------------------------
-- contacts
-- ---------------------------------------------------------------------------
create table if not exists public.contacts (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  account_id text references public.accounts (id) on delete set null,
  brand_id text references public.brands (id) on delete set null,
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

create index if not exists contacts_user_id_idx on public.contacts (user_id);
create index if not exists contacts_account_id_idx on public.contacts (account_id);
create index if not exists contacts_brand_id_idx on public.contacts (brand_id);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_number text not null default '',
  account_id text not null references public.accounts (id) on delete restrict,
  brand_id text not null references public.brands (id) on delete restrict,
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

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_account_id_idx on public.orders (account_id);
create index if not exists orders_brand_id_idx on public.orders (brand_id);
create index if not exists orders_order_number_idx on public.orders (order_number);

-- ---------------------------------------------------------------------------
-- commissions (metadata keyed by order_id in localStorage)
-- ---------------------------------------------------------------------------
create table if not exists public.commissions (
  order_id text primary key references public.orders (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'Pending',
  due_date date,
  paid_date date,
  amount_manual boolean not null default false,
  amount_override numeric(12, 2),
  notes text not null default ''
);

create index if not exists commissions_user_id_idx on public.commissions (user_id);
create index if not exists commissions_status_idx on public.commissions (status);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  description text not null default '',
  type text not null default 'Other',
  priority text not null default 'Medium',
  status text not null default 'Open',
  due_date date,
  due_time text not null default '',
  account_id text references public.accounts (id) on delete set null,
  contact_id text references public.contacts (id) on delete set null,
  brand_id text references public.brands (id) on delete set null,
  order_id text references public.orders (id) on delete set null,
  notes text not null default '',
  created_at timestamptz,
  updated_at timestamptz,
  completed_at timestamptz
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_due_date_idx on public.tasks (due_date);
create index if not exists tasks_status_idx on public.tasks (status);

-- ---------------------------------------------------------------------------
-- activity_events (materialized timeline for sync / querying)
-- ---------------------------------------------------------------------------
create table if not exists public.activity_events (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null default '',
  label text not null default '',
  detail text not null default '',
  occurred_at timestamptz not null,
  link_path text not null default '',
  account_id text references public.accounts (id) on delete set null,
  contact_id text references public.contacts (id) on delete set null,
  brand_id text references public.brands (id) on delete set null,
  order_id text references public.orders (id) on delete set null,
  task_id text references public.tasks (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists activity_events_user_id_idx on public.activity_events (user_id);
create index if not exists activity_events_occurred_at_idx on public.activity_events (occurred_at desc);
create index if not exists activity_events_event_type_idx on public.activity_events (event_type);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.accounts enable row level security;
alter table public.brands enable row level security;
alter table public.brand_products enable row level security;
alter table public.contacts enable row level security;
alter table public.orders enable row level security;
alter table public.commissions enable row level security;
alter table public.tasks enable row level security;
alter table public.activity_events enable row level security;

-- accounts
create policy "accounts_select_own" on public.accounts for select using (auth.uid() = user_id);
create policy "accounts_insert_own" on public.accounts for insert with check (auth.uid() = user_id);
create policy "accounts_update_own" on public.accounts for update using (auth.uid() = user_id);
create policy "accounts_delete_own" on public.accounts for delete using (auth.uid() = user_id);

-- brands
create policy "brands_select_own" on public.brands for select using (auth.uid() = user_id);
create policy "brands_insert_own" on public.brands for insert with check (auth.uid() = user_id);
create policy "brands_update_own" on public.brands for update using (auth.uid() = user_id);
create policy "brands_delete_own" on public.brands for delete using (auth.uid() = user_id);

-- brand_products
create policy "brand_products_select_own" on public.brand_products for select using (auth.uid() = user_id);
create policy "brand_products_insert_own" on public.brand_products for insert with check (auth.uid() = user_id);
create policy "brand_products_update_own" on public.brand_products for update using (auth.uid() = user_id);
create policy "brand_products_delete_own" on public.brand_products for delete using (auth.uid() = user_id);

-- contacts
create policy "contacts_select_own" on public.contacts for select using (auth.uid() = user_id);
create policy "contacts_insert_own" on public.contacts for insert with check (auth.uid() = user_id);
create policy "contacts_update_own" on public.contacts for update using (auth.uid() = user_id);
create policy "contacts_delete_own" on public.contacts for delete using (auth.uid() = user_id);

-- orders
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "orders_insert_own" on public.orders for insert with check (auth.uid() = user_id);
create policy "orders_update_own" on public.orders for update using (auth.uid() = user_id);
create policy "orders_delete_own" on public.orders for delete using (auth.uid() = user_id);

-- commissions
create policy "commissions_select_own" on public.commissions for select using (auth.uid() = user_id);
create policy "commissions_insert_own" on public.commissions for insert with check (auth.uid() = user_id);
create policy "commissions_update_own" on public.commissions for update using (auth.uid() = user_id);
create policy "commissions_delete_own" on public.commissions for delete using (auth.uid() = user_id);

-- tasks
create policy "tasks_select_own" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks for update using (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks for delete using (auth.uid() = user_id);

-- activity_events
create policy "activity_events_select_own" on public.activity_events for select using (auth.uid() = user_id);
create policy "activity_events_insert_own" on public.activity_events for insert with check (auth.uid() = user_id);
create policy "activity_events_update_own" on public.activity_events for update using (auth.uid() = user_id);
create policy "activity_events_delete_own" on public.activity_events for delete using (auth.uid() = user_id);
