import { HOME_UI } from "../copy";
import HomeSectionHeader from "./HomeSectionHeader";

type MenuLine = {
  menuName: string;
  quantity: number;
};

type Props = {
  title: string;
  href: string;
  actionLabel: string;
  totalQuantity: number;
  menuLines: MenuLine[];
  hasPlan: boolean;
  showQuantityHeadline?: boolean;
};

export default function HomeProductionSummary({
  title,
  href,
  actionLabel,
  totalQuantity,
  menuLines,
  hasPlan,
  showQuantityHeadline = true,
}: Props) {
  return (
    <div className={`kl-section space-y-4`}>
      <HomeSectionHeader
        title={title}
        href={href}
        actionLabel={actionLabel}
        module="production"
      />

      {!hasPlan ? (
        <p className="kl-type-caption py-1 text-center">
          {HOME_UI.production.empty}
        </p>
      ) : (
        <>
          {showQuantityHeadline ? (
            <p className="kl-type-caption">
              {HOME_UI.production.mustProduce(totalQuantity)}
            </p>
          ) : null}

          <div className="kl-list">
            {menuLines.map((line) => (
              <div key={line.menuName} className="kl-list-row">
                <div className="kl-type-body min-w-0 flex-1 break-words">
                  {line.menuName}
                </div>
                <div className="kl-type-metric shrink-0">×{line.quantity}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
