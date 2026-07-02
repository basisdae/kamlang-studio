import { HOME_UI } from "../copy";
import HomeSectionHeader from "./HomeSectionHeader";

type Props = {
  title: string;
  href: string;
  actionLabel: string;
  boughtCount: number;
  totalCount: number;
  hasPurchaseList: boolean;
  emptyMessage?: string;
};

export default function HomePurchaseProgress({
  title,
  href,
  actionLabel,
  boughtCount,
  totalCount,
  hasPurchaseList,
  emptyMessage = HOME_UI.purchase.emptyNoPlan,
}: Props) {
  const remaining = totalCount - boughtCount;
  const progressPercent =
    totalCount > 0 ? Math.round((boughtCount / totalCount) * 100) : 0;
  const isComplete = hasPurchaseList && totalCount > 0 && remaining === 0;

  return (
    <div className="kl-section space-y-4">
      <HomeSectionHeader
        title={title}
        href={href}
        actionLabel={actionLabel}
        module="purchase"
      />

      {!hasPurchaseList ? (
        <p className="kl-type-caption py-1 text-center">{emptyMessage}</p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="kl-type-caption">
              {isComplete
                ? HOME_UI.purchase.boughtAll
                : HOME_UI.purchase.remaining(remaining)}
            </div>
            <div className="kl-type-metric">
              {boughtCount}/{totalCount} รายการ
            </div>
          </div>

          <div className="kl-progress-track">
            <div
              className="kl-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
