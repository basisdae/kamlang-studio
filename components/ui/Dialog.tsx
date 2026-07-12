"use client";

import { useEffect } from "react";
import Card from "./Card";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  role?: "dialog" | "alertdialog";
  className?: string;
};

/**
 * Lightweight dialog shell — same Card chrome as ArchiveConfirm.
 * Esc closes. No overlay redesign (UX lock).
 */
export default function Dialog({
  open,
  onClose,
  title,
  children,
  role = "dialog",
  className = "",
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role={role}
      aria-modal="true"
      aria-label={title}
      className={className}
    >
      <Card className="space-y-3 !p-3.5">{children}</Card>
    </div>
  );
}
