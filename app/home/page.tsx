"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../components/layout/AppShell";
import { useAppWorkspace } from "../providers/AppWorkspaceProvider";
import {
  PLATFORM_LANDING_PATH,
  WORKSPACE_CHOOSER_PATH,
} from "../../lib/workspaces/appWorkspaces";
import LabLandingComposition from "../../components/landings/LabLandingComposition";
import OperationsLandingComposition from "../../components/landings/OperationsLandingComposition";
import FinanceLandingComposition from "../../components/landings/FinanceLandingComposition";
import MarketingLandingComposition from "../../components/landings/MarketingLandingComposition";

/**
 * Platform Landing entry — Composition by Workspace context.
 * URL is not named after a Workspace (/lab, /finance, …).
 */
export default function PlatformLandingPage() {
  const router = useRouter();
  const { isHydrated, currentWorkspace, config } = useAppWorkspace();

  useEffect(() => {
    if (!isHydrated) return;
    if (!currentWorkspace) {
      router.replace(WORKSPACE_CHOOSER_PATH);
      return;
    }
    if (currentWorkspace === "opening") {
      router.replace("/opening");
    }
  }, [isHydrated, currentWorkspace, router]);

  if (!isHydrated || !currentWorkspace || currentWorkspace === "opening") {
    return (
      <AppShell title="" hidePageHeader compact>
        <p className="kl-type-caption text-kl-muted">กำลังโหลด…</p>
      </AppShell>
    );
  }

  let body: ReactNode = null;
  switch (currentWorkspace) {
    case "lab":
      body = <LabLandingComposition />;
      break;
    case "operations":
      body = <OperationsLandingComposition />;
      break;
    case "finance":
      body = <FinanceLandingComposition />;
      break;
    case "marketing":
      body = <MarketingLandingComposition />;
      break;
    default:
      body = (
        <p className="kl-type-helper">
          ไม่พบ Landing สำหรับ Workspace นี้ —{" "}
          <a href={WORKSPACE_CHOOSER_PATH} className="underline">
            เลือก Workspace
          </a>
        </p>
      );
  }

  return (
    <AppShell title="" hidePageHeader compact>
      {/* data path for debug / future: {PLATFORM_LANDING_PATH} · {config?.id} */}
      <span className="sr-only">
        Platform landing {PLATFORM_LANDING_PATH} · {config?.id}
      </span>
      {body}
    </AppShell>
  );
}
