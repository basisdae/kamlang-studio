"use client";

import { useAppWorkspace } from "../../app/providers/AppWorkspaceProvider";

/**
 * Hide sidebar / bottom nav until a Workspace is selected (Chooser mode).
 */
export default function WorkspaceChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isHydrated, isWorkspaceSelected } = useAppWorkspace();
  if (!isHydrated || !isWorkspaceSelected) return null;
  return <>{children}</>;
}
