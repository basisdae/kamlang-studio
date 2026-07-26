"use client";

import { Minus, Plus } from "lucide-react";
import type { MockOrderProduct } from "../../lib/order/mockCatalog";
import type { OrderProduct } from "../../lib/order/types";

type Props = {
  product: OrderProduct | MockOrderProduct;
  qty: number;
  onInc: () => void;
  onDec: () => void;
};

function isMock(p: OrderProduct | MockOrderProduct): p is MockOrderProduct {
  return "isMock" in p && p.isMock === true;
}

export default function OrderProductRow({
  product,
  qty,
  onInc,
  onDec,
}: Props) {
  const soldOut = product.soldOut;
  const mock = isMock(product);

  return (
    <article
      className={`flex gap-3 rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] p-3 shadow-[var(--order-shadow)] ${
        soldOut ? "opacity-70" : ""
      }`}
    >
      <div
        className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[var(--order-radius-sm)]"
        style={{
          background: mock
            ? product.placeholderColor
            : "var(--order-disabled-bg)",
        }}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
        {soldOut ? (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-[var(--order-text)] px-2 py-0.5 text-[11px] font-medium text-[var(--order-card)]">
            หมด
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-[var(--order-text)]">
          {product.name}
        </h3>
        {mock ? (
          <p className="mt-0.5 text-[12px] font-medium text-[var(--order-accent)]">
            ข้อมูลตัวอย่าง
          </p>
        ) : product.description ? (
          <p className="mt-0.5 line-clamp-1 text-[13px] text-[var(--order-text-muted)]">
            {product.description}
          </p>
        ) : null}
        <p className="mt-1 text-[15px] font-semibold tabular-nums text-[var(--order-text)]">
          {product.price.toLocaleString("th-TH")} บาท
          {mock ? (
            <span className="ml-1 text-[12px] font-normal text-[var(--order-text-muted)]">
              (ตัวอย่าง)
            </span>
          ) : null}
        </p>

        <div className="mt-auto flex items-center justify-end gap-2 pt-2">
          {qty <= 0 ? (
            <button
              type="button"
              disabled={soldOut}
              onClick={onInc}
              className="flex min-h-[44px] min-w-[88px] items-center justify-center rounded-[var(--order-radius-sm)] bg-[var(--order-accent)] px-3 text-[14px] font-semibold text-[var(--order-accent-ink)] disabled:bg-[var(--order-disabled-bg)] disabled:text-[var(--order-disabled)]"
            >
              {soldOut ? "หมด" : "เพิ่ม"}
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-[var(--order-radius-sm)] border border-[var(--order-border)] bg-[var(--order-bg)] px-1">
              <button
                type="button"
                onClick={onDec}
                className="flex h-10 w-10 items-center justify-center"
                aria-label={`ลด ${product.name}`}
              >
                <Minus className="h-4 w-4" strokeWidth={2} />
              </button>
              <span className="min-w-[1.5rem] text-center text-[15px] font-semibold tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                disabled={soldOut}
                onClick={onInc}
                className="flex h-10 w-10 items-center justify-center disabled:opacity-40"
                aria-label={`เพิ่ม ${product.name}`}
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
