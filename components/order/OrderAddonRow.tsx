"use client";

import { ImageOff, Minus, Plus } from "lucide-react";
import type { OrderAddon } from "../../lib/order/types";

type Props = {
  addon: OrderAddon;
  qty: number;
  onInc: () => void;
  onDec: () => void;
};

export default function OrderAddonRow({ addon, qty, onInc, onDec }: Props) {
  const disabled = addon.soldOut || !addon.available;

  return (
    <article
      className={`flex gap-3 rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] p-3 shadow-[var(--order-shadow)] ${
        disabled ? "opacity-65" : ""
      }`}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--order-radius-sm)] bg-[var(--order-disabled-bg)]">
        {addon.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={addon.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--order-text-muted)]">
            <ImageOff className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold">{addon.name}</h3>
        {addon.description ? (
          <p className="mt-0.5 line-clamp-1 text-[13px] text-[var(--order-text-muted)]">
            {addon.description}
          </p>
        ) : null}
        <p className="mt-1 text-[14px] font-medium tabular-nums">
          +{addon.price.toLocaleString("th-TH")} บาท
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 self-center rounded-[var(--order-radius-sm)] border border-[var(--order-border)] bg-[var(--order-bg)] px-0.5">
        <button
          type="button"
          disabled={qty <= 0 || disabled}
          onClick={onDec}
          className="flex h-10 w-10 items-center justify-center disabled:opacity-35"
          aria-label={`ลด ${addon.name}`}
        >
          <Minus className="h-4 w-4" strokeWidth={2} />
        </button>
        <span className="min-w-[1.25rem] text-center text-[15px] font-semibold tabular-nums">
          {qty}
        </span>
        <button
          type="button"
          disabled={disabled}
          onClick={onInc}
          className="flex h-10 w-10 items-center justify-center disabled:opacity-35"
          aria-label={`เพิ่ม ${addon.name}`}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </article>
  );
}
