import { getBiRepositories } from "../repositories";
import type { ActivityLog, ActivityWriteInput } from "../types/activity";

const DEFAULT_ACTOR = "ผู้ใช้งาน";

export class ActivityService {
  async log(input: Omit<ActivityWriteInput, "actorName"> & { actorName?: string }) {
    const { activity } = getBiRepositories();
    return activity.create({
      ...input,
      actorName: input.actorName ?? DEFAULT_ACTOR,
    });
  }

  async list(workspaceId: string, limit = 50): Promise<ActivityLog[]> {
    const { activity } = getBiRepositories();
    return activity.listByWorkspace(workspaceId, limit);
  }
}

export const activityService = new ActivityService();
