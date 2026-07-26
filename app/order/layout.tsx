import type { Metadata } from "next";
import { ORDER_SHOP_NAME } from "../../lib/order/config";
import { OrderThemeProvider } from "../../components/order/OrderThemeProvider";

export const metadata: Metadata = {
  title: `สั่งอาหาร · ${ORDER_SHOP_NAME}`,
  description: `หน้าสั่งอาหาร ${ORDER_SHOP_NAME} — ทดลอง UX`,
  robots: { index: false, follow: false },
};

/**
 * Standalone order shell — no AppShell / BI nav.
 * Theme tokens scoped to [data-order-surface].
 */
export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OrderThemeProvider>{children}</OrderThemeProvider>;
}
