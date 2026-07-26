"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Store } from "lucide-react";
import { loadOrderAddons } from "../../lib/order/addons";
import { loadOrderCatalog } from "../../lib/order/catalog";
import {
  ORDER_DELIVERY_LINE_NOTICE,
  ORDER_RESULT_DESCRIPTION,
  ORDER_RESULT_TITLE,
  ORDER_SHOP_NAME,
  ORDER_TRIAL_BANNER,
  ORDER_WELCOME_TAGLINE,
} from "../../lib/order/config";
import type {
  CartLine,
  OrderAddon,
  OrderFulfillment,
  OrderProduct,
  OrderSource,
  PickupMode,
} from "../../lib/order/types";
import OrderAddonRow from "../../components/order/OrderAddonRow";
import OrderCartBar from "../../components/order/OrderCartBar";
import OrderCartSheet from "../../components/order/OrderCartSheet";
import OrderCheckoutSheet from "../../components/order/OrderCheckoutSheet";
import OrderProductRow from "../../components/order/OrderProductRow";
import OrderResultPanel from "../../components/order/OrderResultPanel";
import OrderThemeToggle from "../../components/order/OrderThemeToggle";

type LoadState = "loading" | "ready" | "error";
type Step = "welcome" | "fulfillment" | "menu" | "addons" | "result";

export default function OrderPageClient() {
  const searchParams = useSearchParams();
  const orderSource: OrderSource =
    searchParams.get("source") === "staff" ? "staff" : "customer";

  const [step, setStep] = useState<Step>("welcome");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [emptyReason, setEmptyReason] = useState<string | null>(null);
  const [missingForCatalog, setMissingForCatalog] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fulfillment, setFulfillment] = useState<OrderFulfillment>("pickup");
  const [pickupMode, setPickupMode] = useState<PickupMode>("takeaway");
  const [cart, setCart] = useState<Record<string, number>>({});

  const [addonProduct, setAddonProduct] = useState<OrderProduct | null>(null);
  const [addons, setAddons] = useState<OrderAddon[]>([]);
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});
  const [addonMissing, setAddonMissing] = useState<string[]>([]);
  const [addonEmptyReason, setAddonEmptyReason] = useState<string | null>(null);
  const [addonLoading, setAddonLoading] = useState(false);

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

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category) set.add(p.category);
    }
    return [...set];
  }, [products]);

  const [activeCategory, setActiveCategory] = useState<string | "all">("all");

  const visibleProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

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

  const productTotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0),
    [lines]
  );

  const addonTotal = useMemo(
    () =>
      Object.entries(addonQty).reduce((sum, [id, qty]) => {
        const a = addons.find((x) => x.id === id);
        return sum + (a ? a.price * qty : 0);
      }, 0),
    [addonQty, addons]
  );

  const totalBaht = productTotal + (step === "addons" ? addonTotal : 0);

  function qtyOf(id: string) {
    return cart[id] ?? 0;
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

  async function openAddons(product: OrderProduct) {
    setAddonProduct(product);
    setAddonQty({});
    setAddonLoading(true);
    setStep("addons");
    try {
      const result = await loadOrderAddons(product.id);
      setAddons(result.addons);
      setAddonEmptyReason(result.emptyReason);
      setAddonMissing(result.missingForAddons);
    } finally {
      setAddonLoading(false);
    }
  }

  function HeaderBar({
    title,
    onBack,
  }: {
    title?: string;
    onBack?: () => void;
  }) {
    return (
      <div className="flex items-center gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-[var(--order-radius-sm)] border border-[var(--order-border)] bg-[var(--order-card)]"
            aria-label="ย้อนกลับ"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
        ) : (
          <div className="w-11" />
        )}
        <div className="min-w-0 flex-1 text-center">
          {title ? (
            <p className="truncate text-[15px] font-semibold">{title}</p>
          ) : null}
        </div>
        <OrderThemeToggle />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col overflow-x-hidden">
      <span className="sr-only" data-order-source={orderSource} aria-hidden />

      {step === "welcome" ? (
        <>
          <HeaderBar />
          <main className="flex flex-1 flex-col px-4 pb-8">
            <TrialBanner />
            {orderSource === "staff" ? <StaffBadge /> : null}

            <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
              <div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--order-accent)] text-[28px] font-bold text-[var(--order-accent-ink)]"
                aria-hidden
              >
                ต
              </div>
              <h1 className="text-[28px] font-semibold tracking-tight text-[var(--order-text)]">
                {ORDER_SHOP_NAME}
              </h1>
              <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-[var(--order-text-muted)]">
                {ORDER_WELCOME_TAGLINE}
              </p>

              <div
                className="mt-8 w-full max-w-sm overflow-hidden rounded-[var(--order-radius-lg)] border border-[var(--order-border)] bg-[var(--order-hero)] shadow-[var(--order-shadow)]"
                data-order-hero="replaceable"
              >
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 px-4 text-[var(--order-text-muted)]">
                  <Store className="h-10 w-10" strokeWidth={1.5} aria-hidden />
                  <p className="text-[13px]">พื้นที่ภาพร้าน — เปลี่ยน Asset ได้ภายหลัง</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep("fulfillment")}
              className="mt-6 flex min-h-[56px] w-full items-center justify-center rounded-[var(--order-radius-lg)] bg-[var(--order-accent)] text-[17px] font-semibold text-[var(--order-accent-ink)]"
            >
              เริ่มสั่งอาหาร
            </button>
          </main>
        </>
      ) : null}

      {step === "fulfillment" ? (
        <>
          <HeaderBar title="ประเภทออเดอร์" onBack={() => setStep("welcome")} />
          <main className="flex flex-1 flex-col px-4 pb-8 pt-2">
            {orderSource === "staff" ? <StaffBadge /> : null}
            <p className="mb-4 text-[14px] text-[var(--order-text-muted)]">
              เลือกรับหน้าร้านหรือจัดส่ง
            </p>

            <div className="grid grid-cols-2 gap-2">
              <FulfillmentCard
                active={fulfillment === "pickup"}
                label="รับหน้าร้าน"
                onClick={() => setFulfillment("pickup")}
              />
              <FulfillmentCard
                active={fulfillment === "delivery"}
                label="จัดส่ง"
                onClick={() => setFulfillment("delivery")}
              />
            </div>

            {fulfillment === "pickup" ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <FulfillmentCard
                  active={pickupMode === "dine_wait"}
                  label="นั่งรอ"
                  compact
                  onClick={() => setPickupMode("dine_wait")}
                />
                <FulfillmentCard
                  active={pickupMode === "takeaway"}
                  label="นำกลับ"
                  compact
                  onClick={() => setPickupMode("takeaway")}
                />
              </div>
            ) : (
              <p className="mt-4 rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] px-3 py-3 text-[13px] leading-relaxed text-[var(--order-text)] shadow-[var(--order-shadow)]">
                {ORDER_DELIVERY_LINE_NOTICE}
              </p>
            )}

            <button
              type="button"
              onClick={() => setStep("menu")}
              className="mt-auto flex min-h-[52px] w-full items-center justify-center rounded-[var(--order-radius)] bg-[var(--order-accent)] text-[16px] font-semibold text-[var(--order-accent-ink)]"
            >
              ดูเมนู
            </button>
          </main>
        </>
      ) : null}

      {step === "menu" ? (
        <>
          <header className="sticky top-0 z-30 border-b border-[var(--order-border)] bg-[var(--order-bg)]/95 backdrop-blur-sm">
            <HeaderBar
              title={ORDER_SHOP_NAME}
              onBack={() => setStep("fulfillment")}
            />
            <div className="px-3 pb-3">
              <TrialBanner />
              {orderSource === "staff" ? (
                <div className="mb-2">
                  <StaffBadge />
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-1 rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] p-1">
                <Chip
                  active={fulfillment === "pickup"}
                  label="รับหน้าร้าน"
                  onClick={() => setFulfillment("pickup")}
                />
                <Chip
                  active={fulfillment === "delivery"}
                  label="จัดส่ง"
                  onClick={() => setFulfillment("delivery")}
                />
              </div>
              {fulfillment === "pickup" ? (
                <div className="mt-2 grid grid-cols-2 gap-1 rounded-[var(--order-radius-sm)] border border-[var(--order-border)] bg-[var(--order-card)] p-1">
                  <Chip
                    active={pickupMode === "dine_wait"}
                    label="นั่งรอ"
                    onClick={() => setPickupMode("dine_wait")}
                  />
                  <Chip
                    active={pickupMode === "takeaway"}
                    label="นำกลับ"
                    onClick={() => setPickupMode("takeaway")}
                  />
                </div>
              ) : (
                <p className="mt-2 rounded-[var(--order-radius-sm)] border border-[var(--order-border)] bg-[var(--order-card)] px-3 py-2 text-[12px] leading-relaxed text-[var(--order-text-muted)]">
                  {ORDER_DELIVERY_LINE_NOTICE}
                </p>
              )}
              {categories.length > 0 ? (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <Chip
                    active={activeCategory === "all"}
                    label="ทั้งหมด"
                    onClick={() => setActiveCategory("all")}
                  />
                  {categories.map((c) => (
                    <Chip
                      key={c}
                      active={activeCategory === c}
                      label={c}
                      onClick={() => setActiveCategory(c)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </header>

          <main className="flex-1 space-y-3 px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-3">
            {loadState === "loading" ? (
              <p className="py-16 text-center text-[15px] text-[var(--order-text-muted)]">
                กำลังโหลดเมนู…
              </p>
            ) : null}
            {loadState === "error" ? (
              <div className="rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] px-4 py-10 text-center">
                <p className="text-[15px] font-medium">{loadError}</p>
                <button
                  type="button"
                  className="mt-4 min-h-[44px] rounded-[var(--order-radius-sm)] bg-[var(--order-accent)] px-4 text-[14px] font-semibold text-[var(--order-accent-ink)]"
                  onClick={() => window.location.reload()}
                >
                  ลองใหม่
                </button>
              </div>
            ) : null}
            {loadState === "ready" && products.length === 0 ? (
              <div className="rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] px-4 py-8 shadow-[var(--order-shadow)]">
                <p className="text-center text-[16px] font-semibold">
                  {emptyReason}
                </p>
                <p className="mt-2 text-center text-[14px] text-[var(--order-text-muted)]">
                  การ์ดเมนูจะแสดงแบบแนวนอน 1 รายการต่อแถว เมื่อมีข้อมูลสินค้าจริง
                </p>
                {missingForCatalog.length > 0 ? (
                  <ul className="mt-4 space-y-2 border-t border-[var(--order-border)] pt-4 text-[13px] text-[var(--order-text-muted)]">
                    <li className="font-medium text-[var(--order-text)]">
                      ข้อมูลที่ยังขาด:
                    </li>
                    {missingForCatalog.map((item) => (
                      <li key={item}>· {item}</li>
                    ))}
                  </ul>
                ) : null}
                <button
                  type="button"
                  className="mx-auto mt-4 flex min-h-[44px] text-[13px] font-medium text-[var(--order-text-muted)] underline"
                  onClick={() =>
                    openAddons({
                      id: "_preview",
                      name: "ยังไม่มีสินค้าจริง",
                      price: 0,
                      imageUrl: null,
                      soldOut: false,
                    })
                  }
                >
                  ดูโครงหน้า Add-on (ยังไม่มีข้อมูล)
                </button>
                <button
                  type="button"
                  className="mx-auto mt-2 flex min-h-[44px] text-[13px] font-medium text-[var(--order-text-muted)] underline"
                  onClick={() => setCheckoutOpen(true)}
                >
                  ดูตัวอย่างฟอร์มยืนยัน
                </button>
              </div>
            ) : null}
            {loadState === "ready" && visibleProducts.length > 0
              ? visibleProducts.map((p) => (
                  <OrderProductRow
                    key={p.id}
                    product={p}
                    qty={qtyOf(p.id)}
                    onInc={() => inc(p.id)}
                    onDec={() => dec(p.id)}
                    onOpenAddons={() => openAddons(p)}
                  />
                ))
              : null}
          </main>

          <OrderCartBar
            itemCount={itemCount}
            totalBaht={productTotal}
            onOpenCart={() => setCartOpen(true)}
          />
        </>
      ) : null}

      {step === "addons" && addonProduct ? (
        <>
          <HeaderBar
            title="ตัวเลือกเพิ่ม"
            onBack={() => setStep("menu")}
          />
          <main className="flex-1 space-y-3 px-3 pb-8 pt-2">
            <div className="rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] px-3 py-3 shadow-[var(--order-shadow)]">
              <p className="text-[13px] text-[var(--order-text-muted)]">สินค้า</p>
              <p className="text-[16px] font-semibold">{addonProduct.name}</p>
            </div>

            {addonLoading ? (
              <p className="py-10 text-center text-[var(--order-text-muted)]">
                กำลังโหลดตัวเลือก…
              </p>
            ) : addons.length === 0 ? (
              <div className="rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] px-4 py-6 shadow-[var(--order-shadow)]">
                <p className="text-center text-[15px] font-semibold">
                  {addonEmptyReason}
                </p>
                <ul className="mt-4 space-y-2 text-[13px] text-[var(--order-text-muted)]">
                  {addonMissing.map((m) => (
                    <li key={m}>· {m}</li>
                  ))}
                </ul>
              </div>
            ) : (
              addons.map((a) => (
                <OrderAddonRow
                  key={a.id}
                  addon={a}
                  qty={addonQty[a.id] ?? 0}
                  onInc={() =>
                    setAddonQty((q) => ({
                      ...q,
                      [a.id]: (q[a.id] ?? 0) + 1,
                    }))
                  }
                  onDec={() =>
                    setAddonQty((q) => {
                      const next = (q[a.id] ?? 0) - 1;
                      if (next <= 0) {
                        const copy = { ...q };
                        delete copy[a.id];
                        return copy;
                      }
                      return { ...q, [a.id]: next };
                    })
                  }
                />
              ))
            )}

            <div className="flex items-center justify-between rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] px-3 py-3">
              <span className="text-[14px] text-[var(--order-text-muted)]">
                ยอด Add-on
              </span>
              <span className="font-semibold tabular-nums">
                {addonTotal.toLocaleString("th-TH")} บาท
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (addonProduct.id !== "_preview" && !addonProduct.soldOut) {
                  inc(addonProduct.id);
                }
                setStep("menu");
              }}
              className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--order-radius)] bg-[var(--order-accent)] text-[16px] font-semibold text-[var(--order-accent-ink)]"
            >
              กลับไปเมนู
            </button>
          </main>
        </>
      ) : null}

      {step === "result" ? (
        <>
          <HeaderBar />
          <OrderResultPanel
            kind="trial_preview"
            title={ORDER_RESULT_TITLE}
            description={ORDER_RESULT_DESCRIPTION}
            primaryLabel="กลับไปเมนู"
            onPrimary={() => {
              setCheckoutOpen(false);
              setStep("menu");
            }}
            secondaryLabel="เริ่มใหม่"
            onSecondary={() => {
              setCart({});
              setStep("welcome");
            }}
          />
        </>
      ) : null}

      <OrderCartSheet
        open={cartOpen}
        lines={lines}
        totalBaht={productTotal}
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
        totalBaht={productTotal}
        onClose={() => setCheckoutOpen(false)}
        onConfirmPreview={() => {
          setCheckoutOpen(false);
          setStep("result");
        }}
      />
    </div>
  );
}

function FulfillmentCard({
  active,
  label,
  onClick,
  compact = false,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[var(--order-radius)] border text-[15px] font-semibold transition-colors ${
        compact ? "min-h-[48px]" : "min-h-[72px]"
      } ${
        active
          ? "border-[var(--order-accent)] bg-[var(--order-accent)] text-[var(--order-accent-ink)] shadow-[var(--order-shadow)]"
          : "border-[var(--order-border)] bg-[var(--order-card)] text-[var(--order-text)]"
      }`}
    >
      {label}
    </button>
  );
}

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] shrink-0 rounded-[var(--order-radius-sm)] px-3 text-[14px] font-medium ${
        active
          ? "bg-[var(--order-accent)] text-[var(--order-accent-ink)]"
          : "text-[var(--order-text-muted)]"
      }`}
    >
      {label}
    </button>
  );
}

function TrialBanner() {
  return (
    <p className="rounded-[var(--order-radius-sm)] border border-[var(--order-accent)]/30 bg-[var(--order-accent-soft)] px-3 py-1.5 text-center text-[12px] font-medium text-[var(--order-accent)]">
      {ORDER_TRIAL_BANNER}
    </p>
  );
}

function StaffBadge() {
  return (
    <p className="mt-2 text-center text-[12px] font-medium text-[var(--order-stainless)]">
      โหมดพนักงาน
    </p>
  );
}
