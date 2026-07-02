import { Check } from "lucide-react";
import {
  KL_ICON_SM_CLASS,
  KL_ICON_STROKE,
} from "../../../components/layout/navConfig";
import { getIngredientById } from "../../ingredients/IngredientRepository";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import SectionTitle from "../../../components/ui/SectionTitle";
import { formatProductionQuantity } from "../../production/utils";
import type { PurchaseListLine, SavedPurchaseLineState } from "../types";
import { purchaseLineKey } from "../utils";

type Props = {
  lines: PurchaseListLine[];
  lineStates: Record<string, SavedPurchaseLineState>;
  onToggle: (lineKey: string) => void;
  onNoteChange: (lineKey: string, note: string) => void;
};

const noteFieldClassName = "kl-input mt-2 px-3 py-2";

export default function PurchaseListItems({
  lines,
  lineStates,
  onToggle,
  onNoteChange,
}: Props) {
  return (
    <section className="space-y-3">
      <SectionTitle module="purchase">ของที่ต้องซื้อ</SectionTitle>

      <Card className="overflow-hidden p-0">
        <ul className="divide-y divide-kl-border">
          {lines.map((line) => {
            const key = purchaseLineKey(line.ingredientId, line.unit);
            const state = lineStates[key] ?? { isBought: false, note: "" };
            const ingredient = getIngredientById(line.ingredientId);
            const name = ingredient?.name ?? "ไม่พบวัตถุดิบ";
            const isReceived = Boolean(state.isReceived);

            return (
              <li
                key={key}
                className={
                  isReceived || state.isBought ? "bg-kl-surface" : "bg-kl-card"
                }
              >
                <div className="px-4 py-3">
                  <label className="flex min-h-11 cursor-pointer items-start gap-3 kl-pressable">
                    <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-kl-border bg-kl-card">
                      <input
                        type="checkbox"
                        checked={state.isBought}
                        onChange={() => onToggle(key)}
                        className="sr-only"
                      />
                      {state.isBought ? (
                        <Check
                          className={`${KL_ICON_SM_CLASS} text-kl-primary`}
                          strokeWidth={KL_ICON_STROKE}
                        />
                      ) : null}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div
                          className={`kl-type-card-title ${
                            state.isBought && !isReceived
                              ? "text-kl-muted line-through"
                              : ""
                          }`}
                        >
                          {name}
                        </div>
                        {isReceived ? (
                          <Badge tone="completed">รับเข้าแล้ว</Badge>
                        ) : null}
                      </div>

                      <div className="kl-type-caption mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="kl-type-metric">
                          {formatProductionQuantity(line.quantityNeeded)}
                        </span>
                        <span className="text-kl-muted">{line.unit}</span>
                      </div>

                      {isReceived && state.receivedQuantity !== undefined ? (
                        <div className="kl-type-caption mt-1">
                          รับเข้า{" "}
                          {formatProductionQuantity(state.receivedQuantity)}{" "}
                          หน่วยในครัว
                        </div>
                      ) : null}

                      {line.note ? (
                        <div className="kl-type-caption mt-1">{line.note}</div>
                      ) : null}
                    </div>
                  </label>

                  <input
                    type="text"
                    value={state.note}
                    onChange={(event) => onNoteChange(key, event.target.value)}
                    placeholder="เช่น ซื้อแล้ว 2 กก., ของหมด, ราคาขึ้น"
                    className={noteFieldClassName}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}
