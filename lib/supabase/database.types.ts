/**
 * Typed surface for Business Insight tables (bi_*).
 * Keep in sync with:
 * supabase/migrations/20260711210000_create_business_insight_foundation_fixed.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BiWorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type BiAssetRow = {
  id: string;
  workspace_id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  quantity: number;
  unit: string;
  estimated_unit_price: number | null;
  actual_unit_price: number | null;
  supplier_name: string | null;
  purchase_channel: string | null;
  purchase_url: string | null;
  priority: string;
  status: string;
  purchase_date: string | null;
  specifications: Json;
  notes: string | null;
  warranty_months: number | null;
  warranty_expires_at: string | null;
  serial_number: string | null;
  decision_group_id: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type BiAssetPurchaseRow = {
  id: string;
  workspace_id: string;
  asset_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  supplier_name: string | null;
  purchase_channel: string | null;
  purchase_url: string | null;
  purchase_date: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BiAssetRepairRow = {
  id: string;
  workspace_id: string;
  asset_id: string;
  reported_at: string;
  problem: string;
  repair_provider: string | null;
  repair_cost: number | null;
  returned_at: string | null;
  result: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BiAssetDecisionGroupRow = {
  id: string;
  workspace_id: string;
  name: string;
  selection_mode: string;
  selected_asset_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BiBudgetItemRow = {
  id: string;
  workspace_id: string;
  asset_id: string | null;
  decision_group_id: string | null;
  name: string;
  category: string | null;
  planned_amount: number | null;
  actual_amount: number | null;
  priority: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BiActivityLogRow = {
  id: string;
  workspace_id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  actor_name: string | null;
  summary: string;
  metadata: Json;
  created_at: string;
};

export type BiPartnerRow = {
  id: string;
  workspace_id: string;
  name: string;
  category: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  line_id: string | null;
  website: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      bi_workspaces: {
        Row: BiWorkspaceRow;
        Insert: Partial<BiWorkspaceRow> & { name: string; slug: string };
        Update: Partial<BiWorkspaceRow>;
      };
      bi_assets: {
        Row: BiAssetRow;
        Insert: Partial<BiAssetRow> & {
          workspace_id: string;
          name: string;
          category: string;
        };
        Update: Partial<BiAssetRow>;
      };
      bi_asset_purchases: {
        Row: BiAssetPurchaseRow;
        Insert: Partial<BiAssetPurchaseRow> & {
          workspace_id: string;
          asset_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Update: Partial<BiAssetPurchaseRow>;
      };
      bi_asset_repairs: {
        Row: BiAssetRepairRow;
        Insert: Partial<BiAssetRepairRow> & {
          workspace_id: string;
          asset_id: string;
          reported_at: string;
          problem: string;
        };
        Update: Partial<BiAssetRepairRow>;
      };
      bi_asset_decision_groups: {
        Row: BiAssetDecisionGroupRow;
        Insert: Partial<BiAssetDecisionGroupRow> & {
          workspace_id: string;
          name: string;
        };
        Update: Partial<BiAssetDecisionGroupRow>;
      };
      bi_budget_items: {
        Row: BiBudgetItemRow;
        Insert: Partial<BiBudgetItemRow> & {
          workspace_id: string;
          name: string;
        };
        Update: Partial<BiBudgetItemRow>;
      };
      bi_activity_logs: {
        Row: BiActivityLogRow;
        Insert: Partial<BiActivityLogRow> & {
          workspace_id: string;
          entity_type: string;
          action: string;
          summary: string;
        };
        Update: Partial<BiActivityLogRow>;
      };
      bi_partners: {
        Row: BiPartnerRow;
        Insert: Partial<BiPartnerRow> & {
          workspace_id: string;
          name: string;
          category: string;
        };
        Update: Partial<BiPartnerRow>;
      };
    };
  };
};
