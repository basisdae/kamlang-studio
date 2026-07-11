-- =============================================================================
-- Business Insight Foundation Migration (FIXED — re-runnable)
-- Project: kn-queue (shared Supabase — DO NOT touch Queue tables)
-- Scope: equipment (assets) + budget foundation for workspace ตั้งเตา
-- Auth: not in this migration
-- Prefix: bi_ tables only · future storage buckets use bi-
--
-- Prefer THIS file over 20260711200000_* (invalid UUID "…00pos").
-- Safe to re-run in full after a partial success:
--   create if not exists · drop policy/trigger if exists · seed ON CONFLICT
-- Does NOT drop bi_* tables, bi_* rows, or any Queue tables.
--
-- Seed UUID map (hex 0-9 a-f only — no words like pos/asset):
--   workspace          11111111-1111-1111-1111-111111111111
--   decision group POS 22222222-2222-2222-2222-222222222201
--   assets             aaaaaaaa-…-0001…0015, …00a1, …00a2
--   purchases          bbbbbbbb-…-0001, 0002
--   budget             cccccccc-…-0001…0003, 0010 (POS line), 0008
--   activity seed      dddddddd-dddd-dddd-dddd-dddddddd0001
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Section: shared updated_at trigger function
-- -----------------------------------------------------------------------------
create or replace function public.bi_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

comment on function public.bi_set_updated_at() is
  'Business Insight — sets updated_at on row update (bi_* tables only)';

-- -----------------------------------------------------------------------------
-- Section: bi_workspaces
-- -----------------------------------------------------------------------------
create table if not exists public.bi_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  status text not null default 'opening'
    check (status in ('draft', 'opening', 'open', 'paused', 'closed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint bi_workspaces_slug_unique unique (slug)
);

comment on table public.bi_workspaces is
  'Business Insight workspaces (e.g. ตั้งเตา). Isolated from Queue schema.';

drop trigger if exists bi_workspaces_set_updated_at on public.bi_workspaces;
create trigger bi_workspaces_set_updated_at
  before update on public.bi_workspaces
  for each row execute function public.bi_set_updated_at();

-- -----------------------------------------------------------------------------
-- Section: bi_asset_decision_groups
-- (created before bi_assets so assets can reference the group)
-- selected_asset_id FK is added after bi_assets exists
-- -----------------------------------------------------------------------------
create table if not exists public.bi_asset_decision_groups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null
    references public.bi_workspaces (id) on delete cascade,
  name text not null,
  selection_mode text not null default 'single'
    check (selection_mode in ('single', 'multi')),
  selected_asset_id uuid null,
  notes text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.bi_asset_decision_groups is
  'Pick-one (or multi) equipment options, e.g. POS models — do not sum all options into budget.';

create index if not exists bi_asset_decision_groups_workspace_id_idx
  on public.bi_asset_decision_groups (workspace_id);

drop trigger if exists bi_asset_decision_groups_set_updated_at
  on public.bi_asset_decision_groups;
create trigger bi_asset_decision_groups_set_updated_at
  before update on public.bi_asset_decision_groups
  for each row execute function public.bi_set_updated_at();

-- -----------------------------------------------------------------------------
-- Section: bi_assets
-- -----------------------------------------------------------------------------
create table if not exists public.bi_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null
    references public.bi_workspaces (id) on delete cascade,
  name text not null,
  category text not null,
  brand text null,
  model text null,
  quantity numeric not null default 1
    check (quantity > 0),
  unit text not null default 'ชิ้น',
  estimated_unit_price numeric null
    check (estimated_unit_price is null or estimated_unit_price >= 0),
  actual_unit_price numeric null
    check (actual_unit_price is null or actual_unit_price >= 0),
  supplier_name text null,
  purchase_channel text null
    check (
      purchase_channel is null
      or purchase_channel in ('store', 'online', 'marketplace', 'other')
    ),
  purchase_url text null,
  priority text not null default 'must'
    check (priority in ('must', 'should', 'nice')),
  status text not null default 'planned'
    check (
      status in (
        'planned',
        'awaiting_quote',
        'ready_to_buy',
        'ordered',
        'awaiting_delivery',
        'received',
        'in_use',
        'repairing',
        'broken',
        'retired'
      )
    ),
  purchase_date date null,
  specifications jsonb not null default '{}'::jsonb,
  notes text null,
  warranty_months integer null
    check (warranty_months is null or warranty_months >= 0),
  warranty_expires_at date null,
  serial_number text null,
  decision_group_id uuid null
    references public.bi_asset_decision_groups (id) on delete set null,
  is_archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.bi_assets is
  'Business Insight equipment / assets catalog per workspace.';

create index if not exists bi_assets_workspace_id_idx
  on public.bi_assets (workspace_id);
create index if not exists bi_assets_status_idx
  on public.bi_assets (workspace_id, status);
create index if not exists bi_assets_decision_group_id_idx
  on public.bi_assets (decision_group_id);
create index if not exists bi_assets_archived_idx
  on public.bi_assets (workspace_id, is_archived);

drop trigger if exists bi_assets_set_updated_at on public.bi_assets;
create trigger bi_assets_set_updated_at
  before update on public.bi_assets
  for each row execute function public.bi_set_updated_at();

-- selected_asset_id → bi_assets (deferred FK)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bi_asset_decision_groups_selected_asset_id_fkey'
  ) then
    alter table public.bi_asset_decision_groups
      add constraint bi_asset_decision_groups_selected_asset_id_fkey
      foreign key (selected_asset_id)
      references public.bi_assets (id)
      on delete set null;
  end if;
end $$;

create index if not exists bi_asset_decision_groups_selected_asset_id_idx
  on public.bi_asset_decision_groups (selected_asset_id);

-- -----------------------------------------------------------------------------
-- Section: bi_asset_purchases (purchase rounds — never overwrite prior rounds)
-- -----------------------------------------------------------------------------
create table if not exists public.bi_asset_purchases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null
    references public.bi_workspaces (id) on delete cascade,
  asset_id uuid not null
    references public.bi_assets (id) on delete cascade,
  quantity numeric not null
    check (quantity > 0),
  unit_price numeric not null
    check (unit_price >= 0),
  total_price numeric not null
    check (total_price >= 0),
  supplier_name text null,
  purchase_channel text null
    check (
      purchase_channel is null
      or purchase_channel in ('store', 'online', 'marketplace', 'other')
    ),
  purchase_url text null,
  purchase_date date null,
  status text null
    check (
      status is null
      or status in (
        'planned',
        'awaiting_quote',
        'ready_to_buy',
        'ordered',
        'awaiting_delivery',
        'received',
        'in_use',
        'repairing',
        'broken',
        'retired'
      )
    ),
  notes text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.bi_asset_purchases is
  'Purchase history rounds for an asset. Buying more appends a row; does not overwrite.';

create index if not exists bi_asset_purchases_workspace_id_idx
  on public.bi_asset_purchases (workspace_id);
create index if not exists bi_asset_purchases_asset_id_idx
  on public.bi_asset_purchases (asset_id);
create index if not exists bi_asset_purchases_status_idx
  on public.bi_asset_purchases (status);

drop trigger if exists bi_asset_purchases_set_updated_at on public.bi_asset_purchases;
create trigger bi_asset_purchases_set_updated_at
  before update on public.bi_asset_purchases
  for each row execute function public.bi_set_updated_at();

-- -----------------------------------------------------------------------------
-- Section: bi_asset_repairs
-- -----------------------------------------------------------------------------
create table if not exists public.bi_asset_repairs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null
    references public.bi_workspaces (id) on delete cascade,
  asset_id uuid not null
    references public.bi_assets (id) on delete cascade,
  reported_at date not null,
  problem text not null,
  repair_provider text null,
  repair_cost numeric null
    check (repair_cost is null or repair_cost >= 0),
  returned_at date null,
  result text null,
  notes text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.bi_asset_repairs is
  'Repair history for equipment assets.';

create index if not exists bi_asset_repairs_workspace_id_idx
  on public.bi_asset_repairs (workspace_id);
create index if not exists bi_asset_repairs_asset_id_idx
  on public.bi_asset_repairs (asset_id);

drop trigger if exists bi_asset_repairs_set_updated_at on public.bi_asset_repairs;
create trigger bi_asset_repairs_set_updated_at
  before update on public.bi_asset_repairs
  for each row execute function public.bi_set_updated_at();

-- -----------------------------------------------------------------------------
-- Section: bi_budget_items
-- -----------------------------------------------------------------------------
create table if not exists public.bi_budget_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null
    references public.bi_workspaces (id) on delete cascade,
  asset_id uuid null
    references public.bi_assets (id) on delete set null,
  decision_group_id uuid null
    references public.bi_asset_decision_groups (id) on delete set null,
  name text not null,
  category text null,
  planned_amount numeric null
    check (planned_amount is null or planned_amount >= 0),
  actual_amount numeric null
    check (actual_amount is null or actual_amount >= 0),
  priority text null
    check (priority is null or priority in ('must', 'should', 'nice')),
  status text null
    check (
      status is null
      or status in (
        'no_price',
        'comparing',
        'ready_to_buy',
        'purchased',
        'awaiting_delivery',
        'received',
        'installed'
      )
    ),
  notes text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint bi_budget_items_link_check check (
    not (
      asset_id is not null
      and decision_group_id is not null
    )
  )
);

comment on table public.bi_budget_items is
  'Budget lines. Link either asset_id OR decision_group_id (pick-one), not both.';

create index if not exists bi_budget_items_workspace_id_idx
  on public.bi_budget_items (workspace_id);
create index if not exists bi_budget_items_asset_id_idx
  on public.bi_budget_items (asset_id);
create index if not exists bi_budget_items_decision_group_id_idx
  on public.bi_budget_items (decision_group_id);
create index if not exists bi_budget_items_status_idx
  on public.bi_budget_items (workspace_id, status);

drop trigger if exists bi_budget_items_set_updated_at on public.bi_budget_items;
create trigger bi_budget_items_set_updated_at
  before update on public.bi_budget_items
  for each row execute function public.bi_set_updated_at();

-- -----------------------------------------------------------------------------
-- Section: bi_activity_logs
-- -----------------------------------------------------------------------------
create table if not exists public.bi_activity_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null
    references public.bi_workspaces (id) on delete cascade,
  entity_type text not null,
  entity_id uuid null,
  action text not null,
  actor_name text null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.bi_activity_logs is
  'Append-only activity feed for Business Insight entities.';

create index if not exists bi_activity_logs_workspace_id_idx
  on public.bi_activity_logs (workspace_id, created_at desc);
create index if not exists bi_activity_logs_entity_idx
  on public.bi_activity_logs (entity_type, entity_id);

-- -----------------------------------------------------------------------------
-- Section: RLS — TEMPORARY SHARED PREVIEW POLICY (anon full access on bi_*)
-- Replace with authenticated + membership policies before production.
-- Does NOT apply to Queue tables.
-- -----------------------------------------------------------------------------
alter table public.bi_workspaces enable row level security;
alter table public.bi_assets enable row level security;
alter table public.bi_asset_purchases enable row level security;
alter table public.bi_asset_repairs enable row level security;
alter table public.bi_asset_decision_groups enable row level security;
alter table public.bi_budget_items enable row level security;
alter table public.bi_activity_logs enable row level security;

-- TEMPORARY SHARED PREVIEW POLICY — bi_workspaces
drop policy if exists bi_workspaces_temp_anon_all on public.bi_workspaces;
create policy bi_workspaces_temp_anon_all
  on public.bi_workspaces
  for all
  to anon
  using (true)
  with check (true);
comment on policy bi_workspaces_temp_anon_all on public.bi_workspaces is
  'TEMPORARY SHARED PREVIEW POLICY — anon CRUD; replace with auth later';

drop policy if exists bi_workspaces_temp_authenticated_all on public.bi_workspaces;
create policy bi_workspaces_temp_authenticated_all
  on public.bi_workspaces
  for all
  to authenticated
  using (true)
  with check (true);
comment on policy bi_workspaces_temp_authenticated_all on public.bi_workspaces is
  'TEMPORARY SHARED PREVIEW POLICY — authenticated CRUD; tighten later';

-- TEMPORARY SHARED PREVIEW POLICY — bi_assets
drop policy if exists bi_assets_temp_anon_all on public.bi_assets;
create policy bi_assets_temp_anon_all
  on public.bi_assets for all to anon using (true) with check (true);
comment on policy bi_assets_temp_anon_all on public.bi_assets is
  'TEMPORARY SHARED PREVIEW POLICY — anon CRUD; replace with auth later';

drop policy if exists bi_assets_temp_authenticated_all on public.bi_assets;
create policy bi_assets_temp_authenticated_all
  on public.bi_assets for all to authenticated using (true) with check (true);
comment on policy bi_assets_temp_authenticated_all on public.bi_assets is
  'TEMPORARY SHARED PREVIEW POLICY — authenticated CRUD; tighten later';

-- TEMPORARY SHARED PREVIEW POLICY — bi_asset_purchases
drop policy if exists bi_asset_purchases_temp_anon_all on public.bi_asset_purchases;
create policy bi_asset_purchases_temp_anon_all
  on public.bi_asset_purchases for all to anon using (true) with check (true);
comment on policy bi_asset_purchases_temp_anon_all on public.bi_asset_purchases is
  'TEMPORARY SHARED PREVIEW POLICY — anon CRUD; replace with auth later';

drop policy if exists bi_asset_purchases_temp_authenticated_all on public.bi_asset_purchases;
create policy bi_asset_purchases_temp_authenticated_all
  on public.bi_asset_purchases for all to authenticated using (true) with check (true);
comment on policy bi_asset_purchases_temp_authenticated_all on public.bi_asset_purchases is
  'TEMPORARY SHARED PREVIEW POLICY — authenticated CRUD; tighten later';

-- TEMPORARY SHARED PREVIEW POLICY — bi_asset_repairs
drop policy if exists bi_asset_repairs_temp_anon_all on public.bi_asset_repairs;
create policy bi_asset_repairs_temp_anon_all
  on public.bi_asset_repairs for all to anon using (true) with check (true);
comment on policy bi_asset_repairs_temp_anon_all on public.bi_asset_repairs is
  'TEMPORARY SHARED PREVIEW POLICY — anon CRUD; replace with auth later';

drop policy if exists bi_asset_repairs_temp_authenticated_all on public.bi_asset_repairs;
create policy bi_asset_repairs_temp_authenticated_all
  on public.bi_asset_repairs for all to authenticated using (true) with check (true);
comment on policy bi_asset_repairs_temp_authenticated_all on public.bi_asset_repairs is
  'TEMPORARY SHARED PREVIEW POLICY — authenticated CRUD; tighten later';

-- TEMPORARY SHARED PREVIEW POLICY — bi_asset_decision_groups
drop policy if exists bi_asset_decision_groups_temp_anon_all
  on public.bi_asset_decision_groups;
create policy bi_asset_decision_groups_temp_anon_all
  on public.bi_asset_decision_groups for all to anon using (true) with check (true);
comment on policy bi_asset_decision_groups_temp_anon_all
  on public.bi_asset_decision_groups is
  'TEMPORARY SHARED PREVIEW POLICY — anon CRUD; replace with auth later';

drop policy if exists bi_asset_decision_groups_temp_authenticated_all
  on public.bi_asset_decision_groups;
create policy bi_asset_decision_groups_temp_authenticated_all
  on public.bi_asset_decision_groups
  for all to authenticated using (true) with check (true);
comment on policy bi_asset_decision_groups_temp_authenticated_all
  on public.bi_asset_decision_groups is
  'TEMPORARY SHARED PREVIEW POLICY — authenticated CRUD; tighten later';

-- TEMPORARY SHARED PREVIEW POLICY — bi_budget_items
drop policy if exists bi_budget_items_temp_anon_all on public.bi_budget_items;
create policy bi_budget_items_temp_anon_all
  on public.bi_budget_items for all to anon using (true) with check (true);
comment on policy bi_budget_items_temp_anon_all on public.bi_budget_items is
  'TEMPORARY SHARED PREVIEW POLICY — anon CRUD; replace with auth later';

drop policy if exists bi_budget_items_temp_authenticated_all on public.bi_budget_items;
create policy bi_budget_items_temp_authenticated_all
  on public.bi_budget_items for all to authenticated using (true) with check (true);
comment on policy bi_budget_items_temp_authenticated_all on public.bi_budget_items is
  'TEMPORARY SHARED PREVIEW POLICY — authenticated CRUD; tighten later';

-- TEMPORARY SHARED PREVIEW POLICY — bi_activity_logs
drop policy if exists bi_activity_logs_temp_anon_all on public.bi_activity_logs;
create policy bi_activity_logs_temp_anon_all
  on public.bi_activity_logs for all to anon using (true) with check (true);
comment on policy bi_activity_logs_temp_anon_all on public.bi_activity_logs is
  'TEMPORARY SHARED PREVIEW POLICY — anon CRUD; replace with auth later';

drop policy if exists bi_activity_logs_temp_authenticated_all on public.bi_activity_logs;
create policy bi_activity_logs_temp_authenticated_all
  on public.bi_activity_logs for all to authenticated using (true) with check (true);
comment on policy bi_activity_logs_temp_authenticated_all on public.bi_activity_logs is
  'TEMPORARY SHARED PREVIEW POLICY — authenticated CRUD; tighten later';

-- -----------------------------------------------------------------------------
-- Section: seed — workspace ตั้งเตา + assets + POS decision group
-- Fixed UUIDs for stable re-runs (idempotent via ON CONFLICT)
-- -----------------------------------------------------------------------------

-- Workspace
insert into public.bi_workspaces (id, name, slug, status)
values (
  '11111111-1111-1111-1111-111111111111',
  'ตั้งเตา',
  'tangtao',
  'opening'
)
on conflict (slug) do update
set
  name = excluded.name,
  status = excluded.status,
  updated_at = timezone('utc', now());

-- Decision group: เลือกเครื่อง POS (pick exactly one — do not sum both prices)
insert into public.bi_asset_decision_groups (
  id, workspace_id, name, selection_mode, selected_asset_id, notes
)
values (
  '22222222-2222-2222-2222-222222222201',
  '11111111-1111-1111-1111-111111111111',
  'เลือกเครื่อง POS',
  'single',
  null,
  'เลือกได้ 1 รุ่นระหว่าง SUNMI D3 Mini และ SUNMI D3 15.6 นิ้ว — ห้ามนับราคารวมทั้งสองรุ่น'
)
on conflict (id) do update
set
  name = excluded.name,
  selection_mode = excluded.selection_mode,
  notes = excluded.notes,
  updated_at = timezone('utc', now());

-- Assets (Tang Tao opening kit)
insert into public.bi_assets (
  id, workspace_id, name, category, brand, model, quantity, unit,
  estimated_unit_price, actual_unit_price, supplier_name, purchase_channel,
  purchase_url, priority, status, purchase_date, specifications, notes,
  warranty_months, warranty_expires_at, serial_number, decision_group_id, is_archived
) values
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
  '11111111-1111-1111-1111-111111111111',
  'เตาโตเกียว', 'อุปกรณ์ทำอาหาร', 'Tokyo', 'TK-2H', 1, 'เครื่อง',
  4500, 4200, 'ร้านแก๊สบ้านโป่ง', 'store', null,
  'must', 'in_use', '2026-07-10',
  '{"size":"2 หัว","specs":"ใช้ถังแก๊ส"}'::jsonb,
  'ติดตั้งแล้ว · ใช้กับถังแก๊ส 15 กก.', 12, '2027-07-10', 'TG-2H-88421', null, false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
  '11111111-1111-1111-1111-111111111111',
  'ถังแก๊ส 15 กก.', 'อุปกรณ์ทำอาหาร', 'PTT', '15kg', 2, 'ใบ',
  1800, 1650, 'ร้านแก๊สบ้านโป่ง', 'store', null,
  'must', 'received', '2026-07-10',
  '{"size":"15 กก."}'::jsonb,
  'ซื้อคู่กับเตาโตเกียว', null, null, null, null, false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa00a1',
  '11111111-1111-1111-1111-111111111111',
  'SUNMI D3 Mini', 'ระบบและ POS', 'SUNMI', 'D3 Mini', 1, 'เครื่อง',
  12500, null, 'SmartPOS โคราช', 'online', 'https://example.com/sunmi-mini',
  'must', 'ready_to_buy', null,
  '{"specs":"จอเล็ก · พิมพ์ในตัว"}'::jsonb,
  'ตัวเลือก A ในกลุ่มเลือกเครื่อง POS', 12, null, null,
  '22222222-2222-2222-2222-222222222201', false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa00a2',
  '11111111-1111-1111-1111-111111111111',
  'SUNMI D3 15.6 นิ้ว', 'ระบบและ POS', 'SUNMI', 'D3 15.6', 1, 'เครื่อง',
  16800, null, 'SmartPOS โคราช', 'online', 'https://example.com/sunmi-156',
  'must', 'ready_to_buy', null,
  '{"size":"15.6 นิ้ว"}'::jsonb,
  'ตัวเลือก B ในกลุ่มเลือกเครื่อง POS', 12, null, null,
  '22222222-2222-2222-2222-222222222201', false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003',
  '11111111-1111-1111-1111-111111111111',
  'ตู้โชว์กระจก', 'ตู้และการจัดเก็บ', 'ColdGold', 'CG-120', 1, 'เครื่อง',
  12000, null, 'ร้านตู้เย็นทอง', 'store', null,
  'must', 'awaiting_quote', null,
  '{"size":"120 ซม.","material":"กระจกใส"}'::jsonb,
  'รอใบเสนอราคา', null, null, null, null, false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004',
  '11111111-1111-1111-1111-111111111111',
  'ตะกร้อมือ', 'ของใช้ในครัว', null, null, 3, 'ชิ้น',
  120, null, 'Makro', 'store', null,
  'should', 'ready_to_buy', null, '{}'::jsonb, null, null, null, null, null, false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005',
  '11111111-1111-1111-1111-111111111111',
  'เครื่องตีไฟฟ้า', 'เครื่องใช้ไฟฟ้า', null, null, 1, 'เครื่อง',
  1890, null, 'Shopee', 'marketplace', null,
  'must', 'ready_to_buy', null, '{}'::jsonb, null, null, null, null, null, false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006',
  '11111111-1111-1111-1111-111111111111',
  'กระชอน', 'ของใช้ในครัว', null, null, 2, 'ชิ้น',
  89, null, 'Makro', 'store', null,
  'should', 'planned', null, '{}'::jsonb, null, null, null, null, null, false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007',
  '11111111-1111-1111-1111-111111111111',
  'เครื่องชั่งดิจิตอล', 'เครื่องใช้ไฟฟ้า', null, null, 1, 'เครื่อง',
  450, 420, 'Shopee', 'marketplace', null,
  'must', 'in_use', '2026-07-05', '{}'::jsonb, null, 6, null, null, null, false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0008',
  '11111111-1111-1111-1111-111111111111',
  'พายยาง', 'ของใช้ในครัว', null, null, 4, 'ชิ้น',
  45, null, 'Makro', 'store', null,
  'should', 'ready_to_buy', null, '{}'::jsonb, null, null, null, null, null, false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0009',
  '11111111-1111-1111-1111-111111111111',
  'ชามผสม', 'ของใช้ในครัว', null, null, 6, 'ใบ',
  65, null, 'Makro', 'store', null,
  'must', 'ready_to_buy', null,
  '{"material":"สแตนเลส"}'::jsonb, null, null, null, null, null, false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010',
  '11111111-1111-1111-1111-111111111111',
  'เหยือกตวง', 'ของใช้ในครัว', null, null, 2, 'ใบ',
  79, null, 'Makro', 'store', null,
  'should', 'planned', null, '{}'::jsonb, null, null, null, null, null, false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0011',
  '11111111-1111-1111-1111-111111111111',
  'ช้อนตวง', 'ของใช้ในครัว', null, null, 1, 'ชุด',
  59, null, 'Makro', 'store', null,
  'should', 'planned', null, '{}'::jsonb, null, null, null, null, null, false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0012',
  '11111111-1111-1111-1111-111111111111',
  'กระปุกเก็บแป้ง', 'ตู้และการจัดเก็บ', null, null, 4, 'ใบ',
  99, null, 'Shopee', 'marketplace', null,
  'must', 'ready_to_buy', null,
  '{"material":"พลาสติกใส"}'::jsonb, null, null, null, null, null, false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0013',
  '11111111-1111-1111-1111-111111111111',
  'ตะแกรงพัก', 'ของใช้ในครัว', null, null, 2, 'ใบ',
  150, null, 'Makro', 'store', null,
  'should', 'planned', null, '{}'::jsonb, null, null, null, null, null, false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0014',
  '11111111-1111-1111-1111-111111111111',
  'เกรียง', 'ของใช้ในครัว', null, null, 2, 'ชิ้น',
  35, null, 'Makro', 'store', null,
  'nice', 'planned', null, '{}'::jsonb, null, null, null, null, null, false
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0015',
  '11111111-1111-1111-1111-111111111111',
  'กล่องพลาสติกเก็บไส้', 'ตู้และการจัดเก็บ', null, null, 10, 'ใบ',
  25, 22, 'Makro', 'store', null,
  'must', 'awaiting_delivery', '2026-07-09',
  '{"material":"พลาสติกใส"}'::jsonb,
  'สั่งแล้ว รอรับ', null, null, null, null, false
)
on conflict (id) do update
set
  name = excluded.name,
  category = excluded.category,
  brand = excluded.brand,
  model = excluded.model,
  quantity = excluded.quantity,
  unit = excluded.unit,
  estimated_unit_price = excluded.estimated_unit_price,
  actual_unit_price = excluded.actual_unit_price,
  supplier_name = excluded.supplier_name,
  purchase_channel = excluded.purchase_channel,
  purchase_url = excluded.purchase_url,
  priority = excluded.priority,
  status = excluded.status,
  purchase_date = excluded.purchase_date,
  specifications = excluded.specifications,
  notes = excluded.notes,
  warranty_months = excluded.warranty_months,
  warranty_expires_at = excluded.warranty_expires_at,
  serial_number = excluded.serial_number,
  decision_group_id = excluded.decision_group_id,
  is_archived = excluded.is_archived,
  updated_at = timezone('utc', now());

-- Sample purchase rounds (does not replace asset history pattern)
insert into public.bi_asset_purchases (
  id, workspace_id, asset_id, quantity, unit_price, total_price,
  supplier_name, purchase_channel, purchase_date, status, notes
) values
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
  1, 4200, 4200, 'ร้านแก๊สบ้านโป่ง', 'store', '2026-07-10', 'in_use', 'รอบเปิดร้าน'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
  2, 1650, 3300, 'ร้านแก๊สบ้านโป่ง', 'store', '2026-07-10', 'received', 'รอบเปิดร้าน'
)
on conflict (id) do nothing;

-- Budget lines: linked assets + POS decision group (one line, not both POS prices)
-- POS budget id fixed: was …00pos (INVALID) → …0010
insert into public.bi_budget_items (
  id, workspace_id, asset_id, decision_group_id, name, category,
  planned_amount, actual_amount, priority, status, notes
) values
(
  'cccccccc-cccc-cccc-cccc-cccccccc0001',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
  null,
  'เตาโตเกียว', 'อุปกรณ์ทำอาหาร', 4500, 4200, 'must', 'installed', null
),
(
  'cccccccc-cccc-cccc-cccc-cccccccc0002',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
  null,
  'ถังแก๊ส 15 กก.', 'อุปกรณ์ทำอาหาร', 3600, 3300, 'must', 'purchased', '2 ใบ'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccc0003',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003',
  null,
  'ตู้โชว์กระจก', 'ตู้และการจัดเก็บ', 12000, null, 'must', 'comparing', null
),
(
  'cccccccc-cccc-cccc-cccc-cccccccc0010',
  '11111111-1111-1111-1111-111111111111',
  null,
  '22222222-2222-2222-2222-222222222201',
  'เครื่อง POS (เลือก 1 รุ่น)', 'ระบบและ POS',
  12500, null, 'must', 'ready_to_buy',
  'ช่วงงบ 12,500–16,800 · ยังไม่ตัดสินใจ · ห้ามบวกราคาทั้งสองรุ่น'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccc0008',
  '11111111-1111-1111-1111-111111111111',
  null,
  null,
  'ป้ายร้าน ตั้งเตา', 'หน้าร้านและป้าย',
  null, null, 'must', 'no_price', 'ยังไม่หาราคา'
)
on conflict (id) do update
set
  name = excluded.name,
  category = excluded.category,
  planned_amount = excluded.planned_amount,
  actual_amount = excluded.actual_amount,
  priority = excluded.priority,
  status = excluded.status,
  notes = excluded.notes,
  asset_id = excluded.asset_id,
  decision_group_id = excluded.decision_group_id,
  updated_at = timezone('utc', now());

insert into public.bi_activity_logs (
  id, workspace_id, entity_type, entity_id, action, actor_name, summary, metadata
) values (
  'dddddddd-dddd-dddd-dddd-dddddddd0001',
  '11111111-1111-1111-1111-111111111111',
  'workspace',
  '11111111-1111-1111-1111-111111111111',
  'seed',
  'system',
  'Seed ตั้งเตา · อุปกรณ์และงบประมาณเริ่มต้น',
  '{"source":"migration","file":"20260711210000_create_business_insight_foundation_fixed.sql"}'::jsonb
)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Section: reload PostgREST schema cache
-- -----------------------------------------------------------------------------
notify pgrst, 'reload schema';
