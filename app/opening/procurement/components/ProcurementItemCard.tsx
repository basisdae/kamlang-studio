"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import FormField from "../../../../components/ui/FormField";
import { KL_FIELD_CLASS } from "../../../../components/ui/designLock";
import {
  ASSET_STATUS_LABELS,
  type AssetItem,
} from "../../../../data/seed/tangtao";
import { formatBaht } from "../../sampleData";
import { useAssets } from "../../assets/AssetsProvider";
import {
  newQuoteId,
  PROCUREMENT_STAGE_LABELS,
  procurementStageOf,
  readProcurementMeta,
  todayIsoDate,
  type ProcurementMeta,
  type ProcurementQuote,
} from "../../lib/procurementDomain";

type Props = {
  item: AssetItem;
};

/**
 * One procurement card — quote → compare → order → receive on same bi_assets row.
 */
export default function ProcurementItemCard({ item }: Props) {
  const { updateAsset, saving } = useAssets();
  const [open, setOpen] = useState(false);
  const meta = useMemo(() => readProcurementMeta(item), [item]);
  const stage = procurementStageOf(item);

  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [quoteNote, setQuoteNote] = useState("");
  const [supplier, setSupplier] = useState(item.supplier || "");
  const [purchaseDate, setPurchaseDate] = useState(
    item.purchasedAt || todayIsoDate()
  );
  const [receivedAt, setReceivedAt] = useState(
    meta.receivedAt || todayIsoDate()
  );
  const [billNumber, setBillNumber] = useState(meta.billNumber);
  const [attachmentUrl, setAttachmentUrl] = useState(
    meta.attachmentUrl || item.purchaseUrl || ""
  );
  const [attachmentLabel, setAttachmentLabel] = useState(
    meta.attachmentLabel || ""
  );

  async function saveMeta(
    nextMeta: ProcurementMeta,
    patch: Record<string, unknown> = {}
  ) {
    await updateAsset(item.id, {
      ...patch,
      procurement: nextMeta,
      purchaseUrl: nextMeta.attachmentUrl || item.purchaseUrl,
    });
  }

  async function startRequestQuote() {
    await updateAsset(item.id, {
      status: "awaiting_quote",
      procurement: meta,
    });
    setOpen(true);
  }

  async function addQuote() {
    const v = vendor.trim();
    if (!v) return;
    const parsed = amount.trim() ? Number(amount.replace(/,/g, "")) : null;
    const quote: ProcurementQuote = {
      id: newQuoteId(),
      vendor: v,
      amount: parsed != null && Number.isFinite(parsed) ? parsed : null,
      note: quoteNote.trim(),
      at: todayIsoDate(),
    };
    const next: ProcurementMeta = {
      ...meta,
      quotes: [...meta.quotes, quote],
    };
    setVendor("");
    setAmount("");
    setQuoteNote("");
    await saveMeta(next, { status: "awaiting_quote" });
  }

  async function selectQuote(quote: ProcurementQuote) {
    const next: ProcurementMeta = {
      ...meta,
      selectedQuoteId: quote.id,
      billNumber,
      attachmentUrl,
      attachmentLabel,
    };
    await saveMeta(next, {
      status: "ready_to_buy",
      supplier: quote.vendor,
      estimatedPrice: quote.amount,
      actualPrice: quote.amount,
    });
    setSupplier(quote.vendor);
  }

  async function placeOrder() {
    const next: ProcurementMeta = {
      ...meta,
      billNumber: billNumber.trim(),
      attachmentUrl: attachmentUrl.trim(),
      attachmentLabel: attachmentLabel.trim(),
      receivedAt: null,
    };
    await saveMeta(next, {
      status: "ordered",
      supplier: supplier.trim() || item.supplier,
      purchasedAt: purchaseDate || todayIsoDate(),
      purchaseUrl: attachmentUrl.trim() || item.purchaseUrl,
    });
  }

  async function markReceived() {
    const next: ProcurementMeta = {
      ...meta,
      billNumber: billNumber.trim(),
      attachmentUrl: attachmentUrl.trim(),
      attachmentLabel: attachmentLabel.trim(),
      receivedAt: receivedAt || todayIsoDate(),
    };
    await saveMeta(next, {
      status: "received",
      supplier: supplier.trim() || item.supplier,
      purchasedAt: item.purchasedAt || purchaseDate || todayIsoDate(),
      purchaseUrl: attachmentUrl.trim() || item.purchaseUrl,
    });
  }

  const unit = item.actualPrice ?? item.estimatedPrice;

  return (
    <Card className="space-y-3 !p-4">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left kl-pressable"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0">
          <p className="kl-type-card-title truncate">{item.name}</p>
          <p className="kl-type-caption mt-1">
            {PROCUREMENT_STAGE_LABELS[stage]} ·{" "}
            {ASSET_STATUS_LABELS[item.status]}
            {item.supplier ? ` · ${item.supplier}` : ""}
          </p>
        </div>
        <p className="kl-type-body shrink-0 tabular-nums">
          {unit == null ? "—" : formatBaht(unit)}
        </p>
      </button>

      {!open ? (
        <div className="flex flex-wrap gap-2">
          {stage === "request_quote" ? (
            <Button
              type="button"
              className="min-h-[2.5rem]"
              disabled={saving}
              onClick={() => void startRequestQuote()}
            >
              ขอราคา
            </Button>
          ) : null}
          {stage === "compare" ? (
            <Button
              type="button"
              className="min-h-[2.5rem]"
              disabled={saving}
              onClick={() => setOpen(true)}
            >
              เปรียบเทียบราคา
            </Button>
          ) : null}
          {stage === "ready_to_order" ? (
            <Button
              type="button"
              className="min-h-[2.5rem]"
              disabled={saving}
              onClick={() => setOpen(true)}
            >
              สั่งซื้อ
            </Button>
          ) : null}
          {stage === "outstanding" ? (
            <Button
              type="button"
              className="min-h-[2.5rem]"
              disabled={saving}
              onClick={() => setOpen(true)}
            >
              ได้รับแล้ว
            </Button>
          ) : null}
          <Link
            href={`/opening/assets/${item.id}`}
            className="kl-type-caption self-center underline text-[var(--bi-text-primary)]"
          >
            รายละเอียด
          </Link>
        </div>
      ) : (
        <div className="space-y-4 border-t border-[var(--kl-border)] pt-3">
          {(stage === "request_quote" || stage === "compare") && (
            <section className="space-y-3">
              <p className="kl-type-label">ใบเสนอราคา / เปรียบเทียบ</p>
              {meta.quotes.length === 0 ? (
                <p className="kl-type-helper">ยังไม่มีใบเสนอราคา — เพิ่มด้านล่าง</p>
              ) : (
                <div className="space-y-2">
                  {meta.quotes.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between gap-2 rounded-[var(--kl-radius-inner)] bg-kl-surface px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="kl-type-body truncate">{q.vendor}</p>
                        <p className="kl-type-caption">
                          {q.amount == null ? "ยังไม่มีราคา" : formatBaht(q.amount)}
                          {q.note ? ` · ${q.note}` : ""}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        disabled={saving}
                        onClick={() => void selectQuote(q)}
                      >
                        เลือก
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <FormField label="Supplier / ร้าน">
                <input
                  className={inputClass}
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="ชื่อร้าน"
                />
              </FormField>
              <FormField label="ราคา">
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
              </FormField>
              <FormField label="หมายเหตุ">
                <input
                  className={inputClass}
                  value={quoteNote}
                  onChange={(e) => setQuoteNote(e.target.value)}
                />
              </FormField>
              <Button
                type="button"
                fullWidth
                disabled={saving || !vendor.trim()}
                onClick={() => void addQuote()}
              >
                เพิ่มใบเสนอราคา
              </Button>
            </section>
          )}

          {(stage === "ready_to_order" ||
            stage === "outstanding" ||
            stage === "received") && (
            <section className="space-y-3">
              <FormField label="Supplier">
                <input
                  className={inputClass}
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </FormField>
              <FormField label="วันที่ซื้อ">
                <input
                  type="date"
                  className={inputClass}
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </FormField>
              <FormField label="เลขบิล">
                <input
                  className={inputClass}
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  placeholder="เลขที่บิล / ใบเสร็จ"
                />
              </FormField>
              <FormField label="Attachment (ลิงก์)">
                <input
                  className={inputClass}
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="https://... หรือ Drive"
                />
              </FormField>
              <FormField label="ชื่อไฟล์ / ป้ายกำกับ">
                <input
                  className={inputClass}
                  value={attachmentLabel}
                  onChange={(e) => setAttachmentLabel(e.target.value)}
                  placeholder="ใบเสนอราคา / ใบเสร็จ"
                />
              </FormField>
              {attachmentUrl ? (
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="kl-type-caption underline text-[var(--bi-text-primary)]"
                >
                  เปิดไฟล์แนบ
                  {attachmentLabel ? ` · ${attachmentLabel}` : ""}
                </a>
              ) : null}

              {stage === "ready_to_order" ? (
                <Button
                  type="button"
                  fullWidth
                  disabled={saving}
                  onClick={() => void placeOrder()}
                >
                  ยืนยันสั่งซื้อ
                </Button>
              ) : null}

              {stage === "outstanding" ? (
                <>
                  <FormField label="วันที่ได้รับ">
                    <input
                      type="date"
                      className={inputClass}
                      value={receivedAt}
                      onChange={(e) => setReceivedAt(e.target.value)}
                    />
                  </FormField>
                  <Button
                    type="button"
                    fullWidth
                    disabled={saving}
                    onClick={() => void markReceived()}
                  >
                    ยืนยันได้รับแล้ว
                  </Button>
                </>
              ) : null}

              {stage === "received" && meta.receivedAt ? (
                <p className="kl-type-helper">
                  ได้รับเมื่อ {meta.receivedAt}
                  {meta.billNumber ? ` · บิล ${meta.billNumber}` : ""}
                </p>
              ) : null}
            </section>
          )}

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => setOpen(false)}
          >
            ปิด
          </Button>
        </div>
      )}
    </Card>
  );
}

const inputClass = KL_FIELD_CLASS;
