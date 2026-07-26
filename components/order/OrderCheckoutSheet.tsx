"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  ORDER_DELIVERY_LINE_NOTICE,
  ORDER_TRIAL_BANNER,
  getOrderLineOaUrl,
} from "../../lib/order/config";
import type {
  CartLine,
  DeliveryCheckoutDraft,
  OrderFulfillment,
  PickupCheckoutDraft,
  PickupMode,
} from "../../lib/order/types";

type Props = {
  open: boolean;
  fulfillment: OrderFulfillment;
  pickupMode: PickupMode;
  lines: CartLine[];
  totalBaht: number;
  onClose: () => void;
  onConfirmPreview: () => void;
};

const FIELD =
  "mt-1.5 w-full min-h-[48px] rounded-[var(--order-radius-sm)] border border-[var(--order-border)] bg-[var(--order-bg)] px-3 text-[16px] text-[var(--order-text)] outline-none focus:border-[var(--order-accent)]";

export default function OrderCheckoutSheet({
  open,
  fulfillment,
  pickupMode,
  lines,
  totalBaht,
  onClose,
  onConfirmPreview,
}: Props) {
  const [pickup, setPickup] = useState<PickupCheckoutDraft>({
    nickname: "",
    phone: "",
  });
  const [delivery, setDelivery] = useState<DeliveryCheckoutDraft>({
    nickname: "",
    phone: "",
    address: "",
    note: "",
  });
  const [error, setError] = useState<string | null>(null);
  const lineOa = getOrderLineOaUrl();

  if (!open) return null;

  function validate(): boolean {
    setError(null);
    // Empty-cart preview (no real catalog yet) — allow opening result panel for UX review
    if (lines.length === 0) return true;
    if (fulfillment === "pickup") {
      if (!pickup.nickname.trim()) {
        setError("กรุณาใส่ชื่อเล่น");
        return false;
      }
      if (!pickup.phone.trim()) {
        setError("กรุณาใส่เบอร์โทร");
        return false;
      }
    } else {
      if (!delivery.nickname.trim()) {
        setError("กรุณาใส่ชื่อเล่น");
        return false;
      }
      if (!delivery.phone.trim()) {
        setError("กรุณาใส่เบอร์โทร");
        return false;
      }
      if (!delivery.address.trim()) {
        setError("กรุณาใส่ที่อยู่จัดส่ง");
        return false;
      }
    }
    return true;
  }

  function handleConfirm() {
    if (!validate()) return;
    onConfirmPreview();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4"
      style={{ background: "var(--order-overlay)" }}
      role="dialog"
      aria-modal="true"
      aria-label="สรุปออเดอร์"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--order-radius-lg)] bg-[var(--order-card)] sm:rounded-[var(--order-radius-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--order-border)] px-4 py-3">
          <h2 className="text-[17px] font-semibold text-[var(--order-text)]">
            สรุปก่อนส่ง
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center text-[var(--order-text-muted)]"
            aria-label="ปิด"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
          <p className="rounded-[var(--order-radius-sm)] bg-[var(--order-accent)] px-3 py-2 text-center text-[13px] font-medium text-[var(--order-accent-ink)]">
            {ORDER_TRIAL_BANNER}
          </p>

          <section>
            <p className="text-[13px] text-[var(--order-text-muted)]">ประเภท</p>
            <p className="mt-1 text-[15px] font-medium text-[var(--order-text)]">
              {fulfillment === "pickup"
                ? `รับหน้าร้าน · ${
                    pickupMode === "takeaway" ? "นำกลับ" : "นั่งรอ"
                  }`
                : "จัดส่ง"}
            </p>
          </section>

          <section className="space-y-2">
            <p className="text-[13px] font-medium text-[var(--order-text-muted)]">
              รายการ
            </p>
            <ul className="space-y-1.5">
              {lines.map((l) => (
                <li
                  key={l.productId}
                  className="flex justify-between gap-2 text-[14px] text-[var(--order-text)]"
                >
                  <span className="min-w-0 truncate">
                    {l.name} × {l.qty}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {(l.unitPrice * l.qty).toLocaleString("th-TH")} บาท
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-[var(--order-border)] pt-2 text-[16px] font-semibold text-[var(--order-text)]">
              <span>ยอดรวม</span>
              <span className="tabular-nums">
                {totalBaht.toLocaleString("th-TH")} บาท
              </span>
            </div>
          </section>

          {fulfillment === "pickup" ? (
            <section className="space-y-3">
              <label className="block">
                <span className="text-[13px] text-[var(--order-text-muted)]">
                  ชื่อเล่น *
                </span>
                <input
                  className={FIELD}
                  value={pickup.nickname}
                  onChange={(e) =>
                    setPickup((p) => ({ ...p, nickname: e.target.value }))
                  }
                  autoComplete="nickname"
                />
              </label>
              <label className="block">
                <span className="text-[13px] text-[var(--order-text-muted)]">
                  เบอร์โทร *
                </span>
                <input
                  className={FIELD}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={pickup.phone}
                  onChange={(e) =>
                    setPickup((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </label>
            </section>
          ) : (
            <section className="space-y-3">
              <p className="rounded-[var(--order-radius-sm)] bg-[var(--order-bg)] px-3 py-2.5 text-[13px] leading-relaxed text-[var(--order-text)]">
                {ORDER_DELIVERY_LINE_NOTICE}
              </p>
              {!lineOa ? (
                <p className="text-[12px] text-[var(--order-text-muted)]">
                  ยังไม่ได้ตั้งค่า LINE OA URL — ใส่{" "}
                  <code className="text-[11px]">NEXT_PUBLIC_ORDER_LINE_OA_URL</code>{" "}
                  ภายหลัง
                </p>
              ) : (
                <a
                  href={lineOa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center text-[14px] font-medium text-[var(--order-text)] underline"
                >
                  เปิด LINE ของร้าน
                </a>
              )}
              <label className="block">
                <span className="text-[13px] text-[var(--order-text-muted)]">
                  ชื่อเล่น *
                </span>
                <input
                  className={FIELD}
                  value={delivery.nickname}
                  onChange={(e) =>
                    setDelivery((d) => ({ ...d, nickname: e.target.value }))
                  }
                />
              </label>
              <label className="block">
                <span className="text-[13px] text-[var(--order-text-muted)]">
                  เบอร์โทร *
                </span>
                <input
                  className={FIELD}
                  type="tel"
                  inputMode="numeric"
                  value={delivery.phone}
                  onChange={(e) =>
                    setDelivery((d) => ({ ...d, phone: e.target.value }))
                  }
                />
              </label>
              <label className="block">
                <span className="text-[13px] text-[var(--order-text-muted)]">
                  ที่อยู่จัดส่ง *
                </span>
                <textarea
                  className={`${FIELD} min-h-[88px] py-3`}
                  value={delivery.address}
                  onChange={(e) =>
                    setDelivery((d) => ({ ...d, address: e.target.value }))
                  }
                />
              </label>
              <label className="block">
                <span className="text-[13px] text-[var(--order-text-muted)]">
                  หมายเหตุ (ไม่บังคับ)
                </span>
                <textarea
                  className={`${FIELD} min-h-[64px] py-3`}
                  value={delivery.note}
                  onChange={(e) =>
                    setDelivery((d) => ({ ...d, note: e.target.value }))
                  }
                />
              </label>
            </section>
          )}

          {error ? (
            <p className="text-[13px] text-[var(--order-error)]" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="border-t border-[var(--order-border)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--order-radius)] bg-[var(--order-accent)] text-[16px] font-semibold text-[var(--order-accent-ink)]"
          >
            ดูสรุปทดลอง (ยังไม่ส่ง)
          </button>
        </div>
      </div>
    </div>
  );
}
