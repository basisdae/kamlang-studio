"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock3 } from "lucide-react";
import {
  loadStoreOrders,
  sortOrdersFifo,
  type StoreOrder,
  type StoreOrderStatus,
} from "../../lib/order/storeOrders";
import {
  ORDER_SHOP_NAME,
  ORDER_TRIAL_RESULT_BANNER,
} from "../../lib/order/config";
import OrderThemeToggle from "../../components/order/OrderThemeToggle";

type Tab = "open" | "done" | "all";

function isOpenStatus(s: StoreOrderStatus) {
  return s === "queued" || s === "in_progress";
}

export default function StoreOrdersPageClient() {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [source, setSource] = useState<"empty" | "trial_samples">("empty");
  const [missing, setMissing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("open");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await loadStoreOrders();
      if (cancelled) return;
      setOrders(result.orders);
      setSource(result.source);
      setMissing(result.missingForOrders);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fifoOpen = useMemo(
    () =>
      sortOrdersFifo(orders.filter((o) => isOpenStatus(o.status))),
    [orders]
  );

  const visible = useMemo(() => {
    if (tab === "all") return sortOrdersFifo(orders);
    if (tab === "done") {
      return sortOrdersFifo(orders.filter((o) => o.status === "done"));
    }
    return fifoOpen;
  }, [orders, tab, fifoOpen]);

  const highlightId = fifoOpen[0]?.id ?? null;

  function markDone(id: string) {
    setOrders((list) =>
      list.map((o) => (o.id === id ? { ...o, status: "done" as const } : o))
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col overflow-x-hidden">
      <header className="sticky top-0 z-20 border-b border-[var(--order-border)] bg-[var(--order-bg)]/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-semibold">คิวออเดอร์</h1>
            <p className="text-[13px] text-[var(--order-text-muted)]">
              {ORDER_SHOP_NAME} · เก่าสุดอยู่บน
            </p>
          </div>
          <OrderThemeToggle />
        </div>

        {source === "trial_samples" ? (
          <p className="mx-3 mb-2 rounded-[var(--order-radius-sm)] border border-[var(--order-accent)]/30 bg-[var(--order-accent-soft)] px-3 py-1.5 text-center text-[12px] font-medium text-[var(--order-accent)]">
            {ORDER_TRIAL_RESULT_BANNER}
          </p>
        ) : null}

        <div className="mx-3 mb-3 grid grid-cols-3 gap-1 rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] p-1">
          {(
            [
              ["open", "รอทำ"],
              ["done", "เสร็จแล้ว"],
              ["all", "ทั้งหมด"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`min-h-[44px] rounded-[var(--order-radius-sm)] text-[14px] font-medium ${
                tab === id
                  ? "bg-[var(--order-accent)] text-[var(--order-accent-ink)]"
                  : "text-[var(--order-text-muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 space-y-3 px-3 pb-8 pt-3">
        {loading ? (
          <p className="py-16 text-center text-[var(--order-text-muted)]">
            กำลังโหลดคิว…
          </p>
        ) : null}

        {!loading && visible.length === 0 ? (
          <div className="rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] px-4 py-8 text-center shadow-[var(--order-shadow)]">
            <p className="text-[16px] font-semibold">ยังไม่มีออเดอร์ในคิวนี้</p>
            {missing.length > 0 ? (
              <ul className="mt-4 space-y-2 text-left text-[13px] text-[var(--order-text-muted)]">
                {missing.map((m) => (
                  <li key={m}>· {m}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {visible.map((order) => {
          const highlighted = order.id === highlightId && isOpenStatus(order.status);
          return (
            <article
              key={order.id}
              className={`rounded-[var(--order-radius)] border bg-[var(--order-card)] p-4 shadow-[var(--order-shadow)] ${
                highlighted
                  ? "border-[var(--order-accent)] border-2"
                  : "border-[var(--order-border)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[16px] font-semibold text-[var(--order-text)]">
                    {order.orderNumber}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[13px] text-[var(--order-text-muted)]">
                    <Clock3 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {formatTime(order.receivedAt)}
                  </p>
                </div>
                {highlighted ? (
                  <span className="rounded-full bg-[var(--order-accent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--order-accent-ink)]">
                    คิวถัดไป
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-[14px] text-[var(--order-text)]">
                {order.fulfillment === "pickup"
                  ? `รับหน้าร้าน${
                      order.pickupMode
                        ? ` · ${
                            order.pickupMode === "dine_wait"
                              ? "นั่งรอ"
                              : "นำกลับ"
                          }`
                        : ""
                    }`
                  : "จัดส่ง"}
              </p>
              <p className="mt-1 text-[14px]">
                <span className="font-medium">{order.nickname}</span>
                <span className="text-[var(--order-text-muted)]">
                  {" "}
                  · {order.phone}
                </span>
              </p>

              <ul className="mt-3 space-y-1 border-t border-[var(--order-border)] pt-3 text-[14px]">
                {order.lines.map((line, idx) => (
                  <li key={`${order.id}-${idx}`}>
                    {line.name} × {line.qty}
                    {line.addons?.map((a, i) => (
                      <span
                        key={i}
                        className="block pl-3 text-[13px] text-[var(--order-text-muted)]"
                      >
                        + {a.name} × {a.qty}
                      </span>
                    ))}
                  </li>
                ))}
              </ul>

              {order.note ? (
                <p className="mt-2 text-[13px] text-[var(--order-text-muted)]">
                  หมายเหตุ: {order.note}
                </p>
              ) : null}

              <div className="mt-3 flex items-center justify-between text-[14px]">
                <span className="text-[var(--order-text-muted)]">
                  {order.paymentLabel ?? "—"}
                </span>
                <span className="font-semibold tabular-nums">
                  {order.totalBaht.toLocaleString("th-TH")} บาท
                </span>
              </div>

              {isOpenStatus(order.status) ? (
                <button
                  type="button"
                  onClick={() => markDone(order.id)}
                  className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--order-radius)] bg-[var(--order-accent)] text-[15px] font-semibold text-[var(--order-accent-ink)]"
                >
                  <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
                  ทำเครื่องหมายว่าเสร็จ (ทดลอง)
                </button>
              ) : (
                <p className="mt-3 text-center text-[13px] text-[var(--order-success)]">
                  เสร็จแล้ว
                </p>
              )}
            </article>
          );
        })}
      </main>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}
