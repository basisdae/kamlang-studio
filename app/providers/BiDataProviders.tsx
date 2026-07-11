"use client";

import type { ReactNode } from "react";
import { WorkspaceProvider } from "./WorkspaceProvider";
import { AssetProvider } from "./AssetProvider";
import { BudgetProvider } from "./BudgetProvider";

/** Workspace → Assets → Budget (shared Tang Tao online data) */
export function BiDataProviders({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <AssetProvider>
        <BudgetProvider>{children}</BudgetProvider>
      </AssetProvider>
    </WorkspaceProvider>
  );
}
