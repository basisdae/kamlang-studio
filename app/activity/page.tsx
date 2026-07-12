"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../components/layout/AppShell";
import BiListSkeleton from "../../components/bi/BiListSkeleton";

/**
 * Legacy /activity → Opening Workspace Feed (bi_activity_logs).
 */
export default function ActivityRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/opening/activity");
  }, [router]);

  return (
    <AppShell title="บันทึกล่าสุด" backHref="/opening" compact>
      <BiListSkeleton rows={3} showSummary={false} />
    </AppShell>
  );
}
