"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "../../../../components/layout/AppShell";
import DataSourceBadge from "../../../../components/bi/DataSourceBadge";
import PageHeader from "../../../../components/bi/PageHeader";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import type { AssetItem } from "../../../../data/seed/tangtao";
import { useWorkspace } from "../../../providers/WorkspaceProvider";
import { useAssets } from "../AssetsProvider";
import AssetForm, {
  emptyAssetForm,
  type AssetFormValues,
} from "../components/AssetForm";

function NewAssetInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shotValidation = searchParams.get("shot") === "validation";
  const prefillName = searchParams.get("name")?.trim() ?? "";
  const prefillCategory = searchParams.get("category")?.trim() ?? "";
  const { workspaceName, dataSource } = useWorkspace();
  const { addAsset, findSimilar, saving, error: providerError } = useAssets();
  const [pending, setPending] = useState<AssetFormValues | null>(null);
  const [similar, setSimilar] = useState<AssetItem[]>([]);
  const [saveError, setSaveError] = useState("");

  const initialForm = (() => {
    const base = emptyAssetForm();
    if (prefillName) base.name = prefillName;
    if (prefillCategory) base.category = prefillCategory;
    return base;
  })();

  function save(values: AssetFormValues) {
    if (saving) return;
    void (async () => {
      const created = await addAsset({
        ...values,
        imageUrl: null,
        documentIds: [],
        decisionGroupId: null,
        purchaseHistory: [],
        repairHistory: [],
      });
      if (!created) {
        setSaveError(
          providerError ||
            "บันทึกไม่สำเร็จ — ลองอีกครั้ง หรือตรวจการเชื่อมต่อฐานข้อมูล"
        );
        return;
      }
      router.replace(`/opening/assets/${created.id}`);
    })();
  }

  function handleSubmit(values: AssetFormValues) {
    if (saving) return;
    setSaveError("");
    const matches = findSimilar({
      name: values.name,
      brand: values.brand,
      model: values.model,
    });
    if (matches.length > 0) {
      setPending(values);
      setSimilar(matches);
      return;
    }
    save(values);
  }

  return (
    <AppShell title="" hidePageHeader compact backHref="/opening/assets">
      <PageHeader
        title="ทรัพย์สิน"
        workspace={workspaceName}
        subtitle="เพิ่มอุปกรณ์"
      />
      <DataSourceBadge source={dataSource} />

      {shotValidation ? (
        <Card className="space-y-3 !p-3.5 mb-2 border border-[var(--kl-danger,#c45c5c)]">
          <p className="kl-type-card-title">ตัวอย่าง Validation</p>
          <ul className="space-y-1 kl-type-helper">
            <li>· บังคับ: ชื่อ · หมวด · จำนวน · หน่วย · สถานะ</li>
            <li>· ห้ามจำนวน/ราคาติดลบ</li>
            <li>
              · สถานะสั่งซื้อ/รอจัดส่ง/ได้รับ/ใช้งาน — ต้องมีราคาจริง
              หรือยืนยันว่ายังไม่ทราบราคา
            </li>
          </ul>
          <p className="kl-type-caption text-kl-danger-text">
            กรุณาใส่ชื่ออุปกรณ์
          </p>
        </Card>
      ) : null}

      {saveError ? (
        <Card className="space-y-2 !p-3.5 mb-2">
          <p className="kl-type-caption text-kl-danger-text">{saveError}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="min-h-[2.75rem]"
              fullWidth
              onClick={() => setSaveError("")}
            >
              ลองใหม่
            </Button>
            <Button
              className="min-h-[2.75rem]"
              fullWidth
              onClick={() => router.push("/opening/assets")}
            >
              กลับรายการ
            </Button>
          </div>
        </Card>
      ) : null}

      {pending && similar.length > 0 ? (
        <Card className="space-y-3 !p-4 mb-2 border border-[var(--bi-lemon)]">
          <p className="kl-type-card-title">มีอุปกรณ์ลักษณะใกล้เคียงอยู่แล้ว</p>
          <p className="kl-type-helper">
            ชื่อ + ยี่ห้อ + รุ่น ตรงกับรายการเดิม — เลือกทำต่อได้
          </p>
          <ul className="space-y-2">
            {similar.map((item) => (
              <li
                key={item.id}
                className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-3 py-2"
              >
                <p className="kl-type-body">{item.name}</p>
                <p className="kl-type-caption">
                  {[item.brand, item.model].filter(Boolean).join(" · ") ||
                    item.category}
                </p>
              </li>
            ))}
          </ul>
          <div className="space-y-2">
            <Link
              href={`/opening/assets/${similar[0].id}`}
              className="kl-btn kl-btn-secondary flex min-h-[2.75rem] w-full items-center justify-center"
            >
              เปิดรายการเดิม
            </Link>
            <Link
              href={`/opening/assets/${similar[0].id}/edit?mode=buy`}
              className="kl-btn kl-btn-secondary flex min-h-[2.75rem] w-full items-center justify-center"
            >
              ซื้อเพิ่มจากรายการเดิม
            </Link>
            <Button
              fullWidth
              className="min-h-[2.75rem]"
              disabled={saving}
              onClick={() => {
                if (pending) save(pending);
              }}
            >
              {saving ? "กำลังบันทึก..." : "สร้างใหม่ต่อ"}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              className="min-h-[2.75rem]"
              onClick={() => {
                setPending(null);
                setSimilar([]);
              }}
            >
              กลับไปแก้ฟอร์ม
            </Button>
          </div>
        </Card>
      ) : (
        <AssetForm
          initial={initialForm}
          mode="create"
          modeHint={
            saving
              ? "กำลังบันทึก..."
              : "กรอกรายละเอียดอุปกรณ์ · รูป/เอกสารรองรับภายหลัง"
          }
          submitLabel={saving ? "กำลังบันทึก..." : "บันทึกอุปกรณ์"}
          submitDisabled={saving}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      )}
    </AppShell>
  );
}

export default function NewAssetPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="เพิ่มอุปกรณ์" backHref="/opening/assets" compact>
          <p className="kl-type-helper">กำลังโหลดฟอร์ม...</p>
        </AppShell>
      }
    >
      <NewAssetInner />
    </Suspense>
  );
}
