"use client";

import type { OrderProduct } from "../../lib/order/types";

type Props = {
  product: OrderProduct;
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
};

export default function OrderProductCard({
  product,
  qty,
  onAdd,
  onInc,
  onDec,
}: Props) {
  const soldOut = product.soldOut;

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border border-[var(--kl-border)] bg-white shadow-sm ${
        soldOut ? "opacity-70" : ""
      }`}
    >
      <div className="relative aspect-square w-full bg-[var(--bi-surface,#f3f4f6)]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote catalog URLs vary
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[length:var(--kl-type-caption-size)] text-kl-muted">
            ไม่มีรูป
          </div>
        )}
        {soldOut ? (
          <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2.5 py-1 text-[12px] font-medium text-white">
            หมด
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2.5">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug text-[var(--bi-text-primary)]">
          {product.name}
        </h3>
        <p className="text-[15px] font-medium tabular-nums">
          {product.price.toLocaleString("th-TH")} บาท
        </p>

        {qty <= 0 ? (
          <button
            type="button"
            disabled={soldOut}
            onClick={onAdd}
            className="mt-auto flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--bi-lemon)] text-[15px] font-semibold text-[var(--bi-text-primary)] disabled:cursor-not-allowed disabled:bg-kl-surface disabled:text-kl-muted"
          >
            {soldOut ? "หมด" : "เพิ่ม"}
          </button>
        ) : (
          <div className="mt-auto flex min-h-[44px] items-center justify-between gap-1 rounded-xl bg-kl-surface px-1">
            <button
              type="button"
              onClick={onDec}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-xl font-semibold"
              aria-label={`ลด ${product.name}`}
            >
              −
            </button>
            <span className="min-w-[1.5rem] text-center text-[16px] font-semibold tabular-nums">
              {qty}
            </span>
            <button
              type="button"
              disabled={soldOut}
              onClick={onInc}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-xl font-semibold disabled:opacity-40"
              aria-label={`เพิ่ม ${product.name}`}
            >
              +
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
