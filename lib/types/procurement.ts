/**
 * Procurement metadata stored in bi_assets.specifications.procurement
 * (no schema migration — JSON column already exists).
 */

export type ProcurementQuote = {
  id: string;
  vendor: string;
  amount: number | null;
  note: string;
  at: string;
};

export type ProcurementMeta = {
  quotes: ProcurementQuote[];
  selectedQuoteId: string | null;
  billNumber: string;
  receivedAt: string | null;
  attachmentUrl: string;
  attachmentLabel: string;
};

export function emptyProcurementMeta(): ProcurementMeta {
  return {
    quotes: [],
    selectedQuoteId: null,
    billNumber: "",
    receivedAt: null,
    attachmentUrl: "",
    attachmentLabel: "",
  };
}

export function parseProcurementMeta(raw: unknown): ProcurementMeta {
  const base = emptyProcurementMeta();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<ProcurementMeta>;
  const quotes = Array.isArray(p.quotes)
    ? p.quotes
        .filter((q) => q && typeof q === "object")
        .map((q) => ({
          id: String(
            (q as ProcurementQuote).id ||
              `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          ),
          vendor: String((q as ProcurementQuote).vendor ?? ""),
          amount:
            (q as ProcurementQuote).amount == null ||
            Number.isNaN(Number((q as ProcurementQuote).amount))
              ? null
              : Number((q as ProcurementQuote).amount),
          note: String((q as ProcurementQuote).note ?? ""),
          at: String((q as ProcurementQuote).at ?? ""),
        }))
    : [];
  return {
    quotes,
    selectedQuoteId: p.selectedQuoteId ?? null,
    billNumber: String(p.billNumber ?? ""),
    receivedAt: p.receivedAt ?? null,
    attachmentUrl: String(p.attachmentUrl ?? ""),
    attachmentLabel: String(p.attachmentLabel ?? ""),
  };
}
