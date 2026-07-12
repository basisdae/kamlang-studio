"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppWorkspace } from "../../app/providers/AppWorkspaceProvider";
import { isPathInWorkspace } from "../../lib/workspaces/filterNavigation";
import { saveReturnPath } from "../../lib/workspaces/returnPath";
import WorkspaceChooser from "./WorkspaceChooser";

const PUBLIC_PREFIXES = [
  "/modes",
  "/setup",
  "/status",
  "/auth",
  "/dev",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isChooserPath(pathname: string): boolean {
  return pathname === "/modes" || pathname.startsWith("/modes/");
}

/**
 * Route guard:
 * - No currentWorkspace → /modes (save return path)
 * - /modes always shows Chooser (Entry)
 * - Path outside selected Workspace → Workspace Landing
 */
export default function WorkspaceGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isHydrated, isWorkspaceSelected, config } = useAppWorkspace();

  const needsChooser =
    isHydrated && !isWorkspaceSelected && !isPublicPath(pathname);

  const pathOutsideWorkspace =
    isHydrated &&
    isWorkspaceSelected &&
    config != null &&
    !isChooserPath(pathname) &&
    !isPublicPath(pathname) &&
    !isPathInWorkspace(pathname, config.visibleModules, config.id);

  useEffect(() => {
    if (!needsChooser) return;
    if (!isChooserPath(pathname)) {
      saveReturnPath(pathname);
      router.replace("/modes");
    }
  }, [needsChooser, pathname, router]);

  useEffect(() => {
    if (!pathOutsideWorkspace || !config) return;
    router.replace(config.defaultLanding);
  }, [pathOutsideWorkspace, config, router]);

  if (!isHydrated) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[var(--bi-app-width)] items-center justify-center px-4">
        <p className="kl-type-caption text-kl-muted">กำลังโหลด…</p>
      </div>
    );
  }

  if (isChooserPath(pathname)) {
    return (
      <div className="min-h-screen bg-kl-ivory px-4 py-8 text-kl-brown">
        <div className="mx-auto w-full max-w-[var(--bi-app-width)]">
          <WorkspaceChooser />
        </div>
      </div>
    );
  }

  if (needsChooser) {
    return (
      <div className="min-h-screen bg-kl-ivory px-4 py-8 text-kl-brown">
        <div className="mx-auto w-full max-w-[var(--bi-app-width)]">
          <WorkspaceChooser />
        </div>
      </div>
    );
  }

  if (pathOutsideWorkspace) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[var(--bi-app-width)] items-center justify-center px-4">
        <p className="kl-type-caption text-kl-muted">กำลังเข้า Workspace…</p>
      </div>
    );
  }

  return <>{children}</>;
}
