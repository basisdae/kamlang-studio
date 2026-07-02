"use client";

import { useMemo, useState } from "react";
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

const categories: { key: Category; label: string; icon: string }[] = [
  { key: "Protein", label: "โปรตีน", icon: "🥩" },
  { key: "Vegetable", label: "ผัก / เครื่อง", icon: "🥬" },
  { key: "Sauce", label: "ซอส", icon: "🥣" },
  { key: "Other", label: "อื่น ๆ", icon: "🧂" },
];

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
    <div className="sheet-overlay">
      <div className="bottom-sheet add-sheet">
        <div className="sheet-handle" />

        <h2>เพิ่มวัตถุดิบ</h2>
        <p className="sheet-subtitle">ค้นหาแล้วแตะเพื่อเพิ่มเข้ารายการ</p>

        <div className="sheet-search">
          <span>🔍</span>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="ค้นหา เช่น หมู กะเพรา ซอส"
          />
        </div>

        <div className="grouped-picker">
          {categories.map((category) => {
            const items = filteredItems.filter(
              (item) => item.category === category.key
            );

            if (items.length === 0) return null;

            return (
              <section className="picker-group" key={category.key}>
                <h3>
                  <span>{category.icon}</span>
                  {category.label}
                </h3>

                <div className="picker-list">
                  {items.map((item) => (
                    <div
                      className="picker-row"
                      key={item.name}
                      onClick={() => onAdd(item)}
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <p>
                          เริ่มที่ {item.amount} {item.unit}
                        </p>
                      </div>

                      <span className="picker-cost">
                        ฿{formatMoney(item.amount * item.costPerUnit)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="done-button" onClick={onClose}>
          ปิด
        </div>
      </div>
    </div>
  );
}