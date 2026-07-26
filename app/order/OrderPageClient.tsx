"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import OrderCartBar from "../../components/order/OrderCartBar";
import OrderCartSheet from "../../components/order/OrderCartSheet";
import OrderCheckoutSheet from "../../components/order/OrderCheckoutSheet";
import OrderProductCard from "../../components/order/OrderProductCard";
import { loadOrderCatalog } from "../../lib/order/catalog";
import {
  ORDER_SHOP_NAME,
  ORDER_TRIAL_BANNER,
} from "../../lib/order/config";
import type {
  CartLine,
  OrderFulfillment,
  OrderProduct,
  OrderSource,
  PickupMode,
} from "../../lib/order/types";

type LoadState = "loading" | "ready" | "error";

export default function OrderPageClient() {
  const searchParams = useSearchParams();
  const orderSource: OrderSource =
    searchParams.get("source") === "staff" ? "staff" : "customer";

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [emptyReason, setEmptyReason] = useState<string | null>(null);
  const [missingForCatalog, setMissingForCatalog] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fulfillment, setFulfillment] = useState<OrderFulfillment>("pickup");
  const [pickupMode, setPickupMode] = useState<PickupMode>("takeaway");
  const [cart, setCart] = useState<Record<string, number>>({});

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await loadOrderCatalog();
        if (cancelled) return;
        setProducts(result.products);
        setEmptyReason(result.emptyReason);
        setMissingForCatalog(result.missingForCatalog);
        setLoadState("ready");
      } catch {
        if (cancelled) return;
        setLoadError("โหลดเมนูไม่สำเร็จ ลองใหม่อีกครั้ง");
        setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const productById = useMemo(() => {
    const map = new Map<string, OrderProduct>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  const lines: CartLine[] = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([productId, qty]) => {
        const p = productById.get(productId);
        return {
          productId,
          name: p?.name ?? "สินค้า",
          unitPrice: p?.price ?? 0,
          qty,
        };
      });
  }, [cart, productById]);

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );

  const totalBaht = useMemo(
    () => lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0),
    [lines]
  );

  function qtyOf(id: string) {
    return cart[id] ?? 0;
  }

  function addProduct(p: OrderProduct) {
    if (p.soldOut) return;
    setCart((c) => ({ ...c, [p.id]: (c[p.id] ?? 0) + 1 }));
  }

  function inc(productId: string) {
    const p = productById.get(productId);
    if (p?.soldOut) return;
    setCart((c) => ({ ...c, [productId]: (c[productId] ?? 0) + 1 }));
  }

  function dec(productId: string) {
    setCart((c) => {
      const next = (c[productId] ?? 0) - 1;
      if (next <= 0) {
        const nextCart = { ...c };
        delete nextCart[productId];
        return nextCart;
      }
      return { ...c, [productId]: next };
    });
  }

  function remove(productId: string) {
    setCart((c) => {
      const nextCart = { ...c };
      delete nextCart[productId];
      return nextCart;
    });
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col overflow-x-hidden">
      {/* Staff context is silent — same UI/prices; kept for future Orders wiring */}
      <span className="sr-only" data-order-source={orderSource} aria-hidden="true" />

      <header className="sticky top-0 z-30 border-b border-[var(--kl-border)] bg-[#f7f7f4]/95 backdrop-blur-sm">
        <div className="px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <p className="rounded-lg bg-[rgb(231_246_91/0.55)] px-3 py-1.5 text-center text-[12px] font-medium leading-snug">
            {ORDER_TRIAL_BANNER}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--bi-lemon)] text-[15px] font-bold"
              aria-hidden
            >
              ต
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[18px] font-semibold tracking-tight">
                {ORDER_SHOP_NAME}
              </h1>
              <p className="text-[13px] text-kl-muted">สั่งอาหาร</p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div
            className="grid grid-cols-2 gap-1 rounded-2xl bg-kl-surface p-1"
            role="tablist"
            aria-label="ประเภทออเดอร์"
          >
            <FulfillmentTab
              active={fulfillment === "pickup"}
              onClick={() => setFulfillment("pickup")}
              label="รับหน้าร้าน"
            />
            <FulfillmentTab
              active={fulfillment === "delivery"}
              onClick={() => setFulfillment("delivery")}
              label="จัดส่ง"
            />
          </div>

          {fulfillment === "pickup" ? (
            <div
              className="mt-2 grid grid-cols-2 gap-1 rounded-xl border border-[var(--kl-border)] bg-white p-1"
              role="group"
              aria-label="รูปแบบรับหน้าร้าน"
            >
              <PickupChip
                active={pickupMode === "dine_wait"}
                onClick={() => setPickupMode("dine_wait")}
                label="นั่งรอ"
              />
              <PickupChip
                active={pickupMode === "takeaway"}
                onClick={() => setPickupMode("takeaway")}
                label="นำกลับ"
              />
            </div>
          ) : null}
        </div>
      </header>

      <main className="flex-1 px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-3 sm:px-4">
        {loadState === "loading" ? (
          <p className="py-16 text-center text-[15px] text-kl-muted">
            กำลังโหลดเมนู…
          </p>
        ) : null}

        {loadState === "error" ? (
          <div className="rounded-2xl border border-[var(--kl-border)] bg-white px-4 py-10 text-center">
            <p className="text-[15px] font-medium">{loadError}</p>
            <button
              type="button"
              className="mt-4 min-h-[44px] rounded-xl bg-[var(--bi-lemon)] px-4 text-[14px] font-semibold"
              onClick={() => window.location.reload()}
            >
              ลองใหม่
            </button>
          </div>
        ) : null}

        {loadState === "ready" && products.length === 0 ? (
          <div className="rounded-2xl border border-[var(--kl-border)] bg-white px-4 py-8">
            <p className="text-center text-[16px] font-semibold">
              {emptyReason ?? "ยังไม่มีรายการสินค้า"}
            </p>
            <p className="mt-2 text-center text-[14px] leading-relaxed text-kl-muted">
              หน้านี้พร้อมสำหรับตรวจ Flow สั่งอาหารแล้ว
              แต่ยังไม่มีชุดข้อมูลสินค้าขายสำหรับแสดงเมนู
            </p>
            {missingForCatalog.length > 0 ? (
              <ul className="mt-5 space-y-2 border-t border-[var(--kl-border)] pt-4 text-[13px] text-kl-muted">
                <li className="font-medium text-[var(--bi-text-primary)]">
                  ข้อมูลที่ยังขาด:
                </li>
                {missingForCatalog.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden>·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-5 text-center text-[12px] text-kl-muted">
              สลับรับหน้าร้าน/จัดส่งด้านบนได้ตามปกติ — ตะกร้าจะใช้ได้เมื่อมีสินค้า
            </p>
            <button
              type="button"
              className="mx-auto mt-4 flex min-h-[44px] items-center justify-center text-[13px] font-medium text-kl-muted underline"
              onClick={() => setCheckoutOpen(true)}
            >
              ดูตัวอย่างฟอร์มยืนยัน (ทดลอง · ไม่มีสินค้า)
            </button>
          </div>
        ) : null}

        {loadState === "ready" && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <OrderProductCard
                key={p.id}
                product={p}
                qty={qtyOf(p.id)}
                onAdd={() => addProduct(p)}
                onInc={() => inc(p.id)}
                onDec={() => dec(p.id)}
              />
            ))}
          </div>
        ) : null}
      </main>

      <OrderCartBar
        itemCount={itemCount}
        totalBaht={totalBaht}
        onOpenCart={() => setCartOpen(true)}
      />

      <OrderCartSheet
        open={cartOpen}
        lines={lines}
        totalBaht={totalBaht}
        onClose={() => setCartOpen(false)}
        onInc={inc}
        onDec={dec}
        onRemove={remove}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <OrderCheckoutSheet
        open={checkoutOpen}
        fulfillment={fulfillment}
        pickupMode={pickupMode}
        lines={lines}
        totalBaht={totalBaht}
        onClose={() => setCheckoutOpen(false)}
        onConfirmPreview={() => {
          /* Trial only — no DB write */
        }}
      />
    </div>
  );
}

function FulfillmentTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`min-h-[48px] rounded-xl text-[15px] font-semibold transition-colors ${
        active
          ? "bg-white text-[var(--bi-text-primary)] shadow-sm"
          : "text-kl-muted"
      }`}
    >
      {label}
    </button>
  );
}

function PickupChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[40px] rounded-lg text-[14px] font-medium ${
        active
          ? "bg-[var(--bi-lemon)] text-[var(--bi-text-primary)]"
          : "text-kl-muted"
      }`}
    >
      {label}
    </button>
  );
}
