"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Store } from "lucide-react";
import {
  MOCK_CATEGORY_TILES,
  MOCK_ORDER_PRODUCTS,
  TOKYO_FILTERS,
  categoryLabel,
  filterTokyoProducts,
  getMockProductById,
  getMockProductsByCategory,
  type ProductCategoryId,
  type TokyoFilterId,
} from "../../lib/order/mockCatalog";
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
  OrderFulfillment,
  OrderSource,
} from "../../lib/order/types";
import OrderCartBar from "../../components/order/OrderCartBar";
import OrderCartSheet from "../../components/order/OrderCartSheet";
import OrderCheckoutSheet from "../../components/order/OrderCheckoutSheet";
import OrderProductRow from "../../components/order/OrderProductRow";
import OrderResultPanel from "../../components/order/OrderResultPanel";
import OrderThemeToggle from "../../components/order/OrderThemeToggle";

type Step = "welcome" | "fulfillment" | "categories" | "products" | "result";

type FlowState = {
  step: Step;
  categoryId: ProductCategoryId | null;
  tokyoFilter: TokyoFilterId;
};

function readFlowFromUrl(params: URLSearchParams): FlowState {
  const stepRaw = params.get("step");
  const step: Step =
    stepRaw === "fulfillment" ||
    stepRaw === "categories" ||
    stepRaw === "products" ||
    stepRaw === "result"
      ? stepRaw
      : "welcome";

  const cat = params.get("category");
  const categoryId =
    cat === "tokyo" ||
    cat === "sandwich" ||
    cat === "burger" ||
    cat === "ricebox"
      ? cat
      : null;

  const tab = params.get("tokyoTab");
  const tokyoFilter: TokyoFilterId =
    tab === "bestsellers" ||
    tab === "regular" ||
    tab === "special" ||
    tab === "featured"
      ? tab
      : "featured";

  return {
    step: step === "products" && !categoryId ? "categories" : step,
    categoryId,
    tokyoFilter,
  };
}

export default function OrderPageClient() {
  const searchParams = useSearchParams();
  const orderSource: OrderSource =
    searchParams.get("source") === "staff" ? "staff" : "customer";

  const [flow, setFlow] = useState<FlowState>(() =>
    readFlowFromUrl(new URLSearchParams(searchParams.toString()))
  );
  const [fulfillment, setFulfillment] = useState<OrderFulfillment>("pickup");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const syncUrl = useCallback(
    (next: FlowState, mode: "push" | "replace" = "push") => {
      const url = new URL(window.location.href);
      url.searchParams.set("step", next.step);
      if (orderSource === "staff") {
        url.searchParams.set("source", "staff");
      } else {
        url.searchParams.delete("source");
      }
      if (next.step === "products" && next.categoryId) {
        url.searchParams.set("category", next.categoryId);
      } else {
        url.searchParams.delete("category");
      }
      if (next.step === "products" && next.categoryId === "tokyo") {
        url.searchParams.set("tokyoTab", next.tokyoFilter);
      } else {
        url.searchParams.delete("tokyoTab");
      }
      const href = `${url.pathname}${url.search}`;
      if (mode === "push") {
        window.history.pushState({ orderFlow: next }, "", href);
      } else {
        window.history.replaceState({ orderFlow: next }, "", href);
      }
      setFlow(next);
    },
    [orderSource]
  );

  useEffect(() => {
    const initial = readFlowFromUrl(
      new URLSearchParams(window.location.search)
    );
    window.history.replaceState({ orderFlow: initial }, "", window.location.href);
    setFlow(initial);

    function onPop() {
      const fromUrl = readFlowFromUrl(
        new URLSearchParams(window.location.search)
      );
      setFlow(fromUrl);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const productById = useMemo(() => {
    const map = new Map(
      MOCK_ORDER_PRODUCTS.map((p) => [p.id, p] as const)
    );
    return map;
  }, []);

  const lines: CartLine[] = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([productId, qty]) => {
        const p = productById.get(productId) ?? getMockProductById(productId);
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

  function inc(productId: string) {
    const p = productById.get(productId);
    if (p?.soldOut) return;
    setCart((c) => ({ ...c, [productId]: (c[productId] ?? 0) + 1 }));
  }

  function dec(productId: string) {
    setCart((c) => {
      const next = (c[productId] ?? 0) - 1;
      if (next <= 0) {
        const copy = { ...c };
        delete copy[productId];
        return copy;
      }
      return { ...c, [productId]: next };
    });
  }

  function remove(productId: string) {
    setCart((c) => {
      const copy = { ...c };
      delete copy[productId];
      return copy;
    });
  }

  const categoryProducts = useMemo(() => {
    if (!flow.categoryId) return [];
    const list = getMockProductsByCategory(flow.categoryId);
    if (flow.categoryId === "tokyo") {
      return filterTokyoProducts(list, flow.tokyoFilter);
    }
    return list;
  }, [flow.categoryId, flow.tokyoFilter]);

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

  function goBackFromProducts() {
    syncUrl({
      step: "categories",
      categoryId: null,
      tokyoFilter: flow.tokyoFilter,
    });
  }

  function goBackFromCategories() {
    syncUrl({
      step: "fulfillment",
      categoryId: null,
      tokyoFilter: flow.tokyoFilter,
    });
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col overflow-x-hidden">
      <span className="sr-only" data-order-source={orderSource} aria-hidden />

      {flow.step === "welcome" ? (
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
                  <p className="text-[13px]">พื้นที่ภาพร้าน</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                syncUrl({
                  step: "fulfillment",
                  categoryId: null,
                  tokyoFilter: flow.tokyoFilter,
                })
              }
              className="mt-6 flex min-h-[56px] w-full items-center justify-center rounded-[var(--order-radius-lg)] bg-[var(--order-accent)] text-[17px] font-semibold text-[var(--order-accent-ink)]"
            >
              เริ่มสั่งอาหาร
            </button>
          </main>
        </>
      ) : null}

      {flow.step === "fulfillment" ? (
        <>
          <HeaderBar
            title="ประเภทการสั่ง"
            onBack={() =>
              syncUrl({
                step: "welcome",
                categoryId: null,
                tokyoFilter: flow.tokyoFilter,
              })
            }
          />
          <main className="flex flex-1 flex-col px-4 pb-8 pt-2">
            {orderSource === "staff" ? <StaffBadge /> : null}
            <p className="mb-4 text-[14px] text-[var(--order-text-muted)]">
              เลือกรับหน้าร้านหรือจัดส่ง
            </p>

            <div className="grid grid-cols-2 gap-2">
              <ChoiceCard
                active={fulfillment === "pickup"}
                label="รับหน้าร้าน"
                onClick={() => {
                  setFulfillment("pickup");
                  syncUrl({
                    step: "categories",
                    categoryId: null,
                    tokyoFilter: flow.tokyoFilter,
                  });
                }}
              />
              <ChoiceCard
                active={fulfillment === "delivery"}
                label="จัดส่ง"
                onClick={() => {
                  setFulfillment("delivery");
                  syncUrl({
                    step: "categories",
                    categoryId: null,
                    tokyoFilter: flow.tokyoFilter,
                  });
                }}
              />
            </div>

            <p className="mt-4 rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] px-3 py-3 text-[13px] leading-relaxed text-[var(--order-text-muted)]">
              {ORDER_DELIVERY_LINE_NOTICE}
            </p>
          </main>
        </>
      ) : null}

      {flow.step === "categories" ? (
        <>
          <header className="sticky top-0 z-30 border-b border-[var(--order-border)] bg-[var(--order-bg)]/95 backdrop-blur-sm">
            <HeaderBar
              title="สั่งอาหาร"
              onBack={goBackFromCategories}
            />
            <div className="flex items-center justify-between gap-2 px-3 pb-3">
              <p className="rounded-full border border-[var(--order-border)] bg-[var(--order-card)] px-3 py-1 text-[12px] text-[var(--order-text)]">
                {fulfillment === "pickup" ? "รับหน้าร้าน" : "จัดส่ง"}
              </p>
              <button
                type="button"
                onClick={goBackFromCategories}
                className="min-h-[40px] text-[13px] font-medium text-[var(--order-accent)] underline"
              >
                เปลี่ยน
              </button>
            </div>
          </header>

          <main className="flex-1 space-y-3 px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-3">
            <TrialBanner />
            {orderSource === "staff" ? <StaffBadge /> : null}

            <div
              className="flex h-20 items-center justify-center rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-hero)] px-4"
              aria-label="แบนเนอร์โปรโมชัน"
            >
              <p className="text-center text-[14px] font-medium text-[var(--order-text-muted)]">
                โปรโมชันและเมนูแนะนำ · Placeholder
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {MOCK_CATEGORY_TILES.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() =>
                    syncUrl({
                      step: "products",
                      categoryId: tile.id,
                      tokyoFilter:
                        tile.id === "tokyo" ? flow.tokyoFilter : "featured",
                    })
                  }
                  className="flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] p-3 shadow-[var(--order-shadow)]"
                >
                  <span
                    className="h-12 w-12 rounded-[var(--order-radius-sm)]"
                    style={{ background: tile.color }}
                    aria-hidden
                  />
                  <span className="text-[16px] font-semibold text-[var(--order-text)]">
                    {tile.label}
                  </span>
                </button>
              ))}
            </div>
          </main>

          <OrderCartBar
            itemCount={itemCount}
            totalBaht={totalBaht}
            onOpenCart={() => setCartOpen(true)}
          />
        </>
      ) : null}

      {flow.step === "products" && flow.categoryId ? (
        <>
          <header className="sticky top-0 z-30 border-b border-[var(--order-border)] bg-[var(--order-bg)]/95 backdrop-blur-sm">
            <HeaderBar
              title={categoryLabel(flow.categoryId)}
              onBack={goBackFromProducts}
            />
            {flow.categoryId === "tokyo" ? (
              <div className="flex gap-1 overflow-x-auto px-3 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {TOKYO_FILTERS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      syncUrl(
                        {
                          step: "products",
                          categoryId: "tokyo",
                          tokyoFilter: tab.id,
                        },
                        "replace"
                      )
                    }
                    className={`min-h-[40px] shrink-0 rounded-full px-3.5 text-[13px] font-medium ${
                      flow.tokyoFilter === tab.id
                        ? "bg-[var(--order-accent)] text-[var(--order-accent-ink)]"
                        : "border border-[var(--order-border)] bg-[var(--order-card)] text-[var(--order-text-muted)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            ) : null}
          </header>

          <main className="flex-1 space-y-3 px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-3">
            {categoryProducts.length === 0 ? (
              <p className="py-12 text-center text-[15px] text-[var(--order-text-muted)]">
                ยังไม่มีรายการในหมวดนี้
              </p>
            ) : (
              categoryProducts.map((p) => (
                <OrderProductRow
                  key={p.id}
                  product={p}
                  qty={qtyOf(p.id)}
                  onInc={() => inc(p.id)}
                  onDec={() => dec(p.id)}
                />
              ))
            )}
          </main>

          <OrderCartBar
            itemCount={itemCount}
            totalBaht={totalBaht}
            onOpenCart={() => setCartOpen(true)}
          />
        </>
      ) : null}

      {flow.step === "result" ? (
        <>
          <HeaderBar />
          <OrderResultPanel
            kind="trial_preview"
            title={ORDER_RESULT_TITLE}
            description={ORDER_RESULT_DESCRIPTION}
            primaryLabel="กลับไปเลือกเมนู"
            onPrimary={() =>
              syncUrl({
                step: "categories",
                categoryId: null,
                tokyoFilter: flow.tokyoFilter,
              })
            }
            secondaryLabel="เริ่มใหม่"
            onSecondary={() => {
              setCart({});
              syncUrl({
                step: "welcome",
                categoryId: null,
                tokyoFilter: "featured",
              });
            }}
          />
        </>
      ) : null}

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
        lines={lines}
        totalBaht={totalBaht}
        onClose={() => setCheckoutOpen(false)}
        onConfirmPreview={() => {
          setCheckoutOpen(false);
          syncUrl({
            step: "result",
            categoryId: null,
            tokyoFilter: flow.tokyoFilter,
          });
        }}
      />
    </div>
  );
}

function ChoiceCard({
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
      className={`min-h-[72px] rounded-[var(--order-radius)] border text-[15px] font-semibold ${
        active
          ? "border-[var(--order-accent)] bg-[var(--order-accent)] text-[var(--order-accent-ink)] shadow-[var(--order-shadow)]"
          : "border-[var(--order-border)] bg-[var(--order-card)] text-[var(--order-text)]"
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
