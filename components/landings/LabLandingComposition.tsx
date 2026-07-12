"use client";

import { useMemo } from "react";
import { FlaskConical } from "lucide-react";
import SummaryMetric from "../bi/SummaryMetric";
import WorkspaceLandingHeader from "../workspaces/WorkspaceLandingHeader";
import ButtonLink from "../ui/ButtonLink";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import { buildLabSummary } from "../../lib/workspaces/labSummary";

/**
 * Lab Landing Composition — previews Platform Modules (Recipes, Ingredients, Cost).
 * Not a Module; must never show Opening readiness / budget / checklist.
 */
export default function LabLandingComposition() {
  const summary = useMemo(() => buildLabSummary(), []);
  const isEmpty = summary.recipeCount === 0 && summary.ingredientCount === 0;

  return (
    <div className="min-w-0 space-y-3">
      <WorkspaceLandingHeader
        icon={FlaskConical}
        accent="lab"
        title="วิจัยและพัฒนา"
        description="สูตร · วัตถุดิบ · ต้นทุน"
      />

      {isEmpty ? (
        <EmptyState
          icon={FlaskConical}
          title="ยังไม่มีสูตรหรือวัตถุดิบ"
          hint="เริ่มจากสูตรในระบบ หรือสร้างสูตรใหม่ใน Recipe Builder"
          actionLabel="เพิ่มสูตร"
          actionHref="/recipes/builder"
        />
      ) : (
        <Card className="space-y-3 !p-3">
          <div className="grid grid-cols-2 gap-2">
            <SummaryMetric label="สูตรทั้งหมด" value={summary.recipeCount} />
            <SummaryMetric label="วัตถุดิบ" value={summary.ingredientCount} />
            <SummaryMetric
              label="ยังไม่มีต้นทุน"
              value={summary.noCostCount}
              hint={
                summary.noCostCount > 0 ? "ควรตรวจราคาวัตถุดิบ" : undefined
              }
            />
            <SummaryMetric
              label="ยังไม่สมบูรณ์"
              value={summary.incompleteCount}
              hint={
                summary.incompleteCount > 0
                  ? "สูตรที่บันทึกยังขาดวัตถุดิบ"
                  : undefined
              }
            />
          </div>
          {summary.latestRecipeName ? (
            <p className="kl-type-helper">
              สูตรล่าสุด:{" "}
              <span className="font-medium text-[var(--bi-text-primary)]">
                {summary.latestRecipeName}
              </span>
              {summary.latestRecipeAt
                ? ` · ${new Date(summary.latestRecipeAt).toLocaleDateString("th-TH")}`
                : null}
            </p>
          ) : null}
          <p className="kl-type-caption">
            มาตรฐาน {summary.standardCount} · ที่บันทึก {summary.savedCount}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2">
        <ButtonLink href="/recipes" fullWidth>
          ดูสูตร
        </ButtonLink>
        <ButtonLink href="/recipes/builder" variant="secondary" fullWidth>
          เพิ่มสูตร
        </ButtonLink>
        <ButtonLink href="/ingredients" variant="secondary" fullWidth>
          ดูวัตถุดิบ
        </ButtonLink>
        <ButtonLink href="/costing" variant="secondary" fullWidth>
          ดูต้นทุน
        </ButtonLink>
      </div>

      <Card className="!p-3">
        <p className="kl-type-card-title">Knowledge</p>
        <p className="kl-type-helper mt-1">
          ยังไม่มีหน้า Knowledge ในแอป — ข้อมูล knowledge อยู่ในไลบรารีภายในเท่านั้น
        </p>
      </Card>
    </div>
  );
}
