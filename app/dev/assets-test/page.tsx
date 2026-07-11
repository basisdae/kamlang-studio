"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import AppShell from "../../../components/layout/AppShell";
import PageHeader from "../../../components/bi/PageHeader";
import SectionHeader from "../../../components/bi/SectionHeader";
import SummaryCard from "../../../components/bi/SummaryCard";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { BiDataProviders } from "../../providers/BiDataProviders";
import { useAssets } from "../../opening/assets/AssetsProvider";
import {
  ASSETS_SCHEMA_VERSION,
  ASSETS_STORAGE_KEY,
} from "../../opening/assets/lib/assetsStorage";
import { WORKSPACE_NAME } from "../../../data/seed/tangtao";

const CHECKLIST_KEY = "business-insight.assets-test-checklist.v1";

type CheckId =
  | "add"
  | "edit"
  | "duplicate"
  | "purchase"
  | "repair"
  | "budget"
  | "persist"
  | "reset";

const CHECKS: { id: CheckId; label: string; href: string; hint: string }[] = [
  {
    id: "add",
    label: "Add asset",
    href: "/opening/assets/new",
    hint: "เพิ่มอุปกรณ์ใหม่แล้วบันทึกสำเร็จ",
  },
  {
    id: "edit",
    label: "Edit asset",
    href: "/opening/assets/as1/edit",
    hint: "แก้ไขข้อมูลเดิมแล้วบันทึก",
  },
  {
    id: "duplicate",
    label: "Duplicate",
    href: "/opening/assets/as1/edit?mode=duplicate",
    hint: "ทำสำเนารายการแล้วได้รายการใหม่",
  },
  {
    id: "purchase",
    label: "Purchase history",
    href: "/opening/assets/as1/edit?mode=buy",
    hint: "ซื้อเพิ่มแล้วมีประวัติรอบใหม่",
  },
  {
    id: "repair",
    label: "Repair history",
    href: "/opening/assets/as-scale",
    hint: "เพิ่มประวัติซ่อมใน Detail",
  },
  {
    id: "budget",
    label: "Budget link",
    href: "/opening/budget",
    hint: "ยอดงบจากอุปกรณ์เปลี่ยนตามสถานะ",
  },
  {
    id: "persist",
    label: "Persistence",
    href: "/opening/assets",
    hint: "Refresh แล้วยังเห็นข้อมูล localStorage",
  },
  {
    id: "reset",
    label: "Reset seed",
    href: "/opening/assets",
    hint: "กดคืนค่าข้อมูลตั้งต้นแล้วได้ seed ตั้งเตา",
  },
];

type ChecklistState = Record<CheckId, boolean>;

const DEFAULT_STATE: ChecklistState = {
  add: false,
  edit: false,
  duplicate: false,
  purchase: false,
  repair: false,
  budget: false,
  persist: false,
  reset: false,
};

let memoryChecklist: ChecklistState = { ...DEFAULT_STATE };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function readChecklist(): ChecklistState {
  try {
    const raw = window.localStorage.getItem(CHECKLIST_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as ChecklistState) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function writeChecklist(next: ChecklistState) {
  memoryChecklist = next;
  try {
    window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  emit();
}

function ensureChecklistHydrated() {
  if (typeof window === "undefined") return;
  if ((ensureChecklistHydrated as { done?: boolean }).done) return;
  memoryChecklist = readChecklist();
  (ensureChecklistHydrated as { done?: boolean }).done = true;
}

function DevAssetsTestInner() {
  ensureChecklistHydrated();
  const checklist = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => memoryChecklist,
    () => DEFAULT_STATE
  );

  const { assets, storageKey, schemaVersion, resetToSeed, clearTrialData } =
    useAssets();
  const passed = CHECKS.filter((c) => checklist[c.id]).length;

  const toggle = useCallback((id: CheckId) => {
    writeChecklist({ ...memoryChecklist, [id]: !memoryChecklist[id] });
  }, []);

  return (
    <AppShell title="" hidePageHeader compact backHref="/opening/assets">
      <PageHeader
        title="Dev"
        workspace={WORKSPACE_NAME}
        subtitle="Assets Test Checklist"
      />

      <SummaryCard title="สถานะทดลอง">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-2 text-center">
            <p className="kl-type-caption">Checklist</p>
            <p className="kl-type-metric mt-1">
              {passed}/{CHECKS.length}
            </p>
          </div>
          <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-2 text-center">
            <p className="kl-type-caption">รายการในเครื่อง</p>
            <p className="kl-type-metric mt-1">{assets.length}</p>
          </div>
        </div>
        <p className="kl-type-caption break-all">
          key: {storageKey || ASSETS_STORAGE_KEY}
        </p>
        <p className="kl-type-caption">
          schema: v{schemaVersion || ASSETS_SCHEMA_VERSION}
        </p>
      </SummaryCard>

      <section className="space-y-3">
        <SectionHeader title="Workflow checklist" />
        <p className="kl-type-helper">
          ใช้เฉพาะ dev · ไม่ได้อยู่ในเมนูหลัก · ติ๊กเมื่อทดสอบผ่านด้วยมือ
        </p>
        <div className="space-y-2">
          {CHECKS.map((item) => (
            <Card key={item.id} className="space-y-2 !p-3.5">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5"
                  checked={checklist[item.id]}
                  onChange={() => toggle(item.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="kl-type-card-title block">{item.label}</span>
                  <span className="kl-type-helper block mt-0.5">
                    {item.hint}
                  </span>
                </span>
              </label>
              <Link
                href={item.href}
                className="kl-type-caption font-medium text-[var(--bi-text-primary)] underline"
              >
                เปิดหน้าทดสอบ →
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <SectionHeader title="Quick actions" />
        <Button
          fullWidth
          className="min-h-[2.75rem]"
          onClick={() => resetToSeed()}
        >
          คืนค่า seed ตั้งเตา
        </Button>
        <Button
          variant="secondary"
          fullWidth
          className="min-h-[2.75rem]"
          onClick={() => {
            if (
              window.confirm("ล้างข้อมูลทดลองอุปกรณ์ทั้งหมดในเครื่องนี้?")
            ) {
              clearTrialData();
            }
          }}
        >
          ล้างข้อมูลทดลอง
        </Button>
        <Button
          variant="secondary"
          fullWidth
          className="min-h-[2.75rem]"
          onClick={() => writeChecklist({ ...DEFAULT_STATE })}
        >
          รีเซ็ต checklist
        </Button>
        <Link
          href="/opening/assets"
          className="kl-btn kl-btn-secondary flex min-h-[2.75rem] w-full items-center justify-center"
        >
          ไป /opening/assets
        </Link>
      </section>
    </AppShell>
  );
}

export default function DevAssetsTestPage() {
  return (
    <BiDataProviders>
      <DevAssetsTestInner />
    </BiDataProviders>
  );
}
