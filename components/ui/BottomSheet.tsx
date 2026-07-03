"use client";

import type { ReactNode } from "react";
import Card from "./Card";

type BottomSheetSurface = "card" | "panel" | "modal";

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  surface?: BottomSheetSurface;
  /** Builder popups sit above nav with extra bottom padding */
  layer?: "overlay" | "builder";
  closeOnBackdrop?: boolean;
  scrollable?: boolean;
  className?: string;
  innerClassName?: string;
};

function getSurfaceClassName(
  surface: BottomSheetSurface,
  scrollable: boolean
): string {
  if (surface === "panel") {
    return `kl-sheet${scrollable ? " kl-sheet--scroll" : ""}`;
  }

  if (surface === "modal") {
    return "kl-sheet kl-sheet--modal";
  }

  return "";
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  surface = "card",
  layer = "overlay",
  closeOnBackdrop = true,
  scrollable = true,
  className = "",
  innerClassName = "",
}: Props) {
  if (!isOpen) return null;

  const isBuilderLayer = layer === "builder";
  const overlayClassName = [
    isBuilderLayer
      ? "kl-sheet-builder fixed inset-0 z-50 flex items-end kl-sheet-scrim px-4"
      : "kl-sheet-overlay fixed inset-0 flex items-end kl-sheet-scrim px-4",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  function handleBackdropClick() {
    if (!closeOnBackdrop) return;
    onClose?.();
  }

  const surfaceClassName = getSurfaceClassName(surface, scrollable);
  const cardClassName = [
    "mx-auto w-full max-w-md",
    scrollable ? "max-h-[85vh] overflow-y-auto" : "",
    innerClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const panelClassName = [surfaceClassName, innerClassName].filter(Boolean).join(" ");

  return (
    <div className={overlayClassName} onClick={handleBackdropClick}>
      {surface === "card" ? (
        <div
          className={cardClassName}
          onClick={(event) => event.stopPropagation()}
        >
          <Card className={scrollable ? "max-h-[85vh] overflow-y-auto" : ""}>
            {children}
          </Card>
        </div>
      ) : (
        <div
          className={panelClassName}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}
