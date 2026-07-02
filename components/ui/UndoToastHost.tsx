"use client";

import { useSyncExternalStore } from "react";
import Card from "./Card";
import {
  getUndoToastState,
  performUndoToast,
  subscribeUndoToast,
} from "../../app/lib/undoToast";

export default function UndoToastHost() {
  const toast = useSyncExternalStore(
    subscribeUndoToast,
    getUndoToastState,
    () => null
  );

  if (!toast) return null;

  return (
    <div className="kl-undo-toast fixed inset-x-0 z-[60] px-4">
      <Card className="mx-auto flex max-w-md items-center justify-between gap-3 py-3">
        <span className="text-sm font-semibold text-kl-brown">
          {toast.message}
        </span>
        <button
          type="button"
          onClick={performUndoToast}
          className="shrink-0 rounded-xl bg-kl-brown px-4 py-2 text-sm font-semibold text-white kl-pressable"
        >
          {toast.undoLabel}
        </button>
      </Card>
    </div>
  );
}
