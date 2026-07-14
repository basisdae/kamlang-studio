"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import BiDataStatus from "../bi/BiDataStatus";
import SummaryMetric from "../bi/SummaryMetric";
import WorkspaceLandingHeader from "../workspaces/WorkspaceLandingHeader";
import ButtonLink from "../ui/ButtonLink";
import Card from "../ui/Card";
import SectionLink from "../ui/SectionLink";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { useAssets } from "../../app/opening/assets/AssetsProvider";
import { buildOpeningSummary } from "../../app/opening/lib/openingDomain";
import {
  buildPartnersSummary,
  getEmptyPartnersSummary,
  type PartnersSummary,
} from "../../lib/partners/partnerCore";
import { partnerService } from "../../lib/services/partnerService";
import { getDecisionsSummary } from "../../app/decisions/sampleData";

/**
 * Finance Landing Composition — Budget / Quotes / Expense placeholder.
 * Uses Platform Budget module data — not a Finance-owned fork.
 */
export default function FinanceLandingComposition() {
  const {
    workspaceId,
    configured,
    browserOffline,
    retry: retryWs,
  } = useWorkspace();
  const {
    assets,
    loading,
    ready,
    online,
    error,
    retry: retryAssets,
  } = useAssets();

  const summary = useMemo(() => buildOpeningSummary(assets), [assets]);
  const [partners, setPartners] = useState<PartnersSummary>(
    getEmptyPartnersSummary
  );
  useEffect(() => {
    if (!configured || !workspaceId) {
      setPartners(getEmptyPartnersSummary());
      return;
    }
    let cancelled = false;
    void partnerService
      .list(workspaceId)
      .then((rows) => {
        if (!cancelled) setPartners(buildPartnersSummary(rows));
      })
      .catch(() => {
        if (!cancelled) setPartners(getEmptyPartnersSummary());
      });
    return () => {
      cancelled = true;
    };
  }, [configured, workspaceId]);
  const decisions = useMemo(() => getDecisionsSummary(), []);
  const showStatus = !configured || browserOffline || Boolean(error);

  const retry = async () => {
    await retryWs();
    await retryAssets();
  };

  return (
    <div className="min-w-0 space-y-3">
      <WorkspaceLandingHeader
        title="ภาพรวม"
        description="งบประมาณ · Quotes · Decisions"
      />

      {showStatus ? (
        <BiDataStatus
          loading={false}
          ready={ready}
          configured={configured}
          online={online}
          browserOffline={browserOffline}
          error={error}
          skeleton={false}
          onRetry={() => void retry()}
        />
      ) : null}

      {loading ? (
        <Card className="!p-4">
          <p className="kl-type-helper">กำลังโหลดงบประมาณ…</p>
        </Card>
      ) : null}

      {!loading && !error ? (
        <Card className="space-y-3 !p-3">
          <div className="grid grid-cols-2 gap-2">
            <SummaryMetric
              label="งบประมาณรวม"
              amount={summary.inventoryTotal}
              tone="primary"
            />
            <SummaryMetric
              label="ของที่มีแล้ว"
              amount={summary.inventoryOwned}
              tone="success"
            />
            <SummaryMetric
              label="งบที่ยังต้องจัดหา"
              amount={summary.moneyNeeded}
              tone="accent"
            />
            <SummaryMetric
              label="ซื้อจริง"
              amount={summary.inventoryActualSpend}
              tone={
                summary.inventoryActualSpend > 0 ? "success" : "muted"
              }
            />
          </div>
          {summary.noPriceCount > 0 ? (
            <SummaryMetric
              label="ยังไม่มีราคา"
              value={`${summary.noPriceCount} รายการ`}
              warning
              align="start"
              className="!px-3"
            />
          ) : null}
        </Card>
      ) : null}

      <Card className="space-y-1 !p-2">
        <SectionLink variant="nav" href="/opening/budget" title="งบประมาณ" />
        <SectionLink
          variant="nav"
          href="/partners"
          title={`Partners (${partners.total})`}
        />
        <SectionLink variant="nav" href="/quotes" title="Quote Compare" />
        <SectionLink
          variant="nav"
          href="/decisions"
          title={`Decisions (${decisions.total})`}
        />
      </Card>

      <Card className="space-y-2 !p-3">
        <p className="kl-type-card-title flex items-center gap-2">
          <Wallet className="kl-icon-sm" aria-hidden />
          รายรับ / รายจ่าย / กำไร / Cash Flow
        </p>
        <p className="kl-type-helper">
          ยังไม่เริ่มใช้งาน — ไม่มีตัวเลขสมมติในหน้านี้
        </p>
      </Card>

      <ButtonLink href="/opening/budget" fullWidth>
        ดูงบประมาณ
      </ButtonLink>
    </div>
  );
}
