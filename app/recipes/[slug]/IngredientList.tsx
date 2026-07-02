"use client";

import { Ingredient } from "./types";
import { formatMoney } from "./utils";

type Props = {
  ingredients: Ingredient[];
  onSelect: (name: string) => void;
  onAdd: () => void;
};

export default function IngredientList({ ingredients, onSelect, onAdd }: Props) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>วัตถุดิบ</h2>
        <button type="button" onClick={onAdd}>
          + เพิ่ม
        </button>
      </div>

      <div className="ingredient-list">
        {ingredients.map((item) => {
          const itemCost = item.amount * item.costPerUnit;

          return (
            <button
              type="button"
              className="ingredient-row"
              key={item.name}
              onClick={() => onSelect(item.name)}
            >
              <strong>{item.name}</strong>
              <span className="amount">
                {item.amount} {item.unit}
              </span>
              <span className="cost">฿{formatMoney(itemCost)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
