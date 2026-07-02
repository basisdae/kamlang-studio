"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  KL_ICON_SM_CLASS,
  KL_ICON_STROKE,
} from "../../../components/layout/navConfig";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import CategoryChip from "../../../components/ui/CategoryChip";
import { Ingredient } from "./types";
import { formatMoney } from "./utils";

type Category = "Protein" | "Vegetable" | "Sauce" | "Other";

type LibraryItem = Ingredient & {
  category: Category;
};

type Props = {
  items: Ingredient[];
  onClose: () => void;
  onAdd: (item: Ingredient) => void;
};

const libraryItems: LibraryItem[] = [
  { name: "หมูสับ", amount: 90, unit: "กรัม", costPerUnit: 0.2, category: "Protein" },
  { name: "ไก่", amount: 90, unit: "กรัม", costPerUnit: 0.16, category: "Protein" },
  { name: "กุ้ง", amount: 70, unit: "กรัม", costPerUnit: 0.32, category: "Protein" },
  { name: "ใบกะเพรา", amount: 10, unit: "กรัม", costPerUnit: 0.1, category: "Vegetable" },
  { name: "พริกสด", amount: 5, unit: "กรัม", costPerUnit: 0.18, category: "Vegetable" },
  { name: "กระเทียม", amount: 5, unit: "กรัม", costPerUnit: 0.12, category: "Vegetable" },
  { name: "ซอสกะเพรา", amount: 22, unit: "กรัม", costPerUnit: 0.34, category: "Sauce" },
  { name: "น้ำมัน", amount: 10, unit: "กรัม", costPerUnit: 0.08, category: "Other" },
];

const categories: { key: Category; label: string }[] = [
  { key: "Protein", label: "โปรตีน" },
  { key: "Vegetable", label: "ผัก / เครื่อง" },
  { key: "Sauce", label: "ซอส" },
  { key: "Other", label: "อื่น ๆ" },
];

const searchFieldClassName =
  "kl-type-body w-full border-none bg-transparent outline-none placeholder:text-kl-muted";

export default function AddIngredientSheet({ onClose, onAdd }: Props) {
  const [keyword, setKeyword] = useState("");

  const filteredItems = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    if (!text) return libraryItems;

    return libraryItems.filter((item) =>
      item.name.toLowerCase().includes(text)
    );
  }, [keyword]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end kl-sheet-scrim px-4 pb-4"
      onClick={onClose}
    >
      <div
        className="mx-auto max-h-[82vh] w-full max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <Card className="max-h-[82vh] space-y-4 overflow-y-auto">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-kl-border" />

        <div className="text-center">
          <h2 className="kl-type-card-title">เพิ่มวัตถุดิบ</h2>
          <p className="kl-type-helper mt-1">ค้นหาแล้วแตะเพื่อเพิ่มเข้ารายการ</p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-kl-border bg-kl-surface px-4 py-3">
          <Search
            className={`${KL_ICON_SM_CLASS} shrink-0 text-kl-muted`}
            strokeWidth={KL_ICON_STROKE}
          />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="ค้นหา เช่น หมู กะเพรา ซอส"
            className={searchFieldClassName}
          />
        </div>

        <div className="max-h-[44vh] space-y-4 overflow-y-auto">
          {categories.map((category) => {
            const items = filteredItems.filter(
              (item) => item.category === category.key
            );

            if (items.length === 0) return null;

            return (
              <section key={category.key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <CategoryChip category={category.key} label={category.label} />
                </div>

                <div className="overflow-hidden rounded-xl border border-kl-border">
                  {items.map((item, index) => (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => onAdd(item)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left kl-pressable ${
                        index > 0 ? "border-t border-kl-border" : ""
                      }`}
                    >
                      <div>
                        <strong className="kl-type-body">{item.name}</strong>
                        <p className="kl-type-caption mt-0.5">
                          เริ่มที่ {item.amount} {item.unit}
                        </p>
                      </div>

                      <span className="kl-type-metric">
                        ฿{formatMoney(item.amount * item.costPerUnit)}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <Button type="button" variant="secondary" fullWidth onClick={onClose}>
          ปิด
        </Button>
        </Card>
      </div>
    </div>
  );
}
