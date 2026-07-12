"use client";

import { useEffect, useRef, useState } from "react";
import Button from "../../../../components/ui/Button";
import { KL_FIELD_CLASS } from "../../../../components/ui/designLock";

type Props = {
  topicTitle: string;
  disabled?: boolean;
  onAdd: (name: string) => Promise<boolean>;
};

/**
 * Quick Add — autofocus, Enter=Save, Esc=Cancel, stay focused for next row.
 */
export default function ChecklistQuickAdd({
  topicTitle,
  disabled = false,
  onAdd,
}: Props) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled, topicTitle]);

  async function save() {
    const trimmed = name.trim();
    if (!trimmed || busy || disabled) return;
    setBusy(true);
    setError("");
    const ok = await onAdd(trimmed);
    setBusy(false);
    if (ok) {
      setName("");
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setError("บันทึกไม่สำเร็จ — ลองใหม่");
    }
  }

  function cancel() {
    setName("");
    setError("");
    inputRef.current?.focus();
  }

  return (
    <div className="space-y-1.5">
      <label className="kl-type-caption" htmlFor="checklist-quick-add">
        Quick Add · {topicTitle}
      </label>
      <div className="flex gap-2">
        <input
          id="checklist-quick-add"
          ref={inputRef}
          type="text"
          className={`${KL_FIELD_CLASS} mt-0 min-h-[2.75rem] min-w-0 flex-1`}
          placeholder="พิมพ์ชื่อ แล้วกด Enter"
          value={name}
          disabled={disabled || busy}
          autoComplete="off"
          enterKeyHint="done"
          aria-label={`เพิ่ม${topicTitle}เร็ว`}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void save();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
        />
        <Button
          type="button"
          className="min-h-[2.75rem] shrink-0 px-3"
          disabled={disabled || busy || !name.trim()}
          onClick={() => void save()}
        >
          {busy ? "..." : "เพิ่ม"}
        </Button>
      </div>
      {error ? (
        <p className="kl-type-caption text-kl-danger-text" role="alert">
          {error}
        </p>
      ) : (
        <p className="kl-type-caption">Enter = บันทึก · Esc = ยกเลิก</p>
      )}
    </div>
  );
}
