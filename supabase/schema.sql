-- ============================================================================
-- Satellite Pass Tracker — database schema & Row Level Security (RLS)
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query),
-- or via `supabase db push` if you use the CLI.
--
-- It is IDEMPOTENT: safe to run multiple times. It will not destroy data.
-- This file is the source of truth for the per-user data model and the
-- security policies that keep each user's saved data private.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Tables (created only if they don't already exist)
-- ----------------------------------------------------------------------------

create table if not exists public.saved_locations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  city_name  text not null,
  latitude   numeric not null,
  longitude  numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_satellites (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  satellite_id   integer not null,   -- NORAD catalog id (used later for N2YO passes)
  satellite_name text not null,
  created_at     timestamptz not null default now()
);

-- Stop a user saving the same satellite twice. Wrapped in a guard so that
-- re-running this script does not error if the constraint already exists.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'saved_satellites_user_sat_unique'
  ) then
    alter table public.saved_satellites
      add constraint saved_satellites_user_sat_unique unique (user_id, satellite_id);
  end if;
end $$;


-- ----------------------------------------------------------------------------
-- Row Level Security
-- Turn RLS on, then add policies so a user can only ever read or change
-- THEIR OWN rows. `auth.uid()` is the id of the currently logged-in user.
-- ----------------------------------------------------------------------------

alter table public.saved_locations  enable row level security;
alter table public.saved_satellites enable row level security;

-- --- saved_satellites policies ---------------------------------------------
drop policy if exists "Users can view their own satellites"   on public.saved_satellites;
drop policy if exists "Users can insert their own satellites" on public.saved_satellites;
drop policy if exists "Users can delete their own satellites" on public.saved_satellites;

create policy "Users can view their own satellites"
  on public.saved_satellites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own satellites"
  on public.saved_satellites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own satellites"
  on public.saved_satellites for delete
  using (auth.uid() = user_id);

-- --- saved_locations policies ----------------------------------------------
drop policy if exists "Users can view their own locations"   on public.saved_locations;
drop policy if exists "Users can insert their own locations" on public.saved_locations;
drop policy if exists "Users can delete their own locations" on public.saved_locations;

create policy "Users can view their own locations"
  on public.saved_locations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own locations"
  on public.saved_locations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own locations"
  on public.saved_locations for delete
  using (auth.uid() = user_id);
