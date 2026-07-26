"use client";

import { Minus, Plus, X } from "lucide-react";
import type { CartLine } from "../../lib/order/types";

type Props = {
  open: boolean;
  lines: CartLine[];
  totalBaht: number;
  onClose: () => void;
  onInc: (productId: string) => void;
  onDec: (productId: string) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
};

export default function OrderCartSheet({
  open,
  lines,
  totalBaht,
  onClose,
  onInc,
  onDec,
  onRemove,
  onCheckout,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center px-0 sm:items-center sm:px-4"
      style={{ background: "var(--order-overlay)" }}
      role="dialog"
      aria-modal="true"
      aria-label="ตะกร้า"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-[var(--order-radius-lg)] bg-[var(--order-card)] sm:rounded-[var(--order-radius-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--order-border)] px-4 py-3">
          <h2 className="text-[17px] font-semibold text-[var(--order-text)]">
            ตะกร้า
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

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {lines.length === 0 ? (
            <p className="py-8 text-center text-[15px] text-[var(--order-text-muted)]">
              ยังไม่มีสินค้าในตะกร้า
            </p>
          ) : (
            <ul className="space-y-3">
              {lines.map((line) => (
                <li
                  key={line.productId}
                  className="flex items-start gap-3 border-b border-[var(--order-border)] pb-3 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-[var(--order-text)]">
                      {line.name}
                    </p>
                    <p className="mt-0.5 text-[14px] tabular-nums text-[var(--order-text-muted)]">
                      {line.unitPrice.toLocaleString("th-TH")} บาท
                    </p>
                    {line.addons && line.addons.length > 0 ? (
                      <ul className="mt-1 space-y-0.5 text-[12px] text-[var(--order-text-muted)]">
                        {line.addons.map((a) => (
                          <li key={a.addonId}>
                            + {a.name} × {a.qty}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onRemove(line.productId)}
                      className="mt-1 min-h-[36px] text-[13px] text-[var(--order-error)] underline"
                    >
                      ลบ
                    </button>
                  </div>
                  <div className="flex items-center gap-1 rounded-[var(--order-radius-sm)] border border-[var(--order-border)] bg-[var(--order-bg)] px-1">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center"
                      onClick={() => onDec(line.productId)}
                      aria-label={`ลด ${line.name}`}
                    >
                      <Minus className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <span className="min-w-[1.5rem] text-center font-semibold tabular-nums">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center"
                      onClick={() => onInc(line.productId)}
                      aria-label={`เพิ่ม ${line.name}`}
                    >
                      <Plus className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-[var(--order-border)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[15px] text-[var(--order-text-muted)]">
              ยอดรวม
            </span>
            <span className="text-[18px] font-semibold tabular-nums text-[var(--order-text)]">
              {totalBaht.toLocaleString("th-TH")} บาท
            </span>
          </div>
          <button
            type="button"
            disabled={lines.length === 0}
            onClick={onCheckout}
            className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--order-radius)] bg-[var(--order-accent)] text-[16px] font-semibold text-[var(--order-accent-ink)] disabled:bg-[var(--order-disabled-bg)] disabled:text-[var(--order-disabled)]"
          >
            ไปยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}
