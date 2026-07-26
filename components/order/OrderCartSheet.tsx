"use client";

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label="ตะกร้า"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl bg-white sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--kl-border)] px-4 py-3">
          <h2 className="text-[17px] font-semibold">ตะกร้า</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] text-[15px] text-kl-muted"
          >
            ปิด
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {lines.length === 0 ? (
            <p className="py-8 text-center text-[15px] text-kl-muted">
              ยังไม่มีสินค้าในตะกร้า
            </p>
          ) : (
            <ul className="space-y-3">
              {lines.map((line) => (
                <li
                  key={line.productId}
                  className="flex items-start gap-3 border-b border-[var(--kl-border)] pb-3 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium">{line.name}</p>
                    <p className="mt-0.5 text-[14px] tabular-nums text-kl-muted">
                      {line.unitPrice.toLocaleString("th-TH")} บาท
                    </p>
                    <button
                      type="button"
                      onClick={() => onRemove(line.productId)}
                      className="mt-1 min-h-[36px] text-[13px] text-kl-danger-text underline"
                    >
                      ลบ
                    </button>
                  </div>
                  <div className="flex items-center gap-1 rounded-xl bg-kl-surface px-1">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center text-xl"
                      onClick={() => onDec(line.productId)}
                      aria-label={`ลด ${line.name}`}
                    >
                      −
                    </button>
                    <span className="min-w-[1.5rem] text-center font-semibold tabular-nums">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center text-xl"
                      onClick={() => onInc(line.productId)}
                      aria-label={`เพิ่ม ${line.name}`}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-[var(--kl-border)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[15px] text-kl-muted">ยอดรวม</span>
            <span className="text-[18px] font-semibold tabular-nums">
              {totalBaht.toLocaleString("th-TH")} บาท
            </span>
          </div>
          <button
            type="button"
            disabled={lines.length === 0}
            onClick={onCheckout}
            className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[var(--bi-lemon)] text-[16px] font-semibold disabled:bg-kl-surface disabled:text-kl-muted"
          >
            ไปชำระ / ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}
