import Card from "../../../../components/ui/Card";
import type { HeaderFormProps } from "../types";

export default function HeaderForm({
  menuName,
  category,
  menuNameError,
  onMenuNameChange,
  onCategoryChange,
}: HeaderFormProps) {
  return (
    <Card className="space-y-4">
      <div>
        <label className="kl-type-label">ชื่อสูตร</label>
        <input
          value={menuName}
          onChange={(e) => onMenuNameChange(e.target.value)}
          className="kl-input mt-2"
          placeholder="เช่น กะเพราเนื้อ"
        />
        {menuNameError ? (
          <div className="kl-type-caption mt-1 text-kl-danger-text">
            {menuNameError}
          </div>
        ) : null}
      </div>

      <div>
        <label className="kl-type-label">หมวดหมู่</label>
        <input
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="kl-input mt-2"
          placeholder="เช่น เมนูขายดี"
        />
      </div>
    </Card>
  );
}
