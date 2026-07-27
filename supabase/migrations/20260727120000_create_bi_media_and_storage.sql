-- =============================================================================
-- bi_media + Storage bucket bi-media — Media library (Backstore)
-- Temporary Shared Preview RLS: anon read; authenticated write (upload/delete).
-- Run once in Supabase SQL Editor (kn-queue). Safe to re-run.
-- Does NOT modify Queue tables or existing bi_* product tables beyond create-if-not-exists.
-- =============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.bi_media (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null
    references public.bi_workspaces (id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null default 0
    check (size_bytes >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid null,
  constraint bi_media_mime_check check (
    mime_type in (
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    )
  )
);

comment on table public.bi_media is
  'Media library files — business-scoped via workspace_id; not linked to menus yet';

create index if not exists bi_media_workspace_id_idx
  on public.bi_media (workspace_id);
create index if not exists bi_media_created_at_idx
  on public.bi_media (workspace_id, created_at desc);

alter table public.bi_media enable row level security;

drop policy if exists bi_media_temp_anon_select on public.bi_media;
create policy bi_media_temp_anon_select
  on public.bi_media for select to anon
  using (true);
comment on policy bi_media_temp_anon_select on public.bi_media is
  'TEMPORARY — anon read for gallery display; tighten after Auth/members';

drop policy if exists bi_media_temp_authenticated_all on public.bi_media;
create policy bi_media_temp_authenticated_all
  on public.bi_media for all to authenticated
  using (true) with check (true);
comment on policy bi_media_temp_authenticated_all on public.bi_media is
  'TEMPORARY — authenticated upload/update/delete; tighten after Auth/members';

-- Storage bucket (public read URLs for <img src>)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bi-media',
  'bi-media',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists bi_media_storage_anon_select on storage.objects;
create policy bi_media_storage_anon_select
  on storage.objects for select to anon
  using (bucket_id = 'bi-media');

drop policy if exists bi_media_storage_authenticated_all on storage.objects;
create policy bi_media_storage_authenticated_all
  on storage.objects for all to authenticated
  using (bucket_id = 'bi-media')
  with check (bucket_id = 'bi-media');
