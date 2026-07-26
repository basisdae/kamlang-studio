"use client";

import { Moon, Sun } from "lucide-react";
import { useOrderTheme } from "./OrderThemeProvider";

export default function OrderThemeToggle() {
  const { theme, toggleTheme, ready } = useOrderTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!ready}
      aria-label={theme === "light" ? "สลับโหมดมืด" : "สลับโหมดสว่าง"}
      className="flex h-11 w-11 items-center justify-center rounded-[var(--order-radius-sm)] border border-[var(--order-border)] bg-[var(--order-card)] text-[var(--order-text)] shadow-[var(--order-shadow)] disabled:opacity-50"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      ) : (
        <Sun className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
