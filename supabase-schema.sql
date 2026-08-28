-- =====================================================
-- Igloo Native — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL).
-- Prerequisites: Auth enabled, Email templates set to
-- "Magic Link" with a redirect URL of `igloo://dashboard`.
-- =====================================================

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  name       text not null,
  dob        text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Readings table
create table if not exists public.readings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  metric     text not null check (metric in ('bp', 'hr', 'ox', 'glu')),
  value      text not null,
  status     text not null check (status in ('good', 'watch', 'urgent')),
  method     text not null default 'Manual',
  at         text not null,
  created_at timestamptz not null default now()
);

-- 3. Medications table
create table if not exists public.medications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  name       text not null,
  dose       text not null,
  method     text not null default 'Logged',
  at         text not null,
  photo      boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. Family connections
create table if not exists public.family_connections (
  id            uuid primary key default gen_random_uuid(),
  inviter_id    uuid not null references auth.users on delete cascade,
  invitee_id    uuid not null references auth.users on delete cascade,
  relation      text not null default 'Family',
  created_at    timestamptz not null default now(),
  unique (inviter_id, invitee_id)
);

-- 5. Sharing permissions
create table if not exists public.sharing_permissions (
  id            uuid primary key default gen_random_uuid(),
  inviter_id    uuid not null references auth.users on delete cascade,
  family_id     uuid not null references auth.users on delete cascade,
  metric        text not null check (metric in ('bp', 'hr', 'ox', 'glu')),
  shared        boolean not null default true,
  created_at    timestamptz not null default now(),
  unique (inviter_id, family_id, metric)
);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

alter table public.profiles    enable row level security;
alter table public.readings    enable row level security;
alter table public.medications enable row level security;
alter table public.family_connections enable row level security;
alter table public.sharing_permissions enable row level security;

-- Profiles policies
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Readings: owner read/write
create policy "Owner can read own readings" on public.readings for select using (auth.uid() = user_id);
create policy "Owner can insert own readings" on public.readings for insert with check (auth.uid() = user_id);
create policy "Owner can update own readings" on public.readings for update using (auth.uid() = user_id);
create policy "Owner can delete own readings" on public.readings for delete using (auth.uid() = user_id);

-- Readings: family can read if sharing_permission exists
create policy "Family can read shared readings" on public.readings for select
  using (
    auth.uid() != user_id
    and exists (
      select 1 from public.sharing_permissions sp
      where sp.inviter_id = user_id
        and sp.family_id = auth.uid()
        and sp.metric = readings.metric
        and sp.shared = true
    )
  );

-- Medications: owner read/write
create policy "Owner can read own meds" on public.medications for select using (auth.uid() = user_id);
create policy "Owner can insert own meds" on public.medications for insert with check (auth.uid() = user_id);
create policy "Owner can update own meds" on public.medications for update using (auth.uid() = user_id);
create policy "Owner can delete own meds" on public.medications for delete using (auth.uid() = user_id);

-- Medications: family can read (all, not metric-specific)
create policy "Family can read shared meds" on public.medications for select
  using (
    auth.uid() != user_id
    and exists (
      select 1 from public.sharing_permissions sp
      where sp.inviter_id = user_id
        and sp.family_id = auth.uid()
        and sp.shared = true
    )
  );

-- Family connections: only inviter can manage
create policy "Users can manage their connections" on public.family_connections for all
  using (auth.uid() = inviter_id) with check (auth.uid() = inviter_id);

-- Sharing permissions: only inviter can manage
create policy "Users can manage their sharing" on public.sharing_permissions for all
  using (auth.uid() = inviter_id) with check (auth.uid() = inviter_id);

-- =====================================================
-- Indexes
-- =====================================================
create index if not exists idx_readings_user_id on public.readings(user_id);
create index if not exists idx_readings_at on public.readings(at desc);
create index if not exists idx_medications_user_id on public.medications(user_id);
create index if not exists idx_medications_at on public.medications(at desc);
create index if not exists idx_sharing_inviter on public.sharing_permissions(inviter_id);
create index if not exists idx_sharing_family on public.sharing_permissions(family_id);
create index if not exists idx_family_inviter on public.family_connections(inviter_id);
create index if not exists idx_family_invitee on public.family_connections(invitee_id);

-- =====================================================
-- Triggers
-- =====================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, dob)
  values (new.id, '', '');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
