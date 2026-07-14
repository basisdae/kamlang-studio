import type {
  PartnerCategory,
  PartnerRecord,
  PartnerStatus,
} from "../partners/types";
import { isPartnerCategory } from "../partners/types";

export type PartnerRow = {
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

export type PartnerWriteInput = {
  name: string;
  category: PartnerCategory;
  contactName?: string;
  phone?: string;
  email?: string;
  lineId?: string;
  website?: string;
  address?: string;
  notes?: string;
  status?: PartnerStatus;
};

function asStatus(value: string): PartnerStatus {
  if (value === "pending" || value === "paused" || value === "active") {
    return value;
  }
  return "active";
}

function asCategory(value: string): PartnerCategory {
  return isPartnerCategory(value) ? value : "other";
}

export function partnerFromDatabase(row: PartnerRow): PartnerRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    category: asCategory(row.category),
    contactName: row.contact_name ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    lineId: row.line_id ?? "",
    website: row.website ?? "",
    address: row.address ?? "",
    notes: row.notes ?? "",
    status: asStatus(row.status),
    isArchived: Boolean(row.is_archived),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function partnerToDatabase(
  input: PartnerWriteInput,
  workspaceId: string
): Omit<PartnerRow, "id" | "created_at" | "updated_at"> {
  return {
    workspace_id: workspaceId,
    name: input.name.trim(),
    category: input.category,
    contact_name: input.contactName?.trim() || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    line_id: input.lineId?.trim() || null,
    website: input.website?.trim() || null,
    address: input.address?.trim() || null,
    notes: input.notes?.trim() || null,
    status: input.status ?? "active",
    is_archived: false,
  };
}

export function partnerPatchToDatabase(
  patch: Partial<PartnerWriteInput>
): Record<string, string | null | undefined> {
  const out: Record<string, string | null | undefined> = {};
  if (patch.name != null) out.name = patch.name.trim();
  if (patch.category != null) out.category = patch.category;
  if (patch.contactName !== undefined) {
    out.contact_name = patch.contactName.trim() || null;
  }
  if (patch.phone !== undefined) out.phone = patch.phone.trim() || null;
  if (patch.email !== undefined) out.email = patch.email.trim() || null;
  if (patch.lineId !== undefined) out.line_id = patch.lineId.trim() || null;
  if (patch.website !== undefined) out.website = patch.website.trim() || null;
  if (patch.address !== undefined) out.address = patch.address.trim() || null;
  if (patch.notes !== undefined) out.notes = patch.notes.trim() || null;
  if (patch.status != null) out.status = patch.status;
  return out;
}
