"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import AppShell from "../../../../../components/layout/AppShell";
import ArchiveConfirm from "../../../../../components/bi/ArchiveConfirm";
import BiListSkeleton from "../../../../../components/bi/BiListSkeleton";
import DataSourceBadge from "../../../../../components/bi/DataSourceBadge";
import PageHeader from "../../../../../components/bi/PageHeader";
import Button from "../../../../../components/ui/Button";
import Card from "../../../../../components/ui/Card";
import { useWorkspace } from "../../../../providers/WorkspaceProvider";
import { useAssets } from "../../AssetsProvider";
import AssetForm, {
  assetToFormValues,
  copyCatalogFormValues,
  type AssetFormMode,
  type AssetFormValues,
} from "../../components/AssetForm";

function EditAssetInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const mode: AssetFormMode =
    modeParam === "buy"
      ? "buy"
      : modeParam === "duplicate"
        ? "duplicate"
        : "edit";

  const { workspaceName, dataSource } = useWorkspace();
  const {
    getById,
    updateAsset,
    duplicateAsset,
    addPurchaseRound,
    archiveAsset,
    ready,
    loading,
    saving,
    error: providerError,
  } = useAssets();
  const asset = getById(params.id);
  const [saveError, setSaveError] = useState("");
  const [confirmArchive, setConfirmArchive] = useState(false);

  if (loading && !ready) {
    return (
      <AppShell title="แก้ไข" backHref="/opening/assets" compact>
        <BiListSkeleton rows={3} showSummary={false} />
      </AppShell>
    );
  }

  if (!asset) {
    return (
      <AppShell title="ไม่พบรายการ" backHref="/opening/assets" compact>
        <Card className="space-y-3 !p-4">
          <p className="kl-type-helper">ไม่มีทรัพย์สินนี้ใน Supabase</p>
          <Button
            fullWidth
            className="min-h-[2.75rem]"
            onClick={() => router.push("/opening/assets")}
          >
            กลับรายการ
          </Button>
        </Card>
      </AppShell>
    );
  }

  const initial =
    mode === "edit"
      ? assetToFormValues(asset)
      : copyCatalogFormValues(asset, mode);

  const subtitle =
    mode === "buy"
      ? `ซื้อเพิ่ม · ${asset.name}`
      : mode === "duplicate"
        ? `ทำสำเนา · ${asset.name}`
        : `แก้ไข · ${asset.name}`;

  async function handleSubmit(values: AssetFormValues) {
    if (saving) return;
    setSaveError("");

    if (mode === "edit") {
      const updated = await updateAsset(asset!.id, values);
      if (!updated) {
        setSaveError(
          providerError || "บันทึกไม่สำเร็จ — ลองอีกครั้ง"
        );
        return;
      }
      router.replace(`/opening/assets/${asset!.id}`);
      return;
    }

    if (mode === "duplicate") {
      const created = await duplicateAsset(asset!.id, values);
      if (!created) {
        setSaveError(
          providerError || "ทำสำเนาไม่สำเร็จ — ลองอีกครั้ง"
        );
        return;
      }
      router.replace(`/opening/assets/${created.id}`);
      return;
    }

    const unitPrice = values.actualPrice ?? values.estimatedPrice ?? 0;
    const purchased = await addPurchaseRound(asset!.id, {
      purchasedAt: values.purchasedAt ?? new Date().toISOString().slice(0, 10),
      quantity: values.quantity,
      unitPrice,
      total: unitPrice * values.quantity,
      supplier: values.supplier,
      recordedBy: "ผู้ใช้งาน",
      status: values.status,
      note: values.note,
    });
    if (!purchased) {
      setSaveError(
        providerError || "บันทึกรอบซื้อไม่สำเร็จ — ลองอีกครั้ง"
      );
      return;
    }
    router.replace(`/opening/assets/${asset!.id}`);
  }

  async function handleArchive() {
    if (saving) return;
    const ok = await archiveAsset(asset!.id);
    if (!ok) {
      setSaveError(providerError || "เก็บรายการไม่สำเร็จ");
      return;
    }
    router.replace("/opening/assets");
  }

  return (
    <AppShell
      title=""
      hidePageHeader
      compact
      backHref={`/opening/assets/${asset.id}`}
    >
      <PageHeader
        title="ทรัพย์สิน"
        workspace={workspaceName}
        subtitle={subtitle}
      />
      <DataSourceBadge source={dataSource} />
      <p className="kl-type-caption -mt-1">
        {saving ? "กำลังบันทึก..." : "Supabase · bi_assets"}
      </p>

      {mode !== "edit" ? (
        <Card className="!p-3.5 mb-1">
          <p className="kl-type-label">โหมด</p>
          <p className="kl-type-body mt-1">
            {mode === "buy"
              ? "B. ซื้อเพิ่มจากรายการเดิม — ไม่ทับประวัติซื้อเดิม"
              : "C. ทำสำเนารายการ — สร้างรายการใหม่"}
          </p>
        </Card>
      ) : (
        <Card className="!p-3.5 mb-1">
          <p className="kl-type-label">โหมด</p>
          <p className="kl-type-body mt-1">A. แก้ไขข้อมูลเดิม</p>
        </Card>
      )}

      {saveError ? (
        <Card className="space-y-2 !p-3.5 mb-2">
          <p className="kl-type-caption text-kl-danger-text">{saveError}</p>
          <Button
            variant="secondary"
            fullWidth
            className="min-h-[2.75rem]"
            onClick={() => setSaveError("")}
          >
            ปิด · ลองบันทึกอีกครั้ง
          </Button>
        </Card>
      ) : null}

      <AssetForm
        key={`${asset.id}-${mode}`}
        initial={initial}
        mode={mode}
        sourceName={asset.name}
        modeHint={
          saving
            ? "กำลังบันทึก..."
            : mode === "buy"
              ? "คัดลอกชื่อ หมวด ยี่ห้อ รุ่น Supplier ลิงก์ สเปก หน่วยแล้ว — กรอกจำนวน ราคา วันที่ สถานะ หมายเหตุรอบซื้อใหม่"
              : mode === "duplicate"
                ? "คัดลอกรายละเอียดหลักแล้ว — ปรับจำนวน/ราคา/สถานะก่อนบันทึกเป็นรายการใหม่"
                : "แก้ไขข้อมูลอุปกรณ์ · ประวัติซื้อ/ซ่อมยังอยู่ที่หน้าโปรไฟล์"
        }
        submitLabel={
          saving
            ? "กำลังบันทึก..."
            : mode === "buy"
              ? "บันทึกรอบซื้อเพิ่ม"
              : mode === "duplicate"
                ? "บันทึกสำเนา"
                : "บันทึกการแก้ไข"
        }
        submitDisabled={saving}
        onSubmit={(values) => void handleSubmit(values)}
        onCancel={() => router.back()}
      />

      {mode === "edit" ? (
        <div className="mt-3 space-y-2">
          <p className="kl-type-helper px-0.5">
            Archive ไม่ลบจริง — ซ่อนจากรายการใช้งานประจำวัน
          </p>
          <ArchiveConfirm
            open={confirmArchive}
            saving={saving}
            onOpen={() => setConfirmArchive(true)}
            onCancel={() => setConfirmArchive(false)}
            onConfirm={() => void handleArchive()}
          />
        </div>
      ) : null}
    </AppShell>
  );
}

export default function EditAssetPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="แก้ไข" backHref="/opening/assets" compact>
          <BiListSkeleton rows={3} showSummary={false} />
        </AppShell>
      }
    >
      <EditAssetInner />
    </Suspense>
  );
}
