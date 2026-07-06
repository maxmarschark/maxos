-- Order line items + order totals columns
-- Run in Supabase SQL editor after schema.sql / schema-extensions.sql

create table if not exists public.order_items (
  id uuid primary key,
  user_id uuid references auth.users (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  brand_id uuid references public.brands (id) on delete set null,
  product_id uuid references public.brand_products (id) on delete set null,
  product_name text not null default '',
  sku text not null default '',
  quantity numeric(12, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  price_type text not null default 'Distributor Price',
  line_total numeric(12, 2) not null default 0,
  created_at timestamptz,
  updated_at timestamptz
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_user_id_idx on public.order_items (user_id);
create index if not exists order_items_brand_id_idx on public.order_items (brand_id);

alter table public.orders add column if not exists subtotal_amount numeric(12, 2) not null default 0;
alter table public.orders add column if not exists discount_amount numeric(12, 2) not null default 0;

alter table public.order_items enable row level security;

drop policy if exists "order_items_publishable_access" on public.order_items;
create policy "order_items_publishable_access"
  on public.order_items for all to anon, authenticated using (true) with check (true);
