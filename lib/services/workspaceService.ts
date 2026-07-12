import { getBiRepositories } from "../repositories";
import type { Workspace } from "../types/workspace";
import { readStoredBusiness } from "../business/currentBusinessStorage";

export class WorkspaceService {
  /**
   * Resolve Business / Tenant from currentBusiness preference, else default ตั้งเตา.
   * Does not read or write App Workspace (currentWorkspace).
   */
  async getCurrentWorkspace(): Promise<Workspace> {
    const { workspaces } = getBiRepositories();
    const pref =
      typeof window !== "undefined" ? readStoredBusiness() : null;

    if (pref?.id) {
      const byId = await workspaces.getById(pref.id);
      if (byId) return byId;
    }
    if (pref?.slug) {
      const bySlug = await workspaces.getBySlug(pref.slug);
      if (bySlug) return bySlug;
    }
    return workspaces.getDefault();
  }

  async getBySlug(slug: string): Promise<Workspace | null> {
    const { workspaces } = getBiRepositories();
    return workspaces.getBySlug(slug);
  }
}

export const workspaceService = new WorkspaceService();
