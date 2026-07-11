/**
 * Domain: Workspace
 */

export type WorkspaceStatus =
  | "draft"
  | "opening"
  | "open"
  | "paused"
  | "closed";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  status: WorkspaceStatus | string;
  createdAt: string;
  updatedAt: string;
};
