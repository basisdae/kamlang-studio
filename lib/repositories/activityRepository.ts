import type { ActivityLog, ActivityWriteInput } from "../types/activity";

export interface ActivityRepository {
  create(input: ActivityWriteInput): Promise<ActivityLog | null>;
  listByWorkspace(
    workspaceId: string,
    limit?: number
  ): Promise<ActivityLog[]>;
}
