import {
  getIngredientCategoryClass,
  getIngredientCategoryLabel,
} from "./semanticColors";

type Props = {
  category: string;
  label?: string;
};

export default function CategoryChip({ category, label }: Props) {
  const className = getIngredientCategoryClass(category);

  return (
    <span className={`kl-cat-chip ${className}`}>
      {label ?? getIngredientCategoryLabel(category)}
    </span>
  );
}
