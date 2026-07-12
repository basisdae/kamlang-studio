"use client";

import { usePathname } from "next/navigation";
import { useAppWorkspace } from "../../app/providers/AppWorkspaceProvider";

/**
 * In-workspace chrome only (sidebar / bottom nav).
 * Hidden on Chooser entry (/modes) — Chooser ≠ Switcher.
 */
export default function WorkspaceChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isHydrated, isWorkspaceSelected } = useAppWorkspace();
  const onChooser =
    pathname === "/modes" || pathname.startsWith("/modes/");

  if (!isHydrated || !isWorkspaceSelected || onChooser) return null;
  return <>{children}</>;
}
