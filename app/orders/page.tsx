"use client";

import { OrderThemeProvider } from "../../components/order/OrderThemeProvider";
import StoreOrdersPageClient from "./StoreOrdersPageClient";

export default function OrdersPage() {
  return (
    <OrderThemeProvider>
      <StoreOrdersPageClient />
    </OrderThemeProvider>
  );
}
