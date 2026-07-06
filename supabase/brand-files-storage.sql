-- Max OS: Brand Vault file storage
-- Run once in Supabase SQL Editor (Dashboard → SQL → New query).
--
-- Prerequisites:
--   1. schema.sql and schema-extensions.sql already applied (brands table exists)
--   2. You are signed in as a project owner
--
-- What this script does:
--   A. Creates public.brand_files metadata table
--   B. Creates a private storage bucket named "brand-files"
--   C. Adds RLS on brand_files and storage.objects for authenticated access
--
-- After running:
--   1. Confirm bucket: Dashboard → Storage → you should see "brand-files"
--   2. Reload API schema if needed: Dashboard → Settings → API → Reload schema
--   3. Sign in to Max OS, open a Brand Profile → Assets tab, upload a test PDF

create extension if not exists "pgcrypto";

-- ===========================================================================
-- 1. Metadata table
-- ===========================================================================

create table if not exists public.brand_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  brand_id uuid not null references public.brands (id) on delete cascade,
  file_name text not null default '',
  file_path text not null default '',
  file_type text not null default '',
  file_size bigint not null default 0,
  category text not null default 'Other',
  uploaded_at timestamptz not null default now(),
  notes text not null default ''
);

create index if not exists brand_files_brand_id_idx on public.brand_files (brand_id);
create index if not exists brand_files_user_id_idx on public.brand_files (user_id);
create index if not exists brand_files_uploaded_at_idx on public.brand_files (uploaded_at desc);

alter table public.brand_files enable row level security;

-- Per-user policies (when signed in)
drop policy if exists "brand_files_select_own" on public.brand_files;
drop policy if exists "brand_files_insert_own" on public.brand_files;
drop policy if exists "brand_files_update_own" on public.brand_files;
drop policy if exists "brand_files_delete_own" on public.brand_files;

create policy "brand_files_select_own"
  on public.brand_files for select
  using (auth.uid() = user_id);

create policy "brand_files_insert_own"
  on public.brand_files for insert
  with check (auth.uid() = user_id);

create policy "brand_files_update_own"
  on public.brand_files for update
  using (auth.uid() = user_id);

create policy "brand_files_delete_own"
  on public.brand_files for delete
  using (auth.uid() = user_id);

-- Publishable-key fallback (matches other Max OS tables)
alter table public.brand_files drop constraint if exists brand_files_user_id_fkey;
alter table public.brand_files alter column user_id drop not null;

drop policy if exists "brand_files_publishable_access" on public.brand_files;
create policy "brand_files_publishable_access"
  on public.brand_files
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ===========================================================================
-- 2. Storage bucket (private — use signed URLs in the app)
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-files',
  'brand-files',
  false,
  52428800, -- 50 MB per file
  null      -- allow all MIME types
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

-- Storage RLS: authenticated users can manage objects in brand-files bucket.
-- Paths are stored as: {brandId}/{filename}

drop policy if exists "brand_files_storage_select" on storage.objects;
drop policy if exists "brand_files_storage_insert" on storage.objects;
drop policy if exists "brand_files_storage_update" on storage.objects;
drop policy if exists "brand_files_storage_delete" on storage.objects;

create policy "brand_files_storage_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'brand-files');

create policy "brand_files_storage_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'brand-files');

create policy "brand_files_storage_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'brand-files');

create policy "brand_files_storage_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'brand-files');

-- ===========================================================================
-- 3. Optional metadata columns (version, featured flag, tags)
--    Safe to rerun. Existing rows keep working with defaults.
-- ===========================================================================

alter table public.brand_files add column if not exists version text not null default '';
alter table public.brand_files add column if not exists is_featured boolean not null default false;
alter table public.brand_files add column if not exists tags text[] not null default '{}';

create index if not exists brand_files_featured_idx
  on public.brand_files (brand_id, is_featured)
  where is_featured = true;
