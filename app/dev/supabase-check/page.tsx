"use client";

import { useState } from "react";
import AppShell from "../../../components/layout/AppShell";
import PageHeader from "../../../components/bi/PageHeader";
import SummaryCard from "../../../components/bi/SummaryCard";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { getSupabaseEnvStatus } from "../../../lib/supabase/env";
import { createClient } from "../../../lib/supabase/client";
import { workspaceService } from "../../../lib/services/workspaceService";
import { userFacingMessage } from "../../../lib/supabase/errors";

type CheckState = {
  envOk: boolean;
  connected: boolean;
  workspaceFound: boolean;
  workspaceName: string | null;
  message: string;
};

/**
 * Dev-only Supabase connectivity check — not in main nav.
 * Uses Service layer (not raw table queries from the page beyond ping).
 */
export default function DevSupabaseCheckPage() {
  const env = getSupabaseEnvStatus();
  const [check, setCheck] = useState<CheckState>(() => ({
    envOk: env.configured,
    connected: false,
    workspaceFound: false,
    workspaceName: null,
    message: env.configured
      ? "กด “ตรวจอีกครั้ง” เพื่อทดสอบการเชื่อมต่อ"
      : env.error ?? "ยังไม่ได้ตั้งค่าการเชื่อมต่อฐานข้อมูล",
  }));
  const [busy, setBusy] = useState(false);

  async function runCheck() {
    setBusy(true);
    try {
      if (!env.configured) {
        setCheck({
          envOk: false,
          connected: false,
          workspaceFound: false,
          workspaceName: null,
          message: env.error ?? "ยังไม่ได้ตั้งค่าการเชื่อมต่อฐานข้อมูล",
        });
        return;
      }

      const client = createClient();
      if (!client) {
        setCheck({
          envOk: true,
          connected: false,
          workspaceFound: false,
          workspaceName: null,
          message: "สร้าง Supabase client ไม่ได้",
        });
        return;
      }

      try {
        const ws = await workspaceService.getCurrentWorkspace();
        setCheck({
          envOk: true,
          connected: true,
          workspaceFound: true,
          workspaceName: ws.name,
          message: `เชื่อมต่อสำเร็จ · พบ workspace “${ws.name}” (${ws.slug})`,
        });
      } catch (e) {
        setCheck({
          envOk: true,
          connected: false,
          workspaceFound: false,
          workspaceName: null,
          message: userFacingMessage(e),
        });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="" hidePageHeader compact backHref="/status">
      <PageHeader
        title="Dev"
        workspace="Business Insight"
        subtitle="Supabase Check"
      />

      <SummaryCard title="สถานะการเชื่อมต่อ">
        <Row label="Env configured" value={check.envOk ? "ใช่" : "ไม่"} />
        <Row label="Connected" value={check.connected ? "ใช่" : "ไม่"} />
        <Row
          label="bi_workspaces / ตั้งเตา"
          value={check.workspaceFound ? "พบ" : "ไม่พบ"}
        />
        <Row label="Workspace name" value={check.workspaceName ?? "—"} />
        <Row label="Environment" value={env.environment} />
        <Row label="URL present" value={env.urlPresent ? "ใช่" : "ไม่"} />
        <Row
          label="Anon key present"
          value={env.anonKeyPresent ? "ใช่" : "ไม่"}
        />
      </SummaryCard>

      <Card className="space-y-3 !p-4">
        <p className="kl-type-label">ข้อความ</p>
        <p className="kl-type-body whitespace-pre-wrap">{check.message}</p>
        <Button
          fullWidth
          className="min-h-[2.75rem]"
          disabled={busy}
          onClick={() => void runCheck()}
        >
          {busy ? "กำลังตรวจ..." : "ตรวจอีกครั้ง"}
        </Button>
      </Card>

      <Card className="!p-4 space-y-2">
        <p className="kl-type-caption font-medium">
          Shared Preview — ยังไม่มีระบบเข้าสู่ระบบ
        </p>
        <p className="kl-type-helper">
          โปรเจกต์ kn-queue · ตาราง bi_* เท่านั้น · ห้ามใช้ service_role ฝั่ง
          client · migration: 20260711210000_create_business_insight_foundation_fixed.sql
        </p>
      </Card>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="kl-type-caption">{label}</p>
      <p className="kl-type-body">{value}</p>
    </div>
  );
}
