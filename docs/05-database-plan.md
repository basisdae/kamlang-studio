# 05 — Database Plan

# Database Plan (future)

Sprint 0 uses **in-memory Sample Data only**. No Supabase connection.

Naming: `docs/00-naming.md`.

---

## Principles

- Workspace-scoped data (first workspace: ตั้งเตา)
- Opening Plan is the hub; Budget lines belong to categories
- Team members are first-class (UI: ทีมบริหาร); ownership percents sum to 100
- Sales facts come later from external POS imports — not from an in-app POS

## Proposed entities

### workspace

- id, name, created_at

### team_member

- id, workspace_id, name, share_percent, planned_amount
- UI: ทีมบริหาร · code: `TeamMember`

### opening_plan

- id, workspace_id, target_budget, reserve_budget, status

### opening_category

- id, opening_plan_id, name, sort_order

### budget_item

- id, opening_plan_id, category_id
- name, priority, status
- estimated_price, actual_price, quantity
- notes

### asset_item

- id, workspace_id / opening_plan_id
- name, category, estimated_price, actual_price, quantity

### initial_stock_item

- id, opening_plan_id
- name, unit, quantity, estimated_cost

### checklist_item

- id, opening_plan_id, label, is_done, sort_order

### (later) investment

- Capital actually contributed by team (separate from opening budget) — for ROI / payback

### (later) sales_import

- id, workspace_id, source (`pos` | `grab` | `lineman`), period, gross_sales
- raw payload reference

### (legacy Kamlang)

Recipe, ingredient, menu, production, purchase, inventory tables remain separate until a deliberate migration.

## Explicit non-goals now

- Auth tables
- Ledger / journal entries
- Live POS ticket tables
