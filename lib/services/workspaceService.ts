import { getBiRepositories } from "../repositories";
import type { Workspace } from "../types/workspace";

export class WorkspaceService {
  async getCurrentWorkspace(): Promise<Workspace> {
    const { workspaces } = getBiRepositories();
    return workspaces.getDefault();
  }

  async getBySlug(slug: string): Promise<Workspace | null> {
    const { workspaces } = getBiRepositories();
    return workspaces.getBySlug(slug);
  }
}

export const workspaceService = new WorkspaceService();
