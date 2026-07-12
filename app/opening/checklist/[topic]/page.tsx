"use client";

import { useMemo } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import AppShell from "../../../../components/layout/AppShell";
import BiDataStatus from "../../../../components/bi/BiDataStatus";
import PageHeader from "../../../../components/bi/PageHeader";
import ButtonLink from "../../../../components/ui/ButtonLink";
import Card from "../../../../components/ui/Card";
import { useWorkspace } from "../../../providers/WorkspaceProvider";
import { useAssets } from "../../assets/AssetsProvider";
import {
  assetsForTopic,
  getTopic,
  topicProgress,
  type ChecklistTopicId,
} from "../../lib/openingDomain";
import ChecklistTopicBoard from "../components/ChecklistTopicBoard";
import { useModuleViewConfig } from "../../../../lib/workspaces/moduleViewConfig";
import { isMarketingTopicId } from "../../../../lib/marketing/marketingChecklist";

/**
 * Checklist topic — same bi_assets rows as Assets / Budget views.
 * Opening or Marketing Readiness topics via getTopic().
 */
export default function OpeningChecklistTopicPage() {
  const params = useParams();
  const topicId = String(params.topic ?? "");
  const topic = getTopic(topicId);
  const view = useModuleViewConfig("opening-checklist");
  const marketingMode =
    view.summaryMode === "marketing" || isMarketingTopicId(topicId);

  const { workspaceName } = useWorkspace();
  const {
    assets,
    loading,
    ready,
    online,
    configured,
    browserOffline,
    error,
    retry,
  } = useAssets();

  const progress = useMemo(
    () => (topic ? topicProgress(assets, topic) : null),
    [assets, topic]
  );
  const topicAssets = useMemo(
    () =>
      topic ? assetsForTopic(assets, topic.id as ChecklistTopicId) : [],
    [assets, topic]
  );

  if (!topic || !progress) {
    notFound();
  }

  if (topic.externalHref) {
    return (
      <AppShell title="" hidePageHeader compact backHref="/opening/checklist">
        <PageHeader
          title="รายการเตรียมเปิดร้าน"
          workspace={workspaceName}
          subtitle={topic.title}
        />
        <Card className="space-y-3 !p-4">
          <p className="kl-type-card-title">{topic.title}</p>
          <p className="kl-type-helper">{topic.description}</p>
          <ButtonLink href={topic.externalHref} fullWidth>
            ไปจัดการ{topic.title}
          </ButtonLink>
          <ButtonLink href="/opening/checklist" variant="secondary" fullWidth>
            กลับรายการเตรียมเปิดร้าน
          </ButtonLink>
        </Card>
      </AppShell>
    );
  }

  const listTitle = marketingMode
    ? "รายการเตรียมการตลาด"
    : "รายการเตรียมเปิดร้าน";

  return (
    <AppShell title="" hidePageHeader compact backHref="/opening/checklist">
      <PageHeader
        title={listTitle}
        workspace={workspaceName}
        subtitle={topic.title}
      />

      <BiDataStatus
        loading={loading}
        ready={ready}
        configured={configured}
        online={online}
        browserOffline={browserOffline}
        error={error}
        empty={false}
        hasCachedData={false}
        sourceHint={
          loading
            ? "กำลังดึง bi_assets..."
            : online
              ? `${listTitle} · ${topic.title}`
              : error
                ? "แหล่งข้อมูล: โหลดไม่สำเร็จ"
                : "กำลังเชื่อมต่อ..."
        }
        skeletonRows={4}
        onRetry={() => void retry()}
      />

      {!loading && !error ? (
        <>
          <ChecklistTopicBoard
            topic={topic}
            topicAssets={topicAssets}
            progress={progress}
          />
          {marketingMode ? null : (
            <p className="kl-type-caption text-center">
              ดูรายละเอียดเต็มได้ที่{" "}
              <Link
                href="/opening/assets"
                className="underline text-[var(--bi-text-primary)]"
              >
                ทรัพย์สิน
              </Link>
            </p>
          )}
        </>
      ) : null}
    </AppShell>
  );
}
