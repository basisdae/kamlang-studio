"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppWorkspace } from "./providers/AppWorkspaceProvider";
import WorkspaceChooser from "../components/workspaces/WorkspaceChooser";

/**
 * `/` — ครั้งแรกต้องเจอ Chooser; ถ้ามี Workspace ล่าสุดค่อยไป landing
 */
export default function HomePage() {
  const router = useRouter();
  const { isHydrated, isWorkspaceSelected, config } = useAppWorkspace();

  useEffect(() => {
    if (!isHydrated) return;
    if (isWorkspaceSelected && config) {
      router.replace(config.defaultLanding);
    }
  }, [isHydrated, isWorkspaceSelected, config, router]);

  if (!isHydrated) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[var(--bi-app-width)] items-center justify-center px-4">
        <p className="kl-type-caption text-kl-muted">กำลังโหลด…</p>
      </div>
    );
  }

  if (isWorkspaceSelected) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[var(--bi-app-width)] items-center justify-center px-4">
        <p className="kl-type-caption text-kl-muted">กำลังเข้า Workspace…</p>
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
