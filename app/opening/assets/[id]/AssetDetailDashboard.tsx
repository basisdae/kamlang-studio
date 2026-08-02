"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  ImageIcon,
  MoreHorizontal,
  Pencil,
  ShoppingCart,
  Wallet,
  Wrench,
} from "lucide-react";
import ArchiveConfirm from "../../../../components/bi/ArchiveConfirm";
import DataSourceBadge from "../../../../components/bi/DataSourceBadge";
import StatusBadge from "../../../../components/bi/StatusBadge";
import Button from "../../../../components/ui/Button";
import ButtonLink from "../../../../components/ui/ButtonLink";
import Card from "../../../../components/ui/Card";
import FormField from "../../../../components/ui/FormField";
import { KL_FIELD_CLASS } from "../../../../components/ui/designLock";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";
import {
  ASSET_CHANNEL_LABELS,
  ASSET_STATUS_FLOW,
  ASSET_STATUS_LABELS,
  type AssetItem,
  type AssetStatus,
  type AssetTimelineStep,
} from "../../../../data/seed/tangtao";
import type { DataSource } from "../../../../components/bi/dataSource";
import { formatAssetDay, formatBaht } from "../../sampleData";

export type DetailTab =
  | "overview"
  | "purchase"
  | "documents"
  | "repair"
  | "timeline";

const TABS: { id: DetailTab; label: string }[] = [
  { id: "overview", label: "ภาพรวม" },
  { id: "purchase", label: "การซื้อ" },
  { id: "documents", label: "เอกสาร" },
  { id: "repair", label: "ซ่อมบำรุง" },
  { id: "timeline", label: "Timeline" },
];

type RepairInput = {
  reportedAt: string;
  symptom: string;
  repairer: string;
  cost: number | null;
  returnedAt: string | null;
  result: string;
  note: string;
};

type Props = {
  asset: AssetItem;
  dataSource: DataSource;
  saving: boolean;
  providerError: string | null;
  onSetStatus: (id: string, status: AssetStatus) => Promise<void>;
  onAddRepair: (id: string, record: RepairInput) => Promise<AssetItem | null>;
  onArchive: (id: string) => Promise<boolean>;
};

export function buildTimelineFromAsset(asset: AssetItem): AssetTimelineStep[] {
  const steps: AssetTimelineStep[] = [
    {
      id: "created",
      label: "เพิ่มรายการ",
      at: asset.purchasedAt || "",
      done: true,
      person: undefined,
    },
  ];

  if (asset.estimatedPrice != null || asset.actualPrice != null) {
    steps.push({
      id: "priced",
      label: "อัปเดตราคา",
      at: "",
      done: true,
    });
  } else {
    steps.push({
      id: "priced",
      label: "อัปเดตราคา",
      at: "",
      done: false,
    });
  }

  const purchases = [...asset.purchaseHistory].sort((a, b) =>
    a.purchasedAt.localeCompare(b.purchasedAt)
  );
  if (purchases.length > 0) {
    for (const p of purchases) {
      steps.push({
        id: `buy-${p.id}`,
        label: `ซื้อ ×${p.quantity}`,
        at: p.purchasedAt,
        done: true,
        person: p.recordedBy || p.supplier || undefined,
      });
    }
  } else if (
    asset.status === "ordered" ||
    asset.status === "awaiting_delivery" ||
    asset.status === "received" ||
    asset.status === "in_use"
  ) {
    steps.push({
      id: "buy-status",
      label: "ซื้อ / สั่งซื้อ",
      at: asset.purchasedAt || "",
      done: true,
    });
  } else {
    steps.push({ id: "buy", label: "ซื้อ", at: "", done: false });
  }

  const received = asset.status === "received" || asset.status === "in_use";
  steps.push({
    id: "received",
    label: "ได้รับของ",
    at: "",
    done: received,
  });
  steps.push({
    id: "in-use",
    label: "เริ่มใช้งาน",
    at: "",
    done: asset.status === "in_use",
  });

  for (const r of [...asset.repairHistory].sort((a, b) =>
    a.reportedAt.localeCompare(b.reportedAt)
  )) {
    steps.push({
      id: `repair-${r.id}`,
      label: `ซ่อม · ${r.symptom.slice(0, 40)}`,
      at: r.reportedAt,
      done: true,
      person: r.repairer || undefined,
    });
  }

  return steps;
}

export default function AssetDetailDashboard({
  asset,
  dataSource,
  saving,
  providerError,
  onSetStatus,
  onAddRepair,
  onArchive,
}: Props) {
  const [tab, setTab] = useState<DetailTab>("overview");
  const [statusOpen, setStatusOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [repairOpen, setRepairOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [repairFeedback, setRepairFeedback] = useState<"idle" | "ok" | "fail">(
    "idle"
  );
  const [repairError, setRepairError] = useState("");
  const [repairForm, setRepairForm] = useState({
    reportedAt: new Date().toISOString().slice(0, 10),
    symptom: "",
    repairer: "",
    cost: "",
    returnedAt: "",
    result: "",
    note: "",
  });
  const moreRef = useRef<HTMLDivElement>(null);

  const timeline = useMemo(() => buildTimelineFromAsset(asset), [asset]);

  const historySummary = useMemo(() => {
    const buyCount = asset.purchaseHistory.length;
    const qtyTotal = asset.purchaseHistory.reduce((s, p) => s + p.quantity, 0);
    const repairCost = asset.repairHistory.reduce(
      (s, r) => s + (r.cost ?? 0),
      0
    );
    const last = [...asset.repairHistory].sort((a, b) =>
      b.reportedAt.localeCompare(a.reportedAt)
    )[0];
    return {
      buyCount,
      qtyTotal: qtyTotal || asset.quantity,
      repairCost,
      lastRepair: last?.reportedAt ?? null,
    };
  }, [asset]);

  const brandModel = [asset.brand, asset.model].filter(Boolean).join(" / ");
  const metaLine = [asset.category, brandModel].filter(Boolean).join(" · ");

  const priceDelta =
    asset.estimatedPrice != null && asset.actualPrice != null
      ? asset.actualPrice - asset.estimatedPrice
      : null;

  useEffect(() => {
    if (!moreOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!moreRef.current?.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [moreOpen]);

  function openRepairForm() {
    setTab("repair");
    setRepairOpen(true);
    setRepairFeedback("idle");
    setRepairError("");
    setMoreOpen(false);
  }

  return (
    <div className="space-y-4">
      {/* Dashboard header — Content = asset name (workspace stays in switcher) */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="kl-type-page-title break-words">{asset.name}</h1>
          {metaLine ? (
            <p className="kl-type-helper">{metaLine}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge assetStatus={asset.status} />
            <StatusBadge priority={asset.priority} />
            {asset.requiredForOpening === false ? (
              <span className="kl-type-caption text-kl-muted">ไม่บังคับเปิดร้าน</span>
            ) : null}
            <DataSourceBadge source={dataSource} />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <ButtonLink
            href={`/opening/assets/${asset.id}/edit`}
            className="min-h-[2.75rem] !px-3"
          >
            <span className="inline-flex items-center gap-1.5">
              <Pencil className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
              แก้ไข
            </span>
          </ButtonLink>
          <ButtonLink
            href={`/opening/assets/${asset.id}/edit?mode=buy`}
            variant="secondary"
            className="min-h-[2.75rem] !px-3"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShoppingCart
                className={KL_ICON_CLASS}
                strokeWidth={KL_ICON_STROKE}
              />
              ซื้อเพิ่ม
            </span>
          </ButtonLink>
          <Button
            variant="secondary"
            className="min-h-[2.75rem] !px-3"
            onClick={() => {
              setStatusOpen((v) => !v);
              setMoreOpen(false);
            }}
          >
            เปลี่ยนสถานะ
          </Button>

          <div className="relative" ref={moreRef}>
            <Button
              variant="secondary"
              className="min-h-[2.75rem] !px-3"
              aria-label="เพิ่มเติม"
              aria-expanded={moreOpen}
              onClick={() => {
                setMoreOpen((v) => !v);
                setStatusOpen(false);
              }}
            >
              <span className="inline-flex items-center gap-1.5">
                <MoreHorizontal
                  className={KL_ICON_CLASS}
                  strokeWidth={KL_ICON_STROKE}
                />
                เพิ่มเติม
              </span>
            </Button>
            {moreOpen ? (
              <div
                role="menu"
                className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-[var(--kl-bg)] shadow-sm"
              >
                <MoreLink
                  href={`/opening/assets/${asset.id}/edit?mode=duplicate`}
                  icon={Copy}
                  label="ทำสำเนา"
                  onClick={() => setMoreOpen(false)}
                />
                <MoreLink
                  href="/opening/budget"
                  icon={Wallet}
                  label="ดูผลกระทบงบ"
                  onClick={() => setMoreOpen(false)}
                />
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-[2.75rem] w-full items-center gap-2 px-3 text-left kl-type-body kl-pressable hover:bg-kl-surface"
                  onClick={openRepairForm}
                >
                  <Wrench
                    className={KL_ICON_CLASS}
                    strokeWidth={KL_ICON_STROKE}
                  />
                  เพิ่มประวัติซ่อม
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-[2.75rem] w-full items-center gap-2 px-3 text-left kl-type-body kl-pressable hover:bg-kl-surface"
                  onClick={() => {
                    setMoreOpen(false);
                    setConfirmArchive(true);
                  }}
                >
                  Archive
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {statusOpen ? (
        <Card className="space-y-2 !p-3">
          <p className="kl-type-caption text-kl-muted">เลือกสถานะใหม่</p>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {ASSET_STATUS_FLOW.map((s) => (
              <button
                key={s}
                type="button"
                disabled={saving}
                className={`flex min-h-[2.75rem] w-full items-center rounded-[var(--kl-radius-inner)] px-3 text-left kl-pressable ${
                  asset.status === s
                    ? "bg-[var(--bi-lemon)]"
                    : "bg-kl-surface"
                }`}
                onClick={() => {
                  void onSetStatus(asset.id, s).then(() => setStatusOpen(false));
                }}
              >
                {ASSET_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Hero: image + summary */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,32%)_minmax(0,1fr)] md:items-start">
        <Card className="overflow-hidden !p-0">
          <div className="flex max-h-44 flex-col items-center justify-center gap-2 bg-kl-surface px-3 py-6 md:max-h-52 md:aspect-[4/3] md:py-0">
            {asset.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote asset URLs vary by workspace
              <img
                src={asset.imageUrl}
                alt={asset.name}
                className="max-h-40 w-full object-contain md:max-h-48"
              />
            ) : (
              <>
                <ImageIcon
                  className="h-8 w-8 text-kl-muted"
                  strokeWidth={KL_ICON_STROKE}
                  aria-hidden
                />
                <p className="kl-type-caption">ยังไม่มีรูป</p>
              </>
            )}
          </div>
          <div className="border-t border-[var(--kl-border)] p-2">
            <ButtonLink
              href={`/opening/assets/${asset.id}/edit`}
              variant="secondary"
              fullWidth
              className="min-h-[2.5rem]"
            >
              เพิ่ม / เปลี่ยนรูป
            </ButtonLink>
          </div>
        </Card>

        <Card className="!p-3.5">
          <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-3">
            <Stat label="จำนวน" value={`${asset.quantity} ${asset.unit}`} />
            <Stat
              label="ราคาประเมิน"
              value={
                asset.estimatedPrice != null
                  ? formatBaht(asset.estimatedPrice)
                  : "—"
              }
            />
            <Stat
              label="ราคาจริง"
              value={
                asset.actualPrice != null ? formatBaht(asset.actualPrice) : "—"
              }
            />
            {priceDelta != null ? (
              <Stat
                label="ส่วนต่างราคา"
                value={`${priceDelta > 0 ? "+" : ""}${formatBaht(priceDelta)}`}
              />
            ) : null}
            <Stat label="Supplier" value={asset.supplier || "—"} />
            <Stat
              label="วันที่ซื้อ"
              value={
                asset.purchasedAt ? formatAssetDay(asset.purchasedAt) : "—"
              }
            />
            <Stat
              label="ประกัน"
              value={
                asset.warrantyUntil
                  ? `ถึง ${formatAssetDay(asset.warrantyUntil)}`
                  : asset.warranty || "—"
              }
            />
            <Stat
              label="สถานะ"
              value={ASSET_STATUS_LABELS[asset.status]}
            />
          </div>
        </Card>
      </section>

      {/* Detail tabs */}
      <section className="space-y-3">
        <div
          role="tablist"
          aria-label="รายละเอียดอุปกรณ์"
          className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 min-h-[2.5rem] rounded-[var(--kl-radius-inner)] px-3 kl-type-caption kl-pressable ${
                tab === t.id
                  ? "bg-[var(--bi-lemon)]"
                  : "bg-kl-surface text-kl-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" ? (
          <Card className="space-y-3 !p-4">
            <DetailRow label="สเปก" value={asset.specs || "—"} />
            <DetailRow
              label="ขนาด / สี / วัสดุ"
              value={
                [asset.size, asset.color, asset.material]
                  .filter(Boolean)
                  .join(" · ") || "—"
              }
            />
            <DetailRow label="กำลังไฟ" value={asset.power || "—"} />
            <DetailRow
              label="Serial Number"
              value={asset.serialNumber || "—"}
            />
            {asset.note ? (
              <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-3 py-2.5">
                <p className="kl-type-label">หมายเหตุ</p>
                <p className="kl-type-body mt-1 whitespace-pre-wrap">
                  {asset.note}
                </p>
              </div>
            ) : (
              <p className="kl-type-helper">ยังไม่มีหมายเหตุ</p>
            )}
          </Card>
        ) : null}

        {tab === "purchase" ? (
          <div className="space-y-3">
            <Card className="space-y-3 !p-4">
              <DetailRow
                label="ช่องทางซื้อ"
                value={ASSET_CHANNEL_LABELS[asset.purchaseChannel]}
              />
              <DetailRow
                label="ลิงก์ Supplier"
                value={asset.purchaseUrl || "—"}
                href={asset.purchaseUrl || undefined}
              />
              <div className="grid grid-cols-2 gap-3 border-t border-[var(--kl-border)] pt-3">
                <Stat
                  label="ซื้อทั้งหมด"
                  value={`${historySummary.buyCount} ครั้ง`}
                />
                <Stat
                  label="จำนวนสะสม"
                  value={`${historySummary.qtyTotal} ${asset.unit}`}
                />
              </div>
            </Card>
            {asset.purchaseHistory.length === 0 ? (
              <EmptyState message="ยังไม่มีประวัติการซื้อ" />
            ) : (
              asset.purchaseHistory.map((p) => (
                <Card key={p.id} className="space-y-2 !p-4">
                  <p className="kl-type-card-title">
                    {formatAssetDay(p.purchasedAt)}
                  </p>
                  <p className="kl-type-helper">
                    ×{p.quantity} · {formatBaht(p.unitPrice)} / หน่วย · รวม{" "}
                    {formatBaht(p.total)}
                  </p>
                  <p className="kl-type-caption">
                    {p.supplier || "—"}
                    {p.recordedBy ? ` · ${p.recordedBy}` : ""}
                    {p.status ? ` · ${ASSET_STATUS_LABELS[p.status]}` : ""}
                  </p>
                  {p.note ? (
                    <p className="kl-type-helper">{p.note}</p>
                  ) : null}
                </Card>
              ))
            )}
          </div>
        ) : null}

        {tab === "documents" ? (
          <Card className="!p-4">
            <p className="kl-type-helper">
              ยังไม่มีเอกสารอัปโหลด — Upload ยังไม่อยู่ใน Sprint นี้
            </p>
            <ul className="mt-2 space-y-1 kl-type-caption text-kl-muted">
              <li>ใบเสนอราคา</li>
              <li>ใบเสร็จ</li>
              <li>ประกัน</li>
              <li>คู่มือ</li>
            </ul>
          </Card>
        ) : null}

        {tab === "repair" ? (
          <div className="space-y-3">
            <Card className="!p-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat
                  label="ค่าซ่อมสะสม"
                  value={formatBaht(historySummary.repairCost)}
                />
                <Stat
                  label="ซ่อมล่าสุด"
                  value={
                    historySummary.lastRepair
                      ? formatAssetDay(historySummary.lastRepair)
                      : "—"
                  }
                />
              </div>
            </Card>
            {asset.repairHistory.length === 0 ? (
              <EmptyState message="ยังไม่มีประวัติการซ่อม" />
            ) : (
              asset.repairHistory.map((r) => (
                <Card key={r.id} className="space-y-2 !p-4">
                  <p className="kl-type-card-title">
                    แจ้งเสีย {formatAssetDay(r.reportedAt)}
                  </p>
                  <p className="kl-type-body">{r.symptom}</p>
                  <p className="kl-type-caption">
                    ผู้รับซ่อม: {r.repairer || "—"} · ค่าใช้จ่าย:{" "}
                    {r.cost != null ? formatBaht(r.cost) : "—"}
                  </p>
                  <p className="kl-type-caption">
                    กลับมาใช้:{" "}
                    {r.returnedAt ? formatAssetDay(r.returnedAt) : "—"} · ผล:{" "}
                    {r.result || "—"}
                  </p>
                  {r.note ? (
                    <p className="kl-type-helper">{r.note}</p>
                  ) : null}
                </Card>
              ))
            )}
            <Button
              fullWidth
              className="min-h-[2.75rem]"
              onClick={openRepairForm}
            >
              + เพิ่มประวัติซ่อม
            </Button>
          </div>
        ) : null}

        {tab === "timeline" ? (
          <Card className="space-y-0 !p-4">
            {timeline.length === 0 ? (
              <EmptyState message="ยังไม่มีเหตุการณ์" />
            ) : (
              timeline.map((step, index, arr) => (
                <div key={step.id} className="flex gap-3">
                  <div className="flex w-4 shrink-0 flex-col items-center">
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${
                        step.done
                          ? "bg-[var(--bi-lemon)]"
                          : "bg-[var(--kl-border)]"
                      }`}
                    />
                    {index < arr.length - 1 ? (
                      <span className="mt-1 w-px flex-1 bg-[var(--kl-border)]" />
                    ) : null}
                  </div>
                  <div
                    className={`min-w-0 flex-1 ${index < arr.length - 1 ? "pb-3" : ""}`}
                  >
                    <p className="kl-type-body">{step.label}</p>
                    <p className="kl-type-helper mt-0.5">
                      {step.done
                        ? `${step.at ? formatAssetDay(step.at) : "—"}${step.person ? ` · ${step.person}` : ""}`
                        : "ยังไม่ถึงขั้นนี้"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </Card>
        ) : null}
      </section>

      {repairOpen ? (
        <Card className="space-y-3 !p-4">
          <div className="flex items-center gap-2">
            <Wrench className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
            <p className="kl-type-card-title">เพิ่มประวัติซ่อม</p>
          </div>
          <FormField label="วันที่แจ้งเสีย">
            <input
              className={KL_FIELD_CLASS}
              type="date"
              value={repairForm.reportedAt}
              onChange={(e) =>
                setRepairForm((f) => ({ ...f, reportedAt: e.target.value }))
              }
            />
          </FormField>
          <FormField label="อาการ">
            <textarea
              className={`${KL_FIELD_CLASS} min-h-[4rem] py-2`}
              value={repairForm.symptom}
              onChange={(e) =>
                setRepairForm((f) => ({ ...f, symptom: e.target.value }))
              }
            />
          </FormField>
          <FormField label="ผู้รับซ่อม">
            <input
              className={KL_FIELD_CLASS}
              value={repairForm.repairer}
              onChange={(e) =>
                setRepairForm((f) => ({ ...f, repairer: e.target.value }))
              }
            />
          </FormField>
          <FormField label="ค่าใช้จ่าย">
            <input
              className={KL_FIELD_CLASS}
              inputMode="decimal"
              value={repairForm.cost}
              onChange={(e) =>
                setRepairForm((f) => ({ ...f, cost: e.target.value }))
              }
            />
          </FormField>
          <FormField label="วันที่กลับมาใช้งาน">
            <input
              className={KL_FIELD_CLASS}
              type="date"
              value={repairForm.returnedAt}
              onChange={(e) =>
                setRepairForm((f) => ({ ...f, returnedAt: e.target.value }))
              }
            />
          </FormField>
          <FormField label="ผลการซ่อม">
            <input
              className={KL_FIELD_CLASS}
              value={repairForm.result}
              onChange={(e) =>
                setRepairForm((f) => ({ ...f, result: e.target.value }))
              }
            />
          </FormField>
          <FormField label="หมายเหตุ">
            <textarea
              className={`${KL_FIELD_CLASS} min-h-[3.5rem] py-2`}
              value={repairForm.note}
              onChange={(e) =>
                setRepairForm((f) => ({ ...f, note: e.target.value }))
              }
            />
          </FormField>
          {repairError ? (
            <p className="kl-type-caption text-kl-danger-text">{repairError}</p>
          ) : null}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              disabled={saving}
              onClick={() => setRepairOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              fullWidth
              disabled={saving || !repairForm.symptom.trim()}
              onClick={() => {
                if (saving) return;
                const costNum = repairForm.cost
                  ? Number(repairForm.cost.replace(/,/g, ""))
                  : null;
                void onAddRepair(asset.id, {
                  reportedAt: repairForm.reportedAt,
                  symptom: repairForm.symptom.trim(),
                  repairer: repairForm.repairer.trim(),
                  cost: Number.isFinite(costNum as number) ? costNum : null,
                  returnedAt: repairForm.returnedAt || null,
                  result: repairForm.result.trim(),
                  note: repairForm.note.trim(),
                }).then((result) => {
                  if (!result) {
                    setRepairFeedback("fail");
                    setRepairError(
                      providerError || "บันทึกไม่สำเร็จ — ลองอีกครั้ง"
                    );
                    return;
                  }
                  setRepairFeedback("ok");
                  setRepairError("");
                  setRepairOpen(false);
                  setTab("repair");
                  setRepairForm({
                    reportedAt: new Date().toISOString().slice(0, 10),
                    symptom: "",
                    repairer: "",
                    cost: "",
                    returnedAt: "",
                    result: "",
                    note: "",
                  });
                });
              }}
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </Card>
      ) : null}

      {repairFeedback === "ok" ? (
        <p className="kl-type-caption">
          บันทึกประวัติซ่อมแล้ว · bi_asset_repairs
        </p>
      ) : null}

      {confirmArchive ? (
        <ArchiveConfirm
          open={confirmArchive}
          saving={saving}
          onOpen={() => setConfirmArchive(true)}
          onCancel={() => setConfirmArchive(false)}
          onConfirm={() => {
            void onArchive(asset.id).then((ok) => {
              if (ok) window.location.href = "/opening/assets";
            });
          }}
        />
      ) : null}

      <ButtonLink href="/opening/assets" fullWidth variant="secondary">
        กลับรายการทรัพย์สิน
      </ButtonLink>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="kl-type-label">{label}</p>
      <p className="kl-type-body mt-1 break-words tabular-nums">{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div>
      <p className="kl-type-label">{label}</p>
      {href && href.startsWith("http") ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="kl-type-body mt-1 break-all text-[var(--bi-text-primary)] underline"
        >
          {value}
        </a>
      ) : (
        <p className="kl-type-body mt-1 whitespace-pre-wrap break-words">
          {value}
        </p>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="!p-3">
      <p className="kl-type-helper">{message}</p>
    </Card>
  );
}

function MoreLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex min-h-[2.75rem] w-full items-center gap-2 px-3 text-left kl-type-body kl-pressable hover:bg-kl-surface"
    >
      <Icon className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
      {label}
    </Link>
  );
}
