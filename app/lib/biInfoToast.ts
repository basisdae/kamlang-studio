"use client";

type InfoToast = {
  id: string;
  message: string;
} | null;

let current: InfoToast = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function subscribeInfoToast(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getInfoToast(): InfoToast {
  return current;
}

export function showInfoToast(message: string, durationMs = 4000) {
  if (typeof window === "undefined") return;
  if (timer) clearTimeout(timer);
  current = { id: String(Date.now()), message };
  notify();
  timer = setTimeout(() => {
    current = null;
    notify();
  }, durationMs);
}
