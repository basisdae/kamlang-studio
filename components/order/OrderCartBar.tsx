"use client";

type Props = {
  itemCount: number;
  totalBaht: number;
  onOpenCart: () => void;
  disabled?: boolean;
};

export default function OrderCartBar({
  itemCount,
  totalBaht,
  onOpenCart,
  disabled = false,
}: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-3 rounded-[var(--order-radius-lg)] border border-[var(--order-border)] bg-[var(--order-card)] p-2.5 shadow-[var(--order-shadow)]">
        <div className="min-w-0 flex-1 px-1">
          <p className="text-[13px] text-[var(--order-text-muted)]">
            {itemCount > 0 ? `${itemCount} รายการ` : "ยังไม่ได้เลือกสินค้า"}
          </p>
          <p className="truncate text-[17px] font-semibold tabular-nums text-[var(--order-text)]">
            {totalBaht.toLocaleString("th-TH")} บาท
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onOpenCart}
          className="flex min-h-[48px] shrink-0 items-center justify-center rounded-[var(--order-radius)] bg-[var(--order-accent)] px-4 text-[15px] font-semibold text-[var(--order-accent-ink)] disabled:cursor-not-allowed disabled:bg-[var(--order-disabled-bg)] disabled:text-[var(--order-disabled)]"
        >
          ดูตะกร้า
        </button>
      </div>
    </div>
  );
}
