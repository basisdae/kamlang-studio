"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import AppShell from "../../components/layout/AppShell";
import { getRecentActivities } from "../repositories/ActivityLogRepository";
import ActivityTimeline from "./components/ActivityTimeline";

export default function ActivityPage() {
  const pathname = usePathname();

  const activities = useMemo(
    () => getRecentActivities(100),
    [pathname]
  );

  return (
    <AppShell
      title="บันทึกล่าสุด"
      description="สิ่งที่เพิ่งทำในร้าน"
      backHref="/"
    >
      <ActivityTimeline activities={activities} />
    </AppShell>
  );
}
