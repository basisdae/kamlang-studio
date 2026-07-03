import Card from "../../../../components/ui/Card";
import FormField from "../../../../components/ui/FormField";
import type { HeaderFormProps } from "../types";

const fieldClassName = "kl-input mt-2";

export default function HeaderForm({
  menuName,
  category,
  menuNameError,
  onMenuNameChange,
  onCategoryChange,
}: HeaderFormProps) {
  return (
    <Card className="space-y-4">
      <FormField label="ชื่อสูตร" error={menuNameError}>
        <input
          value={menuName}
          onChange={(e) => onMenuNameChange(e.target.value)}
          className={fieldClassName}
          placeholder="เช่น กะเพราเนื้อ"
        />
      </FormField>

      <FormField label="หมวดหมู่">
        <input
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={fieldClassName}
          placeholder="เช่น จานเดียว, ต้ม/แกง"
        />
      </FormField>
    </Card>
  );
}
