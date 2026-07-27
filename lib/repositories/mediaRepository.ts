import type { MediaRecord } from "../media/types";

export type MediaRepository = {
  listByWorkspace(workspaceId: string): Promise<MediaRecord[]>;
  upload(
    workspaceId: string,
    file: File,
    options?: { createdBy?: string | null }
  ): Promise<MediaRecord>;
  remove(id: string, workspaceId: string): Promise<void>;
};
