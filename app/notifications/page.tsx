"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import AppShell from "../../components/layout/AppShell";
import { getNotifications } from "../lib/notificationService";
import NotificationList from "./components/NotificationList";

export default function NotificationsPage() {
  const pathname = usePathname();

  const notifications = useMemo(() => getNotifications(), [pathname]);

  return (
    <AppShell
      title="สิ่งที่ต้องจัดการ"
      description="เรื่องที่ควรเช็คตอนนี้"
      backHref="/"
    >
      <NotificationList notifications={notifications} />
    </AppShell>
  );
}
