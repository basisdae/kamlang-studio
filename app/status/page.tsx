"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/layout/AppShell";
import PageHeader from "../../components/bi/PageHeader";
import SummaryCard from "../../components/bi/SummaryCard";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { getSupabaseEnvStatus } from "../../lib/supabase/env";
import { createClient } from "../../lib/supabase/client";
import { workspaceService } from "../../lib/services/workspaceService";
import { assetService } from "../../lib/services/assetService";
import { budgetService } from "../../lib/services/budgetService";

type StatusTone = "ok" | "warn" | "bad";

type Probe = {
  supabase: StatusTone;
  supabaseDetail: string;
  workspace: StatusTone;
  workspaceDetail: string;
  assets: StatusTone;
  assetsDetail: string;
  budget: StatusTone;
  budgetDetail: string;
};

const EMPTY_PROBE: Probe = {
  supabase: "warn",
  supabaseDetail: "กำลังตรวจ...",
  workspace: "warn",
  workspaceDetail: "กำลังตรวจ...",
  assets: "warn",
  assetsDetail: "กำลังตรวจ...",
  budget: "warn",
  budgetDetail: "กำลังตรวจ...",
};

export default function StatusPage() {
  const env = getSupabaseEnvStatus();
  const [probe, setProbe] = useState<Probe>(EMPTY_PROBE);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!env.configured) {
        if (cancelled) return;
        setProbe({
          supabase: "bad",
          supabaseDetail: env.error ?? "ไม่มี env",
          workspace: "bad",
          workspaceDetail: "ข้าม — ไม่มี env",
          assets: "bad",
          assetsDetail: "ข้าม — ไม่มี env",
          budget: "bad",
          budgetDetail: "ข้าม — ไม่มี env",
        });
        return;
      }

      const client = createClient();
      if (!client) {
        if (cancelled) return;
        setProbe({
          ...EMPTY_PROBE,
          supabase: "bad",
          supabaseDetail: "สร้าง client ไม่ได้",
        });
        return;
      }

      try {
        const ws = await workspaceService.getCurrentWorkspace();
        if (cancelled) return;

        const [assets, budgetItems] = await Promise.all([
          assetService.list(ws.id),
          budgetService.listItems(ws.id),
        ]);
        if (cancelled) return;

        setProbe({
          supabase: "ok",
          supabaseDetail: "anon client · query bi_* ได้",
          workspace: "ok",
          workspaceDetail: `${ws.name} · ${ws.id.slice(0, 8)}…`,
          assets: assets.length > 0 ? "ok" : "warn",
          assetsDetail: `${assets.length} รายการ · bi_assets`,
          budget: budgetItems.length > 0 ? "ok" : "warn",
          budgetDetail: `${budgetItems.length} รายการ · bi_budget_items`,
        });
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "query ล้มเหลว";
        setProbe({
          supabase: "warn",
          supabaseDetail: msg,
          workspace: "bad",
          workspaceDetail: msg,
          assets: "bad",
          assetsDetail: msg,
          budget: "bad",
          budgetDetail: msg,
        });
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [env.configured, env.error]);

  const hasServiceRoleInClient =
    typeof process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY.length > 0;

  return (
    <AppShell title="" hidePageHeader compact backHref="/">
      <PageHeader
        title="Business Insight"
        workspace="ตั้งเตา"
        subtitle="สถานะระบบ Online v0.2"
      />

      <SummaryCard title="Production readiness">
        <StatusRow label="App" tone="ok" value="รันได้ · Next.js" />
        <StatusRow
          label="Supabase"
          tone={!env.configured ? "bad" : probe.supabase}
          value={
            !env.configured
              ? env.error ?? "ยังไม่มี env"
              : probe.supabaseDetail
          }
        />
        <StatusRow
          label="Workspace"
          tone={probe.workspace}
          value={probe.workspaceDetail}
        />
        <StatusRow
          label="Assets"
          tone={probe.assets}
          value={probe.assetsDetail}
        />
        <StatusRow
          label="Budget"
          tone={probe.budget}
          value={probe.budgetDetail}
        />
        <StatusRow
          label="Preview security"
          tone={hasServiceRoleInClient ? "bad" : "warn"}
          value={
            hasServiceRoleInClient
              ? "พบ SERVICE_ROLE ใน NEXT_PUBLIC — ห้าม"
              : "Shared Preview · anon write ชั่วคราว · ยังไม่มี Auth"
          }
        />
      </SummaryCard>

      <Card className="space-y-2 !p-4">
        <p className="kl-type-label">รายละเอียด</p>
        <p className="kl-type-caption">env: {env.environment}</p>
        <p className="kl-type-caption text-kl-muted">
          Source of truth: Supabase bi_* · localStorage เหลือแคช / view preference
        </p>
        <p className="kl-type-caption text-kl-muted">
          ยังไม่ทำ: Auth · Realtime · Upload · Recipe · Knowledge · ปิด anon write
        </p>
      </Card>

      <div className="space-y-2">
        <Button fullWidth onClick={() => window.location.reload()}>
          รีเฟรชสถานะ
        </Button>
        <Link
          href="/dev/supabase-check"
          className="kl-btn kl-btn-secondary flex min-h-[2.75rem] w-full items-center justify-center"
        >
          Dev · Supabase Check
        </Link>
        <Link
          href="/opening/assets"
          className="kl-btn kl-btn-primary flex min-h-[2.75rem] w-full items-center justify-center"
        >
          ไปทรัพย์สิน
        </Link>
        <Link
          href="/opening/budget"
          className="kl-btn kl-btn-secondary flex min-h-[2.75rem] w-full items-center justify-center"
        >
          ไปงบประมาณ
        </Link>
      </div>
    </AppShell>
  );
}

function StatusRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: StatusTone;
}) {
  const color =
    tone === "ok"
      ? "bg-[rgb(231_246_91/0.45)]"
      : tone === "warn"
        ? "bg-kl-surface"
        : "bg-[rgb(196_92_92/0.15)]";
  return (
    <div className={`rounded-[var(--kl-radius-inner)] px-3 py-2 ${color}`}>
      <p className="kl-type-caption">{label}</p>
      <p className="kl-type-body mt-0.5 break-all">{value}</p>
    </div>
  );
}
