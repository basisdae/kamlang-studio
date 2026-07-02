import { formatMoney } from "./utils";

type Props = {
  category: string;
  name: string;
  price: number;
  totalCost: number;
};

export default function RecipeHero({ category, name, price, totalCost }: Props) {
  const profit = price - totalCost;
  const profitPercent = Math.round((profit / price) * 100);

  return (
    <section className="recipe-hero">
      <div className="recipe-title">
        <p>{category}</p>
        <h2>{name}</h2>
      </div>

      <div className="recipe-summary">
        <div>
          <span>ขาย</span>
          <strong>฿{price}</strong>
        </div>

        <div>
          <span>ต้นทุน</span>
          <strong>฿{formatMoney(totalCost)}</strong>
        </div>

        <div>
          <span>กำไร</span>
          <strong>{profitPercent}%</strong>
        </div>
      </div>
    </section>
  );
}
