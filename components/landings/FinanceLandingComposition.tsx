"use client";

import { useMemo } from "react";
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
import { formatBaht } from "../../app/opening/sampleData";
import { getPartnersSummary } from "../../app/partners/sampleData";
import { getDecisionsSummary } from "../../app/decisions/sampleData";

/**
 * Finance Landing Composition — Budget / Quotes / Expense placeholder.
 * Uses Platform Budget module data — not a Finance-owned fork.
 */
export default function FinanceLandingComposition() {
  const {
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
  const partners = useMemo(() => getPartnersSummary(), []);
  const decisions = useMemo(() => getDecisionsSummary(), []);
  const showStatus = !configured || browserOffline || Boolean(error);

  const retry = async () => {
    await retryWs();
    await retryAssets();
  };

  return (
    <div className="min-w-0 space-y-3">
      <WorkspaceLandingHeader
        icon={Wallet}
        accent="finance"
        title="การเงิน"
        description="งบประมาณ · Partners · Quotes · Decisions"
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
              value={formatBaht(summary.inventoryTotal)}
            />
            <SummaryMetric
              label="ของที่มีแล้ว"
              value={formatBaht(summary.inventoryOwned)}
            />
            <SummaryMetric
              label="งบที่ยังต้องจัดหา"
              value={formatBaht(summary.moneyNeeded)}
            />
            <SummaryMetric
              label="ซื้อจริง"
              value={formatBaht(summary.inventoryActualSpend)}
            />
          </div>
          <SummaryMetric
            label="รายการที่ยังไม่มีราคา"
            value={summary.noPriceCount}
            align="start"
            className="!px-3"
          />
        </Card>
      ) : null}

      <Card className="space-y-1 !p-2">
        <SectionLink variant="nav" href="/opening/budget" title="งบประมาณ" />
        <SectionLink
          variant="nav"
          href="/partners"
          title={`Partners (${partners.count})`}
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
