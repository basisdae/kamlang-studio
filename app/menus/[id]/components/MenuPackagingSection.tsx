import Card from "../../../../components/ui/Card";
import CategoryChip from "../../../../components/ui/CategoryChip";
import EmptyState from "../../../../components/ui/EmptyState";
import SectionTitle from "../../../../components/ui/SectionTitle";
import { EMPTY_STATE } from "../../../copy/emptyStates";
import type { PackagingItem, PackagingSet } from "../../../packaging/types";
import { formatMenuBaht } from "../../utils";

type Props = {
  packagingSet?: PackagingSet;
  items: PackagingItem[];
  editHref?: string;
};

export default function MenuPackagingSection({
  packagingSet,
  items,
  editHref,
}: Props) {
  return (
    <section className="space-y-3">
      <SectionTitle module="menus">ของห่อกลับบ้าน</SectionTitle>

      {!packagingSet ? (
        <EmptyState
          {...EMPTY_STATE.menus.packaging}
          actionLabel={editHref ? "แก้ไขเมนูขาย" : undefined}
          actionHref={editHref}
        />
      ) : (
        <Card className="space-y-4">
          <div>
            <div className="kl-type-card-title">{packagingSet.name}</div>
            <p className="kl-type-caption mt-1">{packagingSet.description}</p>
          </div>

          <div className="kl-list">
            {items.map((item) => (
              <div
                key={item.id}
                className="kl-list-row"
              >
                <div>
                  <div className="kl-type-body">{item.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <CategoryChip category={item.category} />
                    <span className="kl-type-caption">{item.unit}</span>
                  </div>
                </div>

                <div className="kl-type-metric">
                  ฿{formatMenuBaht(item.cost)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}
