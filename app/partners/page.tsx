"use client";

import { Handshake } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import SectionHeader from "../../components/bi/SectionHeader";
import SummaryCard from "../../components/bi/SummaryCard";
import WorkspaceLandingHeader from "../../components/workspaces/WorkspaceLandingHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  buildPartnersSummary,
  isPartnersWritable,
  listPartners,
  PARTNERS_READONLY_REASON,
} from "../../lib/partners/partnerCore";
import {
  PARTNER_CATEGORIES,
  PARTNERS_SHARED_CORE_TABLE,
} from "../../lib/partners/types";

const READONLY_HINT =
  "Partner เป็น Shared Core — ชุดเดียวทุก Workspace · ไม่ใช่ Module ของ Finance";

/**
 * Partners — Shared Core directory (Temporary Readonly until bi_partners ships).
 */
export default function PartnersPage() {
  const rows = listPartners(false);
  const summary = buildPartnersSummary(rows);
  const writable = isPartnersWritable();
  const isEmpty = rows.length === 0;

  return (
    <AppShell title="" hidePageHeader compact>
      <WorkspaceLandingHeader
        title="Partners"
        description="คนและองค์กรรอบร้าน — Shared Core ชุดเดียวทุก Workspace"
      />

      <Card className="space-y-2 !p-3">
        <p className="kl-type-caption text-kl-muted">
          แหล่งข้อมูล: Shared Core · {PARTNERS_SHARED_CORE_TABLE}
        </p>
        <p className="kl-type-helper">{READONLY_HINT}</p>
        {!writable ? (
          <p className="kl-type-caption text-[var(--bi-text-primary)]">
            {PARTNERS_READONLY_REASON}
          </p>
        ) : null}
      </Card>

      <SummaryCard title="สรุป">
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Partner ทั้งหมด" value={`${summary.total}`} />
          <Metric label="Active" value={`${summary.active}`} />
          <Metric label="Supplier" value={`${summary.supplier}`} />
          <Metric label="Investor" value={`${summary.investor}`} />
        </div>
      </SummaryCard>

      <SectionHeader title="ประเภทที่รองรับ" />
      <Card className="!p-3">
        <p className="kl-type-helper">
          Category เดียว — {PARTNER_CATEGORIES.join(" · ")}
        </p>
      </Card>

      {isEmpty ? (
        <EmptyState
          icon={Handshake}
          title="ยังไม่มี Partner"
          hint="เมื่อ Shared Core พร้อม จะเพิ่มคนและองค์กรรอบร้านได้จากหน้านี้"
        />
      ) : null}

      <div className="space-y-2">
        <Button
          type="button"
          fullWidth
          disabled
          title={PARTNERS_READONLY_REASON}
          aria-disabled
        >
          เพิ่ม Partner รายแรก
        </Button>
        <p className="kl-type-caption text-center text-kl-muted">
          {PARTNERS_READONLY_REASON}
        </p>
      </div>

      {!isEmpty ? (
        <p className="kl-type-helper text-kl-muted">
          มี {rows.length} รายการ — รอ CRUD ผ่าน Shared Core
        </p>
      ) : null}
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-2 text-center">
      <p className="kl-type-caption text-kl-muted">{label}</p>
      <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
        {value}
      </p>
    </div>
  );
}
