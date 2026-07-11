"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import AppShell from "../../components/layout/AppShell";
import BiDataStatus from "../../components/bi/BiDataStatus";
import NextStepCard from "../../components/bi/NextStepCard";
import PageHeader from "../../components/bi/PageHeader";
import ReadinessCard from "../../components/bi/ReadinessCard";
import SectionHeader from "../../components/bi/SectionHeader";
import SummaryCard from "../../components/bi/SummaryCard";
import ButtonLink from "../../components/ui/ButtonLink";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../../components/layout/navConfig";
import {
  BUSINESS_READINESS,
  getBusinessReadinessSummary,
} from "./sampleData";
import { useWorkspace } from "../providers/WorkspaceProvider";
import { getAssetsSummary, useAssets } from "./assets/AssetsProvider";
import { useBudget } from "../providers/BudgetProvider";
import { getBudgetReadyPercent } from "./sampleData";

const OPENING_LINKS = [
  { href: "/opening/budget", title: "งบประมาณ" },
  { href: "/opening/assets", title: "ทรัพย์สิน" },
  { href: "/opening/initial-stock", title: "วัตถุดิบเริ่มต้น" },
  { href: "/opening/team", title: "ทีมบริหาร" },
  { href: "/opening/checklist", title: "รายการตรวจสอบ" },
  { href: "/opening/documents", title: "เอกสาร" },
  { href: "/opening/calendar", title: "Opening Timeline" },
  { href: "/decisions", title: "Decisions" },
] as const;

/**
 * Opening Plan — Business Readiness dashboard (online workspace)
 */
export default function OpeningPlanPage() {
  const {
    workspaceName,
    loading: wsLoading,
    configured,
    online: wsOnline,
    browserOffline,
    error: wsError,
    retry: retryWs,
  } = useWorkspace();
  const {
    assets,
    loading: assetsLoading,
    ready: assetsReady,
    online: assetsOnline,
    error: assetsError,
    retry: retryAssets,
  } = useAssets();
  const {
    items: budgetItems,
    loading: budgetLoading,
    ready: budgetReady,
    online: budgetOnline,
    error: budgetError,
    retry: retryBudget,
  } = useBudget();

  const summary = getBusinessReadinessSummary();
  const focus = summary.focus;
  const assetSummary = getAssetsSummary(assets);
  const budgetReadyPct = getBudgetReadyPercent(budgetItems);

  const loading = wsLoading || assetsLoading || budgetLoading;
  const ready = !wsLoading && assetsReady && budgetReady;
  const online = wsOnline && assetsOnline && budgetOnline;
  const error = wsError ?? assetsError ?? budgetError;

  const retry = async () => {
    await retryWs();
    await retryAssets();
    await retryBudget();
  };

  return (
    <AppShell title="" hidePageHeader compact>
      <PageHeader
        title="แผนเปิดร้าน"
        workspace={workspaceName}
        subtitle="Business Readiness"
      />
      <p className="kl-type-helper -mt-1">
        ความพร้อมเปิดร้าน · ตั้งเตา
      </p>

      <BiDataStatus
        loading={loading}
        ready={ready}
        configured={configured}
        online={online}
        browserOffline={browserOffline}
        error={error}
        empty={false}
        hasCachedData={
          Boolean(error) && (assets.length > 0 || budgetItems.length > 0)
        }
        sourceHint={
          online
            ? "แหล่งข้อมูล: Supabase"
            : error
              ? "แหล่งข้อมูล: โหลดไม่สำเร็จ"
              : loading
                ? "กำลังเชื่อมต่อ..."
                : "แหล่งข้อมูล: ยังไม่ออนไลน์"
        }
        skeleton={false}
        onRetry={() => void retry()}
      />

      <SummaryCard title="ความพร้อมรวม">
        <p className="kl-type-metric-lg">{summary.overall}%</p>
        <div className="kl-progress-track mt-2">
          <div
            className="kl-progress-fill"
            style={{ width: `${summary.overall}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Metric label="Ready" value={`${summary.ready}`} />
          <Metric label="Working" value={`${summary.working}`} />
          <Metric label="Blocked" value={`${summary.blocked}`} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Metric
            label="อุปกรณ์ (ออนไลน์)"
            value={`${assetSummary.owned}/${assetSummary.total}`}
          />
          <Metric label="งบ Must พร้อม" value={`${budgetReadyPct}%`} />
        </div>
      </SummaryCard>

      <NextStepCard
        message={
          focus
            ? focus.status === "blocked"
              ? `Blocked: “${focus.title}” — ต้องปลดบล็อกก่อนเปิด`
              : `Working: “${focus.title}” ${focus.percent}% — ไปเคลียร์ต่อ`
            : "ทุกหัวข้อ Ready แล้ว — ตรวจ Opening Timeline"
        }
        href={focus?.href ?? "/opening/calendar"}
        actionLabel="ไปทำต่อ"
      />

      <section className="space-y-3">
        <SectionHeader title="Business Readiness" />
        <p className="kl-type-helper">
          Financial · Equipment · Initial Stock · Team · Legal · Marketing ·
          Packaging
        </p>
        <div className="space-y-3">
          {BUSINESS_READINESS.map((area) => (
            <ReadinessCard key={area.id} area={area} />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <SectionHeader title="เมนูแผนเปิดร้าน" />
        {OPENING_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="kl-section flex min-h-[3rem] items-center justify-between gap-3 kl-pressable"
          >
            <span className="kl-type-body font-medium">{link.title}</span>
            <ChevronRight
              className={KL_ICON_CLASS}
              strokeWidth={KL_ICON_STROKE}
              aria-hidden
            />
          </Link>
        ))}
      </section>

      <ButtonLink href="/opening/budget" fullWidth>
        ไปงบประมาณ
      </ButtonLink>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-2">
      <p className="kl-type-caption">{label}</p>
      <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
        {value}
      </p>
    </div>
  );
}
