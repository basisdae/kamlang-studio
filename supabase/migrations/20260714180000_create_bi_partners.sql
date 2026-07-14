-- =============================================================================
-- bi_partners — Shared Core Partners (one list per Business / bi_workspaces)
-- App Workspaces (Opening / Finance / …) all reference the same rows.
-- Temporary Shared Preview RLS: anon + authenticated full access (match bi_assets).
-- Run once in Supabase SQL Editor (kn-queue). Safe to re-run.
-- =============================================================================

create extension if not exists "pgcrypto";

create or replace function public.bi_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.bi_partners (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null
    references public.bi_workspaces (id) on delete cascade,
  name text not null,
  category text not null,
  contact_name text,
  phone text,
  email text,
  line_id text,
  website text,
  address text,
  notes text,
  status text not null default 'active',
  is_archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint bi_partners_category_check check (
    category in (
      'partner',
      'supplier',
      'factory',
      'agency',
      'printer',
      'investor',
      'freelancer',
      'designer',
      'contractor',
      'consultant',
      'service_provider',
      'other'
    )
  ),
  constraint bi_partners_status_check check (
    status in ('active', 'pending', 'paused')
  )
);

comment on table public.bi_partners is
  'Shared Core Partners — business-scoped via workspace_id; not App-Workspace-owned';

create index if not exists bi_partners_workspace_id_idx
  on public.bi_partners (workspace_id);
create index if not exists bi_partners_archived_idx
  on public.bi_partners (workspace_id, is_archived);
create index if not exists bi_partners_category_idx
  on public.bi_partners (workspace_id, category);

drop trigger if exists bi_partners_set_updated_at on public.bi_partners;
create trigger bi_partners_set_updated_at
  before update on public.bi_partners
  for each row execute function public.bi_set_updated_at();

alter table public.bi_partners enable row level security;

-- TEMPORARY SHARED PREVIEW POLICY — same pattern as bi_assets
drop policy if exists bi_partners_temp_anon_all on public.bi_partners;
create policy bi_partners_temp_anon_all
  on public.bi_partners for all to anon
  using (true) with check (true);
comment on policy bi_partners_temp_anon_all on public.bi_partners is
  'TEMPORARY SHARED PREVIEW — anon full access; tighten after Auth';

drop policy if exists bi_partners_temp_authenticated_all on public.bi_partners;
create policy bi_partners_temp_authenticated_all
  on public.bi_partners for all to authenticated
  using (true) with check (true);
comment on policy bi_partners_temp_authenticated_all on public.bi_partners is
  'TEMPORARY SHARED PREVIEW — authenticated full access; tighten after Auth';
