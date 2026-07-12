"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppWorkspace } from "../../app/providers/AppWorkspaceProvider";
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

/**
 * Hard gate: ไม่มี Workspace = ไม่เรนเดอร์หน้างาน (เช่น /opening)
 * แสดง Chooser เต็มจอแทน — ไม่ใช่แค่ redirect ช้าๆ
 */
export default function WorkspaceGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isHydrated, isWorkspaceSelected } = useAppWorkspace();

  const needsChooser =
    isHydrated && !isWorkspaceSelected && !isPublicPath(pathname);

  useEffect(() => {
    if (!needsChooser) return;
    if (pathname !== "/modes") {
      router.replace("/modes");
    }
  }, [needsChooser, pathname, router]);

  if (!isHydrated) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[var(--bi-app-width)] items-center justify-center px-4">
        <p className="kl-type-caption text-kl-muted">กำลังโหลด…</p>
      </div>
    );
  }

  if (needsChooser || (pathname === "/modes" && !isWorkspaceSelected)) {
    return (
      <div className="min-h-screen bg-kl-ivory px-4 py-8 text-kl-brown">
        <div className="mx-auto w-full max-w-[var(--bi-app-width)]">
          <WorkspaceChooser />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
