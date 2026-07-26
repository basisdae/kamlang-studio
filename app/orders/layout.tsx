import type { Metadata } from "next";
import { ORDER_SHOP_NAME } from "../../lib/order/config";

export const metadata: Metadata = {
  title: `คิวออเดอร์ · ${ORDER_SHOP_NAME}`,
  description: `คิวออเดอร์หน้าร้าน ${ORDER_SHOP_NAME}`,
  robots: { index: false, follow: false },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
