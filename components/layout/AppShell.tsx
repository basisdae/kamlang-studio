import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import AppNav from "./AppNav";
import DesktopSidebar from "./DesktopSidebar";
import IconButtonLink from "../ui/IconButtonLink";
import WorkspaceSwitcher from "../workspaces/WorkspaceSwitcher";
import WorkspaceChrome from "../workspaces/WorkspaceChrome";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "./navConfig";

type AppShellProps = {
  title: string;
  description?: string;
  hidePageHeader?: boolean;
  compact?: boolean;
  /**
   * @deprecated Mobile First — content stays ~390px on all breakpoints.
   * Desktop only adds sidebar; never widen into a dashboard.
   */
  wide?: boolean;
  headerAction?: {
    href: string;
    label: string;
    badge?: number;
  };
  children: React.ReactNode;
  backHref?: string;
};

/**
 * Mobile First app shell.
 * Design canvas ≈ 390px. Desktop = same column + sidebar (layout expand only).
 * Do not change primary CTA order or flow per breakpoint.
 */
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
  const contentGap = compact ? "space-y-3" : "space-y-5";

  return (
    <div className="kl-shell md:flex">
      <WorkspaceChrome>
        <DesktopSidebar />
      </WorkspaceChrome>

      <div className="kl-shell-main">
        <main
          className={`kl-page-above-nav min-h-screen overflow-x-hidden bg-kl-ivory px-4 text-kl-brown sm:px-5 ${mainPadding}`}
        >
          <div
            className={`mx-auto w-full min-w-0 max-w-[var(--bi-app-width)] ${contentGap}`}
          >
            {hidePageHeader ? (
              <>
                <div className="flex items-center gap-2">
                  {backHref ? (
                    <IconButtonLink href={backHref} aria-label="กลับ">
                      <ChevronLeft
                        className={KL_ICON_CLASS}
                        strokeWidth={KL_ICON_STROKE}
                      />
                    </IconButtonLink>
                  ) : (
                    <span className="min-w-0 flex-1" />
                  )}
                  <div className="ml-auto min-w-0 shrink">
                    <WorkspaceSwitcher />
                  </div>
                </div>
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
                {backHref ? (
                  <IconButtonLink href={backHref} aria-label="กลับ">
                    <ChevronLeft
                      className={KL_ICON_CLASS}
                      strokeWidth={KL_ICON_STROKE}
                    />
                  </IconButtonLink>
                ) : null}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <h1 className="min-w-0 flex-1 kl-type-page-title">
                      {title}
                    </h1>
                    <div className="shrink-0 pt-0.5">
                      <WorkspaceSwitcher />
                    </div>
                  </div>
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

        <WorkspaceChrome>
          <AppNav />
        </WorkspaceChrome>
      </div>
    </div>
  );
}
