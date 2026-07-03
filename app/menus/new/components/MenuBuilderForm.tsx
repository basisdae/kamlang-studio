import Card from "../../../../components/ui/Card";
import type { PackagingSet } from "../../../packaging/types";
import type { Recipe } from "../../../recipes/types";
import type { MenuBuilderValidationErrors } from "../../builder/types";

type RecipeOption = Pick<Recipe, "id" | "name" | "category">;

type Props = {
  recipes: RecipeOption[];
  packagingSets: PackagingSet[];
  name: string;
  category: string;
  recipeId: string;
  packagingSetId: string;
  sellingPrice: string;
  validationErrors: MenuBuilderValidationErrors;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onRecipeIdChange: (value: string) => void;
  onPackagingSetIdChange: (value: string) => void;
  onSellingPriceChange: (value: string) => void;
};

const fieldClassName = "kl-input mt-2";

export default function MenuBuilderForm({
  recipes,
  packagingSets,
  name,
  category,
  recipeId,
  packagingSetId,
  sellingPrice,
  validationErrors,
  onNameChange,
  onCategoryChange,
  onRecipeIdChange,
  onPackagingSetIdChange,
  onSellingPriceChange,
}: Props) {
  return (
    <Card className="space-y-4">
      <div>
        <label className="kl-type-label">ชื่อเมนูขาย</label>
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className={fieldClassName}
          placeholder="เช่น กะเพราหมูสับราดข้าว"
        />
        {validationErrors.name ? (
          <div className="kl-type-caption mt-1 text-kl-danger-text">
            {validationErrors.name}
          </div>
        ) : null}
      </div>

      <div>
        <label className="kl-type-label">หมวดหมู่</label>
        <input
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className={fieldClassName}
          placeholder="เช่น จานเดียว"
        />
      </div>

      <div>
        <label className="kl-type-label">สูตร</label>
        <select
          value={recipeId}
          onChange={(event) => onRecipeIdChange(event.target.value)}
          className={fieldClassName}
        >
          <option value="">เลือกสูตร</option>
          {recipes.map((recipe) => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.name}
            </option>
          ))}
        </select>
        {validationErrors.recipeId ? (
          <div className="kl-type-caption mt-1 text-kl-danger-text">
            {validationErrors.recipeId}
          </div>
        ) : null}
      </div>

      <div>
        <label className="kl-type-label">
          ของห่อกลับบ้าน
        </label>
        <select
          value={packagingSetId}
          onChange={(event) => onPackagingSetIdChange(event.target.value)}
          className={fieldClassName}
        >
          <option value="">ไม่เลือก</option>
          {packagingSets.map((set) => (
            <option key={set.id} value={set.id}>
              {set.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="kl-type-label">ราคาขาย</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          value={sellingPrice}
          onChange={(event) => onSellingPriceChange(event.target.value)}
          className={fieldClassName}
          placeholder="เช่น 69"
        />
        {validationErrors.sellingPrice ? (
          <div className="kl-type-caption mt-1 text-kl-danger-text">
            {validationErrors.sellingPrice}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
