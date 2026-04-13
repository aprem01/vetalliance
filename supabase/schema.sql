-- VetAlliance — Supabase schema + RLS
-- Run this after creating a new Supabase project.

create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles: one row per authenticated user
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text check (role in ('SDVOSB','VOSB','Prime','Agency')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles: self-read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles: self-upsert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles: self-update"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- companies
-- ============================================================
create table if not exists public.companies (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  role text check (role in ('SDVOSB','VOSB','Prime','Agency')),
  uei text,
  cage text,
  naics text[],
  state text,
  capabilities text[],
  bio text,
  created_at timestamptz default now()
);

alter table public.companies enable row level security;

create policy "Companies: read all" on public.companies for select using (true);
create policy "Companies: owner insert" on public.companies for insert with check (auth.uid() = owner_id);
create policy "Companies: owner update" on public.companies for update using (auth.uid() = owner_id);
create policy "Companies: owner delete" on public.companies for delete using (auth.uid() = owner_id);

-- ============================================================
-- opportunities (cached snapshot; SAM.gov sync lives elsewhere)
-- ============================================================
create table if not exists public.opportunities (
  id uuid primary key default uuid_generate_v4(),
  solicitation_number text unique,
  title text not null,
  agency text,
  sub_agency text,
  set_aside text,
  naics text,
  value_low bigint,
  value_high bigint,
  deadline date,
  posted_date date,
  description text,
  location text,
  incumbent text,
  ai_score integer,
  created_at timestamptz default now()
);

alter table public.opportunities enable row level security;
create policy "Opportunities: read all" on public.opportunities for select using (true);

-- ============================================================
-- teaming_requests
-- ============================================================
create table if not exists public.teaming_requests (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid references auth.users(id) on delete cascade,
  opportunity_title text not null,
  role text check (role in ('Prime Seeking Sub','Sub Seeking Prime')),
  agency text,
  naics text,
  needed_capabilities text[],
  value_estimate bigint,
  deadline date,
  created_at timestamptz default now()
);

alter table public.teaming_requests enable row level security;
create policy "Teaming: read all" on public.teaming_requests for select using (true);
create policy "Teaming: requester insert" on public.teaming_requests for insert with check (auth.uid() = requester_id);
create policy "Teaming: requester update" on public.teaming_requests for update using (auth.uid() = requester_id);
create policy "Teaming: requester delete" on public.teaming_requests for delete using (auth.uid() = requester_id);

-- ============================================================
-- pipeline_items
-- ============================================================
create table if not exists public.pipeline_items (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade,
  opportunity_title text not null,
  agency text,
  stage text check (stage in ('Prospect','Outreach','NDA','Teaming Agreement','Proposal','Award')),
  value bigint,
  probability integer,
  next_action text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.pipeline_items enable row level security;
create policy "Pipeline: owner read" on public.pipeline_items for select using (auth.uid() = owner_id);
create policy "Pipeline: owner insert" on public.pipeline_items for insert with check (auth.uid() = owner_id);
create policy "Pipeline: owner update" on public.pipeline_items for update using (auth.uid() = owner_id);
create policy "Pipeline: owner delete" on public.pipeline_items for delete using (auth.uid() = owner_id);

-- ============================================================
-- documents (generated outputs)
-- ============================================================
create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade,
  doc_type text,
  content text,
  created_at timestamptz default now()
);

alter table public.documents enable row level security;
create policy "Docs: owner read" on public.documents for select using (auth.uid() = owner_id);
create policy "Docs: owner insert" on public.documents for insert with check (auth.uid() = owner_id);
create policy "Docs: owner delete" on public.documents for delete using (auth.uid() = owner_id);

-- ============================================================
-- advisor_messages (optional persistence for chat)
-- ============================================================
create table if not exists public.advisor_messages (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('user','assistant')),
  content text,
  created_at timestamptz default now()
);

alter table public.advisor_messages enable row level security;
create policy "Advisor: owner read" on public.advisor_messages for select using (auth.uid() = owner_id);
create policy "Advisor: owner insert" on public.advisor_messages for insert with check (auth.uid() = owner_id);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
