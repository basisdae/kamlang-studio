import type { AppWorkspaceId, WorkspaceAccent } from "./types";

/** CSS variable pair for a Workspace Context accent */
export function workspaceAccentStyle(accent: WorkspaceAccent): {
  ["--ws-accent"]: string;
  ["--ws-accent-soft"]: string;
} {
  return {
    "--ws-accent": `var(--ws-${accent})`,
    "--ws-accent-soft": `var(--ws-${accent}-soft)`,
  };
}

export function workspaceAccentFromId(id: AppWorkspaceId): WorkspaceAccent {
  return id;
}
