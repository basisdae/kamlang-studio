import type { Metadata } from "next";
import { ORDER_SHOP_NAME } from "../../lib/order/config";

export const metadata: Metadata = {
  title: `สั่งอาหาร · ${ORDER_SHOP_NAME}`,
  description: `หน้าสั่งอาหาร ${ORDER_SHOP_NAME} — ทดลอง UX`,
  robots: { index: false, follow: false },
};

/**
 * Standalone order shell — no AppShell / BI nav.
 * Root WorkspaceGate treats /order as public.
 */
export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#f7f7f4] text-[var(--bi-text-primary)] antialiased">
      {children}
    </div>
  );
}
