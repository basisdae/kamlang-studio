export const UNDO_TOAST_DURATION_MS = 8000;

export type UndoToastOptions = {
  message?: string;
  undoLabel?: string;
  onUndo: () => void;
  onExpire?: () => void;
  durationMs?: number;
};

type UndoToastState = {
  message: string;
  undoLabel: string;
  onUndo: () => void;
  onExpire?: () => void;
} | null;

let currentToast: UndoToastState = null;
let expireTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeUndoToast(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getUndoToastState(): UndoToastState {
  return currentToast;
}

export function clearUndoToast(): void {
  if (expireTimer) {
    clearTimeout(expireTimer);
    expireTimer = null;
  }

  currentToast = null;
  notify();
}

export function showUndoToast(options: UndoToastOptions): void {
  if (typeof window === "undefined") return;

  if (expireTimer) {
    clearTimeout(expireTimer);
    expireTimer = null;
  }

  const onExpire = options.onExpire;

  currentToast = {
    message: options.message ?? "ลบแล้ว",
    undoLabel: options.undoLabel ?? "ย้อนกลับ",
    onUndo: options.onUndo,
    onExpire,
  };

  notify();

  expireTimer = setTimeout(() => {
    expireTimer = null;
    currentToast = null;
    notify();
    onExpire?.();
  }, options.durationMs ?? UNDO_TOAST_DURATION_MS);
}

export function performUndoToast(): void {
  if (!currentToast) return;

  const { onUndo } = currentToast;
  clearUndoToast();
  onUndo();
}
