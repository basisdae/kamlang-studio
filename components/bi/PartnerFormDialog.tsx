"use client";

import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { KL_FIELD_CLASS } from "../ui/designLock";
import {
  PARTNER_CATEGORIES,
  PARTNER_STATUS_LABELS,
  type PartnerCategory,
  type PartnerRecord,
  type PartnerStatus,
} from "../../lib/partners/types";
import type { PartnerWriteInput } from "../../lib/partners/partnerCore";

type Props = {
  open: boolean;
  initial?: PartnerRecord | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (input: PartnerWriteInput) => void | Promise<void>;
};

const EMPTY = {
  name: "",
  category: "Supplier" as PartnerCategory,
  status: "active" as PartnerStatus,
  role: "",
  note: "",
  investment: "",
  percent: "",
};

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
        status: initial.status,
        role: initial.role,
        note: initial.note,
        investment:
          initial.investment == null ? "" : String(initial.investment),
        percent: initial.percent == null ? "" : String(initial.percent),
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
    const investmentRaw = form.investment.trim();
    const percentRaw = form.percent.trim();
    let investment: number | null = null;
    let percent: number | null = null;
    if (investmentRaw !== "") {
      investment = Number(investmentRaw);
      if (Number.isNaN(investment) || investment < 0) {
        setError("เงินลงทุนต้องเป็นตัวเลข ≥ 0 หรือเว้นว่าง");
        return;
      }
    }
    if (percentRaw !== "") {
      percent = Number(percentRaw);
      if (Number.isNaN(percent) || percent < 0 || percent > 100) {
        setError("สัดส่วนต้องอยู่ระหว่าง 0–100 หรือเว้นว่าง");
        return;
      }
    }
    setError("");
    await onSave({
      name,
      category: form.category,
      status: form.status,
      role: form.role,
      note: form.note,
      investment,
      percent,
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
        <p className="kl-type-card-title">
          {initial ? "แก้ไข Partner" : "เพิ่ม Partner"}
        </p>

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
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="kl-type-caption text-kl-muted">สถานะ</span>
          <select
            className={KL_FIELD_CLASS}
            value={form.status}
            disabled={saving}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status: e.target.value as PartnerStatus,
              }))
            }
          >
            {(Object.keys(PARTNER_STATUS_LABELS) as PartnerStatus[]).map(
              (s) => (
                <option key={s} value={s}>
                  {PARTNER_STATUS_LABELS[s]}
                </option>
              )
            )}
          </select>
        </label>

        <label className="block">
          <span className="kl-type-caption text-kl-muted">บทบาท</span>
          <input
            className={KL_FIELD_CLASS}
            value={form.role}
            disabled={saving}
            placeholder="เช่น จัดซื้อ / ออกแบบเมนู"
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          />
        </label>

        <label className="block">
          <span className="kl-type-caption text-kl-muted">หมายเหตุ</span>
          <textarea
            className={`${KL_FIELD_CLASS} min-h-[4.5rem] py-2`}
            value={form.note}
            disabled={saving}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="kl-type-caption text-kl-muted">
              เงินลงทุน (ถ้ามี)
            </span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              className={KL_FIELD_CLASS}
              value={form.investment}
              disabled={saving}
              onChange={(e) =>
                setForm((f) => ({ ...f, investment: e.target.value }))
              }
            />
          </label>
          <label className="block">
            <span className="kl-type-caption text-kl-muted">สัดส่วน % </span>
            <input
              type="number"
              min={0}
              max={100}
              inputMode="decimal"
              className={KL_FIELD_CLASS}
              value={form.percent}
              disabled={saving}
              onChange={(e) =>
                setForm((f) => ({ ...f, percent: e.target.value }))
              }
            />
          </label>
        </div>

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
