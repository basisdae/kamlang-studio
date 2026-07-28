import Card from "../../../../components/ui/Card";
import type { PackagingSet } from "../../../packaging/types";
import type { Recipe } from "../../../recipes/types";
import type {
  MenuBuilderValidationErrors,
  MenuSaleStatus,
} from "../../builder/types";
import type { RecipeLinkMode } from "../hooks/useMenuBuilder";

type RecipeOption = Pick<Recipe, "id" | "name" | "category">;

type Props = {
  recipes: RecipeOption[];
  packagingSets: PackagingSet[];
  name: string;
  category: string;
  recipeId: string;
  recipeMode: RecipeLinkMode;
  packagingSetId: string;
  sellingPrice: string;
  saleStatus: MenuSaleStatus;
  notes: string;
  costNotice: string | null;
  validationErrors: MenuBuilderValidationErrors;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onRecipeIdChange: (value: string) => void;
  onRecipeModeChange: (value: RecipeLinkMode) => void;
  onPackagingSetIdChange: (value: string) => void;
  onSellingPriceChange: (value: string) => void;
  onSaleStatusChange: (value: MenuSaleStatus) => void;
  onNotesChange: (value: string) => void;
};

const fieldClassName = "kl-input mt-2";

export default function MenuBuilderForm({
  recipes,
  packagingSets,
  name,
  category,
  recipeId,
  recipeMode,
  packagingSetId,
  sellingPrice,
  saleStatus,
  notes,
  costNotice,
  validationErrors,
  onNameChange,
  onCategoryChange,
  onRecipeIdChange,
  onRecipeModeChange,
  onPackagingSetIdChange,
  onSellingPriceChange,
  onSaleStatusChange,
  onNotesChange,
}: Props) {
  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <p className="kl-type-card-title">ข้อมูลเมนู</p>

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
          {validationErrors.category ? (
            <div className="kl-type-caption mt-1 text-kl-danger-text">
              {validationErrors.category}
            </div>
          ) : null}
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
            placeholder="ยังไม่ตั้ง — กรอกเอง"
          />
          {validationErrors.sellingPrice ? (
            <div className="kl-type-caption mt-1 text-kl-danger-text">
              {validationErrors.sellingPrice}
            </div>
          ) : null}
        </div>

        <div>
          <label className="kl-type-label">รายละเอียดสั้น</label>
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            className={`${fieldClassName} min-h-[88px]`}
            placeholder="ยังไม่ใส่ — กรอกเอง"
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="kl-type-card-title">สูตรและต้นทุน</p>

        <div className="space-y-2">
          {(
            [
              ["none", "ไม่เชื่อมสูตร"],
              ["link", "เชื่อมสูตรที่มีอยู่"],
              ["create", "สร้างสูตรใหม่จากเมนูนี้"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex min-h-[44px] items-center gap-3"
            >
              <input
                type="radio"
                name="recipe-mode"
                checked={recipeMode === value}
                onChange={() => onRecipeModeChange(value)}
                className="h-5 w-5"
              />
              <span className="kl-type-body">{label}</span>
            </label>
          ))}
        </div>

        {costNotice ? (
          <p className="kl-type-helper rounded-[var(--kl-radius-inner)] bg-kl-surface px-3 py-2">
            {costNotice}
          </p>
        ) : null}

        {recipeMode === "link" ? (
          <div>
            <label className="kl-type-label">เลือกสูตร</label>
            <select
              value={recipeId}
              onChange={(event) => onRecipeIdChange(event.target.value)}
              className={fieldClassName}
            >
              <option value="">เลือกสูตร (ไม่บังคับตอนนี้ก็ได้)</option>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {recipeMode === "create" ? (
          <p className="kl-type-helper text-kl-muted">
            บันทึกเมนูก่อน แล้วระบบจะพาไปหน้าสร้างสูตรและเชื่อมกลับเมนูนี้โดยไม่สร้างเมนูซ้ำ
          </p>
        ) : null}

        <div>
          <label className="kl-type-label">ของห่อกลับบ้าน</label>
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
      </Card>

      <Card className="space-y-3">
        <p className="kl-type-card-title">สถานะการขาย</p>
        {(
          [
            ["draft", "บันทึกเป็นแบบร่าง"],
            ["active", "เปิดขาย"],
            ["closed", "ปิดขาย"],
            ["archived", "เก็บถาวร"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex min-h-[44px] items-center gap-3">
            <input
              type="radio"
              name="sale-status"
              checked={saleStatus === value}
              onChange={() => onSaleStatusChange(value)}
              className="h-5 w-5"
            />
            <span className="kl-type-body">{label}</span>
          </label>
        ))}
      </Card>
    </div>
  );
}
