"use client";

import AppShell from "../../components/layout/AppShell";
import WorkspaceChooser from "../../components/workspaces/WorkspaceChooser";
import { useAppWorkspace } from "../providers/AppWorkspaceProvider";

/**
 * /modes — Workspace Chooser.
 * ถ้ามี Workspace อยู่แล้วและเข้าหน้านี้โดยตรง → ยังโชว์ Chooser
 * (ไม่เด้งหนีอัตโนมัติ) เพื่อให้เปลี่ยน/เห็นรายการได้ชัด
 * “ออกจากโหมดนี้” จะ clear แล้วพามาที่นี่
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
    <AppShell title="" compact hidePageHeader>
      <WorkspaceChooser />
    </AppShell>
  );
}
