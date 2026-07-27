import { getBiRepositories } from "../repositories";
import type { MediaRecord } from "../media/types";

export const mediaService = {
  async list(workspaceId: string): Promise<MediaRecord[]> {
    const { media } = getBiRepositories();
    return media.listByWorkspace(workspaceId);
  },

  async upload(
    workspaceId: string,
    file: File,
    options?: { createdBy?: string | null }
  ): Promise<MediaRecord> {
    const { media } = getBiRepositories();
    return media.upload(workspaceId, file, options);
  },

  async remove(id: string, workspaceId: string): Promise<void> {
    const { media } = getBiRepositories();
    return media.remove(id, workspaceId);
  },
};
