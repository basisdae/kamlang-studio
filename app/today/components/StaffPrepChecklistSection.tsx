import { Check } from "lucide-react";
import {
  KL_ICON_SM_CLASS,
  KL_ICON_STROKE,
} from "../../../components/layout/navConfig";
import SectionTitle from "../../../components/ui/SectionTitle";
import { PRODUCTION_UI } from "../../production/copy";
import type { StaffPrepChecklistItem } from "../types";

type Props = {
  title: string;
  items: StaffPrepChecklistItem[];
  checkedStates: Record<string, boolean>;
  preparedCount: number;
  progressLabel?: string;
  onToggle: (itemKey: string) => void;
};
function StaffPrepChecklistRow({
  item,
  isChecked,
  onToggle,
}: {
  item: StaffPrepChecklistItem;
  isChecked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3.5 kl-pressable">
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-kl-border bg-kl-card">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
          className="sr-only"
        />
        {isChecked ? (
          <Check
            className={`${KL_ICON_SM_CLASS} text-kl-primary`}
            strokeWidth={KL_ICON_STROKE}
          />
        ) : null}
      </span>

      <div className="min-w-0 flex-1">
        <div
          className={`kl-type-body ${
            isChecked ? "text-kl-muted line-through" : ""
          }`}
        >
          {item.name}
        </div>
        {item.note ? (
          <p className="kl-type-helper mt-1">{item.note}</p>
        ) : null}
      </div>

      <div className="shrink-0 text-right tabular-nums">
        <div className="kl-type-metric">{item.quantityLabel}</div>
        <div className="kl-type-label">{item.unitLabel}</div>
      </div>
    </label>
  );
}

export default function StaffPrepChecklistSection({
  title,
  items,
  checkedStates,
  preparedCount,
  progressLabel = PRODUCTION_UI.progress.prepared,
  onToggle,
}: Props) {  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <SectionTitle module="today">{title}</SectionTitle>
        <span className="kl-type-caption tabular-nums text-kl-muted">
          {progressLabel} {preparedCount}/{items.length}
        </span>
      </div>

      <div className="kl-section">
        <div className="kl-list">
          {items.map((item) => (
            <StaffPrepChecklistRow
              key={item.key}
              item={item}
              isChecked={Boolean(checkedStates[item.key])}
              onToggle={() => onToggle(item.key)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
