-- =============================================================================
-- DEPRECATED for new installs
-- Prefer: 20260711200000_create_business_insight_foundation.sql
-- This earlier draft uses different column names (estimated_price, etc.)
-- and should NOT be run together with the foundation migration.
-- =============================================================================
-- Business Insight schema for kn-queue project
-- Prefix: bi_ only — DO NOT modify existing queue tables
-- Run in Supabase SQL Editor (once)
-- =============================================================================

create extension if not exists "pgcrypto";

-- --------------------------------------------------------------------------
-- updated_at helper
-- --------------------------------------------------------------------------
create or replace function public.bi_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- --------------------------------------------------------------------------
-- Tables
-- --------------------------------------------------------------------------
create table if not exists public.bi_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bi_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bi_workspaces(id) on delete cascade,
  display_name text not null,
  email text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, display_name)
);

create table if not exists public.bi_asset_decision_groups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bi_workspaces(id) on delete cascade,
  name text not null,
  selected_asset_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bi_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bi_workspaces(id) on delete cascade,
  name text not null,
  category text not null default 'อื่นๆ',
  brand text,
  model text,
  quantity numeric not null default 1 check (quantity > 0),
  unit text not null default 'ชิ้น',
  estimated_price numeric,
  actual_price numeric,
  supplier_name text,
  purchase_channel text,
  purchase_url text,
  priority text not null default 'must',
  status text not null default 'planned',
  purchase_date date,
  specifications jsonb not null default '{}'::jsonb,
  notes text,
  warranty_months integer,
  warranty_expires_at date,
  serial_number text,
  decision_group_id uuid references public.bi_asset_decision_groups(id) on delete set null,
  required_for_opening boolean not null default true,
  is_archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null
);

-- optional FK after bi_assets exists
alter table public.bi_asset_decision_groups
  drop constraint if exists bi_asset_decision_groups_selected_asset_id_fkey;
alter table public.bi_asset_decision_groups
  add constraint bi_asset_decision_groups_selected_asset_id_fkey
  foreign key (selected_asset_id) references public.bi_assets(id) on delete set null;

create table if not exists public.bi_asset_purchases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bi_workspaces(id) on delete cascade,
  asset_id uuid not null references public.bi_assets(id) on delete cascade,
  purchased_at date not null,
  quantity numeric not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  total numeric not null check (total >= 0),
  supplier_name text,
  recorded_by text,
  status text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.bi_asset_repairs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bi_workspaces(id) on delete cascade,
  asset_id uuid not null references public.bi_assets(id) on delete cascade,
  reported_at date not null,
  symptom text not null,
  repairer text,
  cost numeric,
  returned_at date,
  result text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.bi_asset_documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bi_workspaces(id) on delete cascade,
  asset_id uuid not null references public.bi_assets(id) on delete cascade,
  kind text not null default 'other',
  title text not null,
  url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.bi_budget_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bi_workspaces(id) on delete cascade,
  name text not null,
  category text not null,
  priority text not null default 'must',
  status text not null default 'no_price',
  estimated_price numeric,
  actual_price numeric,
  quantity numeric not null default 1,
  asset_id uuid references public.bi_assets(id) on delete set null,
  decision_group_id uuid references public.bi_asset_decision_groups(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.bi_activity_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bi_workspaces(id) on delete cascade,
  actor_name text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- --------------------------------------------------------------------------
-- Indexes
-- --------------------------------------------------------------------------
create index if not exists bi_members_workspace_idx on public.bi_members(workspace_id);
create index if not exists bi_members_user_idx on public.bi_members(user_id);
create index if not exists bi_assets_workspace_idx on public.bi_assets(workspace_id);
create index if not exists bi_assets_status_idx on public.bi_assets(workspace_id, status);
create index if not exists bi_assets_archived_idx on public.bi_assets(workspace_id, is_archived);
create index if not exists bi_asset_purchases_asset_idx on public.bi_asset_purchases(asset_id);
create index if not exists bi_asset_repairs_asset_idx on public.bi_asset_repairs(asset_id);
create index if not exists bi_budget_items_workspace_idx on public.bi_budget_items(workspace_id);
create index if not exists bi_activity_logs_workspace_idx on public.bi_activity_logs(workspace_id, created_at desc);

-- --------------------------------------------------------------------------
-- Triggers
-- --------------------------------------------------------------------------
drop trigger if exists bi_workspaces_updated_at on public.bi_workspaces;
create trigger bi_workspaces_updated_at before update on public.bi_workspaces
  for each row execute function public.bi_set_updated_at();

drop trigger if exists bi_members_updated_at on public.bi_members;
create trigger bi_members_updated_at before update on public.bi_members
  for each row execute function public.bi_set_updated_at();

drop trigger if exists bi_assets_updated_at on public.bi_assets;
create trigger bi_assets_updated_at before update on public.bi_assets
  for each row execute function public.bi_set_updated_at();

drop trigger if exists bi_asset_purchases_updated_at on public.bi_asset_purchases;
create trigger bi_asset_purchases_updated_at before update on public.bi_asset_purchases
  for each row execute function public.bi_set_updated_at();

drop trigger if exists bi_asset_repairs_updated_at on public.bi_asset_repairs;
create trigger bi_asset_repairs_updated_at before update on public.bi_asset_repairs
  for each row execute function public.bi_set_updated_at();

drop trigger if exists bi_asset_documents_updated_at on public.bi_asset_documents;
create trigger bi_asset_documents_updated_at before update on public.bi_asset_documents
  for each row execute function public.bi_set_updated_at();

drop trigger if exists bi_asset_decision_groups_updated_at on public.bi_asset_decision_groups;
create trigger bi_asset_decision_groups_updated_at before update on public.bi_asset_decision_groups
  for each row execute function public.bi_set_updated_at();

drop trigger if exists bi_budget_items_updated_at on public.bi_budget_items;
create trigger bi_budget_items_updated_at before update on public.bi_budget_items
  for each row execute function public.bi_set_updated_at();

-- --------------------------------------------------------------------------
-- RLS — equal access for authenticated (phase 1)
-- --------------------------------------------------------------------------
alter table public.bi_workspaces enable row level security;
alter table public.bi_members enable row level security;
alter table public.bi_assets enable row level security;
alter table public.bi_asset_purchases enable row level security;
alter table public.bi_asset_repairs enable row level security;
alter table public.bi_asset_documents enable row level security;
alter table public.bi_asset_decision_groups enable row level security;
alter table public.bi_budget_items enable row level security;
alter table public.bi_activity_logs enable row level security;

-- Authenticated members of any bi workspace can read/write (equal rights)
create or replace function public.bi_is_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.bi_members m
    where m.user_id = auth.uid()
  );
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'bi_workspaces','bi_members','bi_assets','bi_asset_purchases',
    'bi_asset_repairs','bi_asset_documents','bi_asset_decision_groups',
    'bi_budget_items','bi_activity_logs'
  ]
  loop
    execute format('drop policy if exists bi_%s_select on public.%I', t, t);
    execute format('drop policy if exists bi_%s_write on public.%I', t, t);
    execute format(
      'create policy bi_%s_select on public.%I for select to authenticated using (public.bi_is_member() or true)',
      t, t
    );
    -- Phase 1: authenticated can mutate; tighten later with workspace membership checks
    execute format(
      'create policy bi_%s_write on public.%I for all to authenticated using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')',
      t, t
    );
  end loop;
end $$;

-- Allow anon read for connection check / public seed preview (optional)
drop policy if exists bi_workspaces_anon_select on public.bi_workspaces;
create policy bi_workspaces_anon_select on public.bi_workspaces
  for select to anon using (true);

-- --------------------------------------------------------------------------
-- Realtime (ignore if already added)
-- --------------------------------------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.bi_assets;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.bi_asset_purchases;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.bi_asset_repairs;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.bi_budget_items;
exception when duplicate_object then null;
end $$;

-- --------------------------------------------------------------------------
-- Seed: workspace ตั้งเตา + members + assets
-- Fixed UUIDs for stable client mapping
-- --------------------------------------------------------------------------
insert into public.bi_workspaces (id, name, slug)
values ('11111111-1111-1111-1111-111111111111', 'ตั้งเตา', 'tangtao')
on conflict (slug) do update set name = excluded.name;

insert into public.bi_members (workspace_id, display_name, email) values
  ('11111111-1111-1111-1111-111111111111', 'เดย์', 'day@tangtao.local'),
  ('11111111-1111-1111-1111-111111111111', 'ครีม', 'cream@tangtao.local'),
  ('11111111-1111-1111-1111-111111111111', 'เก็ต', 'gate@tangtao.local'),
  ('11111111-1111-1111-1111-111111111111', 'เหมียว', 'meow@tangtao.local')
on conflict (workspace_id, display_name) do nothing;

insert into public.bi_asset_decision_groups (id, workspace_id, name, selected_asset_id)
values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'POS', null)
on conflict (id) do nothing;

-- Seed assets (subset of Tang Tao kit — expand via app import if needed)
insert into public.bi_assets (
  id, workspace_id, name, category, brand, model, quantity, unit,
  estimated_price, actual_price, supplier_name, purchase_channel, purchase_url,
  priority, status, purchase_date, specifications, notes, warranty_months,
  warranty_expires_at, serial_number, decision_group_id, required_for_opening
) values
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  '11111111-1111-1111-1111-111111111111',
  'เตาโตเกียว', 'อุปกรณ์ทำอาหาร', 'Tokyo', 'TK-2H', 1, 'เครื่อง',
  4500, 4200, 'ร้านแก๊สบ้านโป่ง', 'store', null,
  'must', 'in_use', '2026-07-10',
  '{"size":"2 หัว","specs":"ใช้ถังแก๊ส"}'::jsonb,
  'ติดตั้งแล้ว', 12, '2027-07-10', 'TG-2H-88421', null, true
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
  '11111111-1111-1111-1111-111111111111',
  'ถังแก๊ส 15 กก.', 'อุปกรณ์ทำอาหาร', 'PTT', '15kg', 2, 'ใบ',
  1800, 1650, 'ร้านแก๊สบ้านโป่ง', 'store', null,
  'must', 'received', '2026-07-10',
  '{"size":"15 กก."}'::jsonb,
  'ซื้อคู่กับเตา', null, null, null, null, true
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
  '11111111-1111-1111-1111-111111111111',
  'SUNMI D3 Mini', 'ระบบและ POS', 'SUNMI', 'D3 Mini', 1, 'เครื่อง',
  12500, null, 'SmartPOS โคราช', 'online', 'https://example.com/sunmi-mini',
  'must', 'ready_to_buy', null,
  '{"specs":"จอเล็ก · พิมพ์ในตัว"}'::jsonb,
  'ตัวเลือก A', 12, null, null,
  '22222222-2222-2222-2222-222222222222', true
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02',
  '11111111-1111-1111-1111-111111111111',
  'SUNMI D3 15.6 นิ้ว', 'ระบบและ POS', 'SUNMI', 'D3 15.6', 1, 'เครื่อง',
  16800, null, 'SmartPOS โคราช', 'online', 'https://example.com/sunmi-156',
  'must', 'ready_to_buy', null,
  '{"size":"15.6 นิ้ว"}'::jsonb,
  'ตัวเลือก B', 12, null, null,
  '22222222-2222-2222-2222-222222222222', true
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
  '11111111-1111-1111-1111-111111111111',
  'ตู้โชว์กระจก', 'ตู้และการจัดเก็บ', 'ColdGold', 'CG-120', 1, 'เครื่อง',
  12000, null, 'ร้านตู้เย็นทอง', 'store', null,
  'must', 'awaiting_quote', null,
  '{"size":"120 ซม.","material":"กระจกใส"}'::jsonb,
  'รอใบเสนอราคา', null, null, null, null, true
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
  '11111111-1111-1111-1111-111111111111',
  'ตะกร้อมือ', 'ของใช้ในครัว', null, null, 3, 'ชิ้น',
  120, null, 'Makro', 'store', null,
  'should', 'ready_to_buy', null, '{}'::jsonb, null, null, null, null, null, true
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
  '11111111-1111-1111-1111-111111111111',
  'เครื่องตีไฟฟ้า', 'เครื่องใช้ไฟฟ้า', null, null, 1, 'เครื่อง',
  1890, null, 'Shopee', 'marketplace', null,
  'must', 'ready_to_buy', null, '{}'::jsonb, null, null, null, null, null, true
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6',
  '11111111-1111-1111-1111-111111111111',
  'กระชอน', 'ของใช้ในครัว', null, null, 2, 'ชิ้น',
  89, null, 'Makro', 'store', null,
  'should', 'planned', null, '{}'::jsonb, null, null, null, null, null, true
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7',
  '11111111-1111-1111-1111-111111111111',
  'เครื่องชั่งดิจิตอล', 'เครื่องใช้ไฟฟ้า', null, null, 1, 'เครื่อง',
  450, 420, 'Shopee', 'marketplace', null,
  'must', 'in_use', '2026-07-05',
  '{}'::jsonb, null, 6, null, null, null, true
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8',
  '11111111-1111-1111-1111-111111111111',
  'ป้ายร้าน ตั้งเตา', 'หน้าร้านและป้าย', null, null, 1, 'ชุด',
  null, null, null, null, null,
  'must', 'planned', null, '{}'::jsonb, 'ยังไม่หาราคา', null, null, null, null, true
)
on conflict (id) do nothing;

insert into public.bi_budget_items (
  workspace_id, name, category, priority, status, estimated_price, actual_price, quantity, asset_id, decision_group_id
) values
  ('11111111-1111-1111-1111-111111111111', 'เตาโตเกียว', 'อุปกรณ์ทำอาหาร', 'must', 'installed', 4500, 4200, 1, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', null),
  ('11111111-1111-1111-1111-111111111111', 'ถังแก๊ส 15 กก.', 'อุปกรณ์ทำอาหาร', 'must', 'purchased', 1800, 1650, 2, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', null),
  ('11111111-1111-1111-1111-111111111111', 'ตู้โชว์กระจก', 'ตู้และการจัดเก็บ', 'must', 'comparing', 12000, null, 1, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', null),
  ('11111111-1111-1111-1111-111111111111', 'POS (เลือก 1 รุ่น)', 'ระบบและ POS', 'must', 'ready_to_buy', 12500, null, 1, null, '22222222-2222-2222-2222-222222222222'),
  ('11111111-1111-1111-1111-111111111111', 'ป้ายร้าน ตั้งเตา', 'หน้าร้านและป้าย', 'must', 'no_price', null, null, 1, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8', null);

notify pgrst, 'reload schema';
