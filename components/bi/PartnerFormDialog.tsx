"use client";

import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { KL_FIELD_CLASS } from "../ui/designLock";
import {
  PARTNER_CATEGORIES,
  PARTNER_CATEGORY_LABELS,
  type PartnerCategory,
  type PartnerRecord,
} from "../../lib/partners/types";
import type { PartnerWriteInput } from "../../lib/mappers/partnerMapper";

type Props = {
  open: boolean;
  initial?: PartnerRecord | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (input: PartnerWriteInput) => void | Promise<void>;
};

const EMPTY = {
  name: "",
  category: "supplier" as PartnerCategory,
  phone: "",
  notes: "",
};

/** Minimal Partner form — ชื่อ · ประเภท · เบอร์ · หมายเหตุ */
export default function PartnerFormDialog({
  open,
  initial = null,
  saving = false,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name: initial.name,
        category: initial.category,
        phone: initial.phone,
        notes: initial.notes,
      });
    } else {
      setForm(EMPTY);
    }
    setError("");
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError("กรุณาใส่ชื่อ Partner");
      return;
    }
    setError("");
    await onSave({
      name,
      category: form.category,
      phone: form.phone.trim(),
      notes: form.notes.trim(),
    });
  }

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? "แก้ไข Partner" : "เพิ่ม Partner"}
    >
      <form className="space-y-3" onSubmit={(e) => void handleSubmit(e)}>
        <label className="block">
          <span className="kl-type-caption text-kl-muted">ชื่อ *</span>
          <input
            className={KL_FIELD_CLASS}
            value={form.name}
            disabled={saving}
            autoFocus
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>

        <label className="block">
          <span className="kl-type-caption text-kl-muted">ประเภท *</span>
          <select
            className={KL_FIELD_CLASS}
            value={form.category}
            disabled={saving}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                category: e.target.value as PartnerCategory,
              }))
            }
          >
            {PARTNER_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {PARTNER_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="kl-type-caption text-kl-muted">เบอร์</span>
          <input
            className={KL_FIELD_CLASS}
            type="tel"
            inputMode="tel"
            value={form.phone}
            disabled={saving}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </label>

        <label className="block">
          <span className="kl-type-caption text-kl-muted">หมายเหตุ</span>
          <textarea
            className={`${KL_FIELD_CLASS} min-h-[4.5rem] py-2`}
            value={form.notes}
            disabled={saving}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </label>

        {error ? (
          <p className="kl-type-caption text-kl-danger-text">{error}</p>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={saving}
            onClick={onClose}
          >
            ยกเลิก
          </Button>
          <Button type="submit" fullWidth disabled={saving}>
            {saving ? "กำลังบันทึก…" : "บันทึก"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
