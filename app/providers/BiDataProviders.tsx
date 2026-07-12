"use client";

import type { ReactNode } from "react";
import BiCacheBootstrap from "../../components/bi/BiCacheBootstrap";
import { WorkspaceProvider } from "./WorkspaceProvider";
import { AssetProvider } from "./AssetProvider";
import { BudgetProvider } from "./BudgetProvider";

/** Shared BI online providers for Business tenant data (Opening + Platform landings). */
export function BiDataProviders({ children }: { children: ReactNode }) {
  return (
    <BiCacheBootstrap>
      <WorkspaceProvider>
        <AssetProvider>
          <BudgetProvider>{children}</BudgetProvider>
        </AssetProvider>
      </WorkspaceProvider>
    </BiCacheBootstrap>
  );
}
