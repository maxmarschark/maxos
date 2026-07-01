-- Max OS: allow Accounts cloud sync via publishable key when Anonymous sign-in is disabled.
-- Run once in Supabase SQL Editor after schema.sql.
--
-- This adds a permissive RLS policy (OR'd with existing policies) so the anon/publishable
-- role can read and write accounts without an auth session.

-- Optional: relax user_id FK so rows can be created without auth.users (single-user dev)
alter table public.accounts drop constraint if exists accounts_user_id_fkey;
alter table public.accounts alter column user_id drop not null;

drop policy if exists "accounts_publishable_access" on public.accounts;

create policy "accounts_publishable_access"
  on public.accounts
  for all
  to anon, authenticated
  using (true)
  with check (true);
