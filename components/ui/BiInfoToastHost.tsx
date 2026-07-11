"use client";

import { useSyncExternalStore } from "react";
import {
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
      <div className="mx-auto max-w-[var(--bi-app-width)] rounded-[var(--kl-radius-card)] border border-[var(--kl-border)] bg-kl-card px-4 py-3 shadow-lg">
        <p className="kl-type-body">{toast.message}</p>
      </div>
    </div>
  );
}
