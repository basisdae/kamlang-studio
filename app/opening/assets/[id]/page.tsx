"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Copy,
  ImageIcon,
  Pencil,
  ShoppingCart,
  Wallet,
  Wrench,
} from "lucide-react";
import AppShell from "../../../../components/layout/AppShell";
import DataSourceBadge from "../../../../components/bi/DataSourceBadge";
import NextStepCard from "../../../../components/bi/NextStepCard";
import PageHeader from "../../../../components/bi/PageHeader";
import SectionHeader from "../../../../components/bi/SectionHeader";
import SummaryCard from "../../../../components/bi/SummaryCard";
import Button from "../../../../components/ui/Button";
import ButtonLink from "../../../../components/ui/ButtonLink";
import Card from "../../../../components/ui/Card";
import FormField from "../../../../components/ui/FormField";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";
import {
  ASSET_CHANNEL_LABELS,
  ASSET_PRIORITY_LABELS,
  ASSET_STATUS_FLOW,
  ASSET_STATUS_LABELS,
  type AssetItem,
  type AssetTimelineStep,
} from "../../../../data/seed/tangtao";
import { formatAssetDay, formatBaht } from "../../sampleData";
import { useWorkspace } from "../../../providers/WorkspaceProvider";
import { useAssets } from "../AssetsProvider";
import BiListSkeleton from "../../../../components/bi/BiListSkeleton";

type HistoryTab = "purchase" | "repair";

function buildTimelineFromAsset(asset: AssetItem): AssetTimelineStep[] {
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

  const received =
    asset.status === "received" || asset.status === "in_use";
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

export default function OpeningAssetDetailPage() {
  const params = useParams<{ id: string }>();
  const { workspaceName, dataSource } = useWorkspace();
  const { getById, setStatus, addRepairRecord, archiveAsset, ready, loading, saving, error } =
    useAssets();
  const asset = getById(params.id);
  const [statusOpen, setStatusOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState<HistoryTab>("purchase");
  const [repairOpen, setRepairOpen] = useState(false);
  const [repairForm, setRepairForm] = useState({
    reportedAt: new Date().toISOString().slice(0, 10),
    symptom: "",
    repairer: "",
    cost: "",
    returnedAt: "",
    result: "",
    note: "",
  });
  const [repairFeedback, setRepairFeedback] = useState<
    "idle" | "ok" | "fail"
  >("idle");
  const [repairError, setRepairError] = useState("");
  const [confirmArchive, setConfirmArchive] = useState(false);

  const timeline = useMemo(
    () => (asset ? buildTimelineFromAsset(asset) : []),
    [asset]
  );

  const historySummary = useMemo(() => {
    if (!asset) {
      return {
        buyCount: 0,
        qtyTotal: 0,
        repairCost: 0,
        lastRepair: null as string | null,
      };
    }
    const buyCount = asset.purchaseHistory.length;
    const qtyTotal = asset.purchaseHistory.reduce(
      (s, p) => s + p.quantity,
      0
    );
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

  if (loading && !ready) {
    return (
      <AppShell title="ทรัพย์สิน" backHref="/opening/assets" compact>
        <BiListSkeleton rows={4} />
      </AppShell>
    );
  }

  if (!asset) {
    return (
      <AppShell title="ไม่พบรายการ" backHref="/opening/assets" compact>
        <p className="kl-type-helper">ไม่มีทรัพย์สินนี้ใน Supabase</p>
        <ButtonLink href="/opening/assets" fullWidth>
          กลับรายการ
        </ButtonLink>
      </AppShell>
    );
  }

  const brandModel = [asset.brand, asset.model].filter(Boolean).join(" / ");

  return (
    <AppShell title="" hidePageHeader compact backHref="/opening/assets">
      <PageHeader
        title="ทรัพย์สิน"
        workspace={workspaceName}
        subtitle={asset.name}
      />
      <p className="kl-type-helper -mt-1">
        {brandModel || asset.category}
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-[var(--kl-radius-inner)] bg-[rgb(231_246_91/0.45)] px-2.5 py-1 kl-type-caption">
          {ASSET_STATUS_LABELS[asset.status]}
        </span>
        <span className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2.5 py-1 kl-type-caption">
          {ASSET_PRIORITY_LABELS[asset.priority]}
        </span>
      </div>
      <DataSourceBadge source={dataSource} />

      <Card className="overflow-hidden !p-0">
        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-kl-surface">
          <ImageIcon
            className="h-10 w-10 text-kl-muted"
            strokeWidth={KL_ICON_STROKE}
            aria-hidden
          />
          <p className="kl-type-caption">รูปสินค้า · Placeholder</p>
        </div>
      </Card>

      <SummaryCard title="ภาพรวม">
        <div className="grid grid-cols-2 gap-3">
          <Overview label="จำนวน" value={`${asset.quantity} ${asset.unit}`} />
          <Overview
            label="ราคาประเมิน"
            value={
              asset.estimatedPrice != null
                ? formatBaht(asset.estimatedPrice)
                : "—"
            }
          />
          <Overview
            label="ราคาจริง"
            value={
              asset.actualPrice != null ? formatBaht(asset.actualPrice) : "—"
            }
          />
          <Overview label="Supplier" value={asset.supplier || "—"} />
          <Overview
            label="วันที่ซื้อ"
            value={
              asset.purchasedAt ? formatAssetDay(asset.purchasedAt) : "—"
            }
          />
          <Overview
            label="ประกันถึง"
            value={
              asset.warrantyUntil
                ? formatAssetDay(asset.warrantyUntil)
                : asset.warranty || "—"
            }
          />
        </div>
      </SummaryCard>

      <NextStepCard
        message={`จัดการ “${asset.name}” — แก้ไข ซื้อเพิ่ม หรือดูผลกระทบต่องบ`}
        href={`/opening/assets/${asset.id}/edit`}
        actionLabel="แก้ไขรายการ"
      />

      <section className="space-y-3">
        <SectionHeader title="ข้อมูลซื้อซ้ำ" />
        <Card className="space-y-3 !p-4">
          <DetailRow
            label="ลิงก์เดิม"
            value={asset.purchaseUrl || "—"}
            href={asset.purchaseUrl || undefined}
          />
          <DetailRow
            label="ช่องทางซื้อ"
            value={ASSET_CHANNEL_LABELS[asset.purchaseChannel]}
          />
          <DetailRow label="สเปก" value={asset.specs || "—"} />
          <DetailRow label="หมายเหตุสำคัญ" value={asset.note || "—"} />
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader title="สถานะการใช้งาน" />
        <Card className="flex flex-wrap gap-2 !p-3">
          {ASSET_STATUS_FLOW.map((s) => (
            <span
              key={s}
              className={`rounded-[var(--kl-radius-inner)] px-2.5 py-1.5 kl-type-caption ${
                asset.status === s
                  ? "bg-[var(--bi-lemon)]"
                  : "bg-kl-surface text-kl-muted"
              }`}
            >
              {ASSET_STATUS_LABELS[s]}
            </span>
          ))}
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader title="เอกสาร" />
        <Card className="space-y-2 !p-4">
          {["ใบเสนอราคา", "ใบเสร็จ", "ประกัน", "คู่มือ"].map((label) => (
            <div
              key={label}
              className="flex min-h-[2.75rem] items-center justify-between rounded-[var(--kl-radius-inner)] bg-kl-surface px-3"
            >
              <span className="kl-type-body">{label}</span>
              <span className="kl-type-caption">ยังไม่อัปโหลด</span>
            </div>
          ))}
          <p className="kl-type-caption">Upload เอกสารยังไม่อยู่ใน Sprint นี้</p>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Timeline" />
        <Card className="space-y-0 !p-4">
          {timeline.map((step, index, arr) => (
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
                  className={`min-w-0 flex-1 ${index < arr.length - 1 ? "pb-4" : ""}`}
                >
                  <p className="kl-type-body">{step.label}</p>
                  <p className="kl-type-helper mt-0.5">
                    {step.done
                      ? `${step.at ? formatAssetDay(step.at) : "—"}${step.person ? ` · ${step.person}` : ""}`
                      : "ยังไม่ถึงขั้นนี้"}
                  </p>
                </div>
              </div>
            ))}
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader title="ประวัติ" />
        <SummaryCard title="สรุปประวัติ">
          <div className="grid grid-cols-2 gap-2">
            <Overview
              label="ซื้อทั้งหมด"
              value={`${historySummary.buyCount} ครั้ง`}
            />
            <Overview
              label="จำนวนสะสม"
              value={`${historySummary.qtyTotal} ${asset.unit}`}
            />
            <Overview
              label="ค่าซ่อมสะสม"
              value={formatBaht(historySummary.repairCost)}
            />
            <Overview
              label="ซ่อมล่าสุด"
              value={
                historySummary.lastRepair
                  ? formatAssetDay(historySummary.lastRepair)
                  : "—"
              }
            />
          </div>
        </SummaryCard>

        <div className="flex gap-1 rounded-[var(--kl-radius-inner)] bg-kl-surface p-1">
          <TabChip
            active={historyTab === "purchase"}
            label="ประวัติการซื้อ"
            onClick={() => setHistoryTab("purchase")}
          />
          <TabChip
            active={historyTab === "repair"}
            label="ประวัติการซ่อม"
            onClick={() => setHistoryTab("repair")}
          />
        </div>

        {historyTab === "purchase" ? (
          <div className="space-y-2">
            {asset.purchaseHistory.length === 0 ? (
              <Card className="!p-4">
                <p className="kl-type-helper">ยังไม่มีประวัติการซื้อ</p>
              </Card>
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
                    {p.supplier || "—"} · {p.recordedBy} ·{" "}
                    {ASSET_STATUS_LABELS[p.status]}
                  </p>
                  {p.note ? (
                    <p className="kl-type-helper">{p.note}</p>
                  ) : null}
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {asset.repairHistory.length === 0 ? (
              <Card className="!p-4">
                <p className="kl-type-helper">ยังไม่มีประวัติการซ่อม</p>
              </Card>
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
              onClick={() => {
                setRepairOpen(true);
                setRepairFeedback("idle");
                setRepairError("");
              }}
            >
              + เพิ่มประวัติซ่อม
            </Button>
          </div>
        )}
      </section>

      {repairOpen ? (
        <Card className="space-y-3 !p-4">
          <div className="flex items-center gap-2">
            <Wrench className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
            <p className="kl-type-card-title">เพิ่มประวัติซ่อม</p>
          </div>
          <FormField label="วันที่แจ้งเสีย">
            <input
              className="mt-1.5 w-full min-h-[2.75rem] rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3"
              type="date"
              value={repairForm.reportedAt}
              onChange={(e) =>
                setRepairForm((f) => ({ ...f, reportedAt: e.target.value }))
              }
            />
          </FormField>
          <FormField label="อาการ">
            <textarea
              className="mt-1.5 w-full min-h-[4rem] rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3 py-2"
              value={repairForm.symptom}
              onChange={(e) =>
                setRepairForm((f) => ({ ...f, symptom: e.target.value }))
              }
            />
          </FormField>
          <FormField label="ผู้รับซ่อม">
            <input
              className="mt-1.5 w-full min-h-[2.75rem] rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3"
              value={repairForm.repairer}
              onChange={(e) =>
                setRepairForm((f) => ({ ...f, repairer: e.target.value }))
              }
            />
          </FormField>
          <FormField label="ค่าใช้จ่าย">
            <input
              className="mt-1.5 w-full min-h-[2.75rem] rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3"
              inputMode="decimal"
              value={repairForm.cost}
              onChange={(e) =>
                setRepairForm((f) => ({ ...f, cost: e.target.value }))
              }
            />
          </FormField>
          <FormField label="วันที่กลับมาใช้งาน">
            <input
              className="mt-1.5 w-full min-h-[2.75rem] rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3"
              type="date"
              value={repairForm.returnedAt}
              onChange={(e) =>
                setRepairForm((f) => ({ ...f, returnedAt: e.target.value }))
              }
            />
          </FormField>
          <FormField label="ผลการซ่อม">
            <input
              className="mt-1.5 w-full min-h-[2.75rem] rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3"
              value={repairForm.result}
              onChange={(e) =>
                setRepairForm((f) => ({ ...f, result: e.target.value }))
              }
            />
          </FormField>
          <FormField label="หมายเหตุ">
            <textarea
              className="mt-1.5 w-full min-h-[3.5rem] rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3 py-2"
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
                void addRepairRecord(asset.id, {
                  reportedAt: repairForm.reportedAt,
                  symptom: repairForm.symptom.trim(),
                  repairer: repairForm.repairer.trim(),
                  cost: Number.isFinite(costNum) ? costNum : null,
                  returnedAt: repairForm.returnedAt || null,
                  result: repairForm.result.trim(),
                  note: repairForm.note.trim(),
                }).then((result) => {
                  if (!result) {
                    setRepairFeedback("fail");
                    setRepairError(
                      error || "บันทึกไม่สำเร็จ — ลองอีกครั้ง"
                    );
                    return;
                  }
                  setRepairFeedback("ok");
                  setRepairError("");
                  setRepairOpen(false);
                  setHistoryTab("repair");
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
        <p className="kl-type-caption">บันทึกประวัติซ่อมแล้ว · bi_asset_repairs</p>
      ) : null}

      <section className="space-y-3">
        <SectionHeader title="Action" />
        <div className="grid grid-cols-2 gap-2">
          <ActionButton
            href={`/opening/assets/${asset.id}/edit`}
            icon={Pencil}
            label="แก้ไข"
          />
          <ActionButton
            href={`/opening/assets/${asset.id}/edit?mode=buy`}
            icon={ShoppingCart}
            label="ซื้อเพิ่ม"
          />
          <ActionButton
            href={`/opening/assets/${asset.id}/edit?mode=duplicate`}
            icon={Copy}
            label="ทำสำเนา"
          />
          <ActionButton
            href="/opening/budget"
            icon={Wallet}
            label="ดูผลกระทบงบ"
          />
        </div>

        <Button
          variant="secondary"
          fullWidth
          className="min-h-[2.75rem]"
          onClick={() => setStatusOpen((v) => !v)}
        >
          เปลี่ยนสถานะ
        </Button>
        {statusOpen ? (
          <Card className="space-y-2 !p-3">
            {ASSET_STATUS_FLOW.map((s) => (
              <button
                key={s}
                type="button"
                className={`flex min-h-[2.75rem] w-full items-center rounded-[var(--kl-radius-inner)] px-3 text-left kl-pressable ${
                  asset.status === s
                    ? "bg-[var(--bi-lemon)]"
                    : "bg-kl-surface"
                }`}
                onClick={() => {
                  void setStatus(asset.id, s);
                  setStatusOpen(false);
                }}
              >
                {ASSET_STATUS_LABELS[s]}
              </button>
            ))}
          </Card>
        ) : null}

        <Button
          variant="secondary"
          fullWidth
          className="min-h-[2.75rem]"
          onClick={() => {
            setRepairOpen(true);
            setHistoryTab("repair");
            setRepairFeedback("idle");
            setRepairError("");
          }}
        >
          เพิ่มประวัติซ่อม
        </Button>

        {confirmArchive ? (
          <Card className="space-y-3 !p-3.5">
            <p className="kl-type-body">
              เก็บรายการนี้? ไม่ลบจริง — ตั้ง is_archived
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                fullWidth
                disabled={saving}
                onClick={() => setConfirmArchive(false)}
              >
                ยกเลิก
              </Button>
              <Button
                fullWidth
                disabled={saving}
                onClick={() => {
                  void archiveAsset(asset.id).then((ok) => {
                    if (ok) window.location.href = "/opening/assets";
                  });
                }}
              >
                {saving ? "กำลังบันทึก..." : "ยืนยันเก็บ"}
              </Button>
            </div>
          </Card>
        ) : (
          <Button
            variant="secondary"
            fullWidth
            className="min-h-[2.75rem]"
            disabled={saving}
            onClick={() => setConfirmArchive(true)}
          >
            เก็บรายการ (Archive)
          </Button>
        )}
      </section>

      <ButtonLink href="/opening/assets" fullWidth>
        กลับรายการทรัพย์สิน
      </ButtonLink>
    </AppShell>
  );
}

function Overview({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="kl-type-label">{label}</p>
      <p className="kl-type-body mt-1">{value}</p>
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
        <p className="kl-type-body mt-1 whitespace-pre-wrap">{value}</p>
      )}
    </div>
  );
}

function ActionButton({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Pencil;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="kl-btn kl-btn-secondary flex min-h-[2.75rem] items-center justify-center gap-2 kl-pressable"
    >
      <Icon className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
      <span>{label}</span>
    </Link>
  );
}

function TabChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 min-h-[2.5rem] rounded-[var(--kl-radius-inner)] px-2 kl-type-caption kl-pressable ${
        active ? "bg-[var(--bi-lemon)]" : "text-kl-muted"
      }`}
    >
      {label}
    </button>
  );
}
