import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import AppNav from "./AppNav";
import IconButtonLink from "../ui/IconButtonLink";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "./navConfig";

type AppShellProps = {
  title: string;
  description?: string;
  hidePageHeader?: boolean;
  compact?: boolean;
  headerAction?: {
    href: string;
    label: string;
    badge?: number;
  };
  children: React.ReactNode;
  backHref?: string;
};

export default function AppShell({
  title,
  description,
  hidePageHeader = false,
  compact = false,
  headerAction,
  children,
  backHref,
}: AppShellProps) {
  const mainPadding = compact
    ? "kl-page-safe-top--compact pb-5"
    : "kl-page-safe-top pb-7";
  const contentGap = compact ? "space-y-4" : "space-y-7";

  return (
    <>
      <main
        className={`kl-page-above-nav min-h-screen overflow-x-hidden bg-kl-ivory px-5 text-kl-brown ${mainPadding}`}
      >
        <div className={`mx-auto min-w-0 max-w-md ${contentGap}`}>
          {hidePageHeader ? (
            <>
              {backHref ? (
                <div className="flex items-center">
                  <IconButtonLink href={backHref} aria-label="กลับ">
                    <ChevronLeft
                      className={KL_ICON_CLASS}
                      strokeWidth={KL_ICON_STROKE}
                    />
                  </IconButtonLink>
                </div>
              ) : null}
              {headerAction ? (
                <div className="flex justify-end">
                  <Link
                    href={headerAction.href}
                    className="kl-notification-pill kl-pressable"
                  >
                    <span>{headerAction.label}</span>
                    {headerAction.badge ? (
                      <span className="kl-notification-pill-count">
                        {headerAction.badge}
                      </span>
                    ) : null}
                  </Link>
                </div>
              ) : null}
            </>
          ) : (
            <header className="flex items-start gap-3">
              {backHref && (
                <IconButtonLink href={backHref} aria-label="กลับ">
                  <ChevronLeft
                    className={KL_ICON_CLASS}
                    strokeWidth={KL_ICON_STROKE}
                  />
                </IconButtonLink>
              )}

              <div className="min-w-0 flex-1">
                <h1 className="kl-type-page-title">{title}</h1>
                {description ? (
                  <p className="kl-type-description mt-2">{description}</p>
                ) : null}
                {headerAction ? (
                  <Link
                    href={headerAction.href}
                    className="kl-notification-pill mt-3.5 kl-pressable"
                  >
                    <span>{headerAction.label}</span>
                    {headerAction.badge ? (
                      <span className="kl-notification-pill-count">
                        {headerAction.badge}
                      </span>
                    ) : null}
                  </Link>
                ) : null}
              </div>
            </header>
          )}

          {children}
        </div>
      </main>

      <AppNav />
    </>
  );
}
