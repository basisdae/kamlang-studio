"use client";

import { Suspense } from "react";
import AppShell from "../../../components/layout/AppShell";
import ProductionBuilderPageSkeleton from "../../../components/ui/skeletons/ProductionBuilderPageSkeleton";
import ProductionEditPageContent from "./ProductionEditPageContent";

function ProductionEditFallback() {
  return (
    <AppShell
      title="แผนผลิต"
      description="กำหนดวันที่ เป้าผลิต และจำนวนที่ต้องทำ"
      backHref="/production"
    >
      <ProductionBuilderPageSkeleton />
    </AppShell>
  );
}

export default function ProductionEditPage() {
  return (
    <Suspense fallback={<ProductionEditFallback />}>
      <ProductionEditPageContent />
    </Suspense>
  );
}
