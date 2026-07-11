import type { Workspace } from "../types/workspace";

export interface WorkspaceRepository {
  list(): Promise<Workspace[]>;
  getById(id: string): Promise<Workspace | null>;
  getBySlug(slug: string): Promise<Workspace | null>;
  getDefault(): Promise<Workspace>;
}
