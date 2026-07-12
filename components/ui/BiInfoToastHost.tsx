"use client";

import { useSyncExternalStore } from "react";
import {
  dismissInfoToast,
  getInfoToast,
  subscribeInfoToast,
} from "../../app/lib/biInfoToast";

export default function BiInfoToastHost() {
  const toast = useSyncExternalStore(
    subscribeInfoToast,
    getInfoToast,
    () => null
  );

  if (!toast) return null;

  return (
    <div className="fixed inset-x-0 top-3 z-[70] px-4 pointer-events-none">
      <div className="mx-auto flex max-w-[var(--bi-app-width)] items-center gap-3 rounded-[var(--kl-radius-card)] border border-[var(--kl-border)] bg-kl-card px-4 py-3 shadow-lg pointer-events-auto">
        <p className="kl-type-body min-w-0 flex-1">{toast.message}</p>
        {toast.onUndo ? (
          <button
            type="button"
            className="kl-type-body shrink-0 font-medium underline text-[var(--bi-text-primary)] kl-pressable"
            onClick={() => {
              const fn = toast.onUndo;
              dismissInfoToast();
              fn?.();
            }}
          >
            {toast.undoLabel ?? "Undo"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
