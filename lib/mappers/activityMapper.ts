import type { ActivityLog, ActivityWriteInput } from "../types/activity";

export type ActivityRow = {
  id: string;
  workspace_id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  actor_name: string | null;
  summary: string;
  metadata: unknown;
  created_at: string;
};

export function activityFromDatabase(row: ActivityRow): ActivityLog {
  const metadata =
    row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {};
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    actorName: row.actor_name ?? "ผู้ใช้งาน",
    summary: row.summary,
    metadata,
    createdAt: row.created_at,
  };
}

export function activityToDatabase(input: ActivityWriteInput): Record<string, unknown> {
  return {
    workspace_id: input.workspaceId,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    action: input.action,
    actor_name: input.actorName ?? "ผู้ใช้งาน",
    summary: input.summary,
    metadata: input.metadata ?? {},
  };
}
