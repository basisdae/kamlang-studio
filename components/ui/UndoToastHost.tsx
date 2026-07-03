"use client";

import { useSyncExternalStore } from "react";
import Card from "./Card";
import Button from "./Button";
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
        <span className="kl-type-caption font-medium text-kl-text">
          {toast.message}
        </span>
        <Button type="button" size="sm" onClick={performUndoToast}>
          {toast.undoLabel}
        </Button>
      </Card>
    </div>
  );
}
