/**
 * Domain: Activity log
 */

export type ActivityLog = {
  id: string;
  workspaceId: string;
  entityType: string;
  entityId: string | null;
  action: string;
  actorName: string;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type ActivityWriteInput = {
  workspaceId: string;
  entityType: string;
  entityId?: string | null;
  action: string;
  actorName?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};
