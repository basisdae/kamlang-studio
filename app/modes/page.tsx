"use client";

import WorkspaceChooser from "../../components/workspaces/WorkspaceChooser";
import { useAppWorkspace } from "../providers/AppWorkspaceProvider";

/**
 * /modes — Choose Workspace Hub (Entry only).
 * No AppShell / Switcher — Chooser and Switcher never share a screen.
 */
export default function ModesPage() {
  const { isHydrated } = useAppWorkspace();

  if (!isHydrated) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[var(--bi-app-width)] items-center justify-center px-4">
        <p className="kl-type-caption text-kl-muted">กำลังโหลด…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kl-ivory px-4 py-8 text-kl-brown">
      <div className="mx-auto w-full max-w-[var(--bi-app-width)]">
        <WorkspaceChooser />
      </div>
    </div>
  );
}
