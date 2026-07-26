"use client";

import { Suspense } from "react";
import OrderPageClient from "./OrderPageClient";

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center px-4">
          <p className="text-[15px] text-kl-muted">กำลังโหลด…</p>
        </div>
      }
    >
      <OrderPageClient />
    </Suspense>
  );
}
