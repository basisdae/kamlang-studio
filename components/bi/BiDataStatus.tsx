"use client";

import Card from "../ui/Card";
import Button from "../ui/Button";
import BiListSkeleton from "./BiListSkeleton";

export type BiDataStatusKind =
  | "loading"
  | "online"
  | "empty"
  | "error"
  | "cached"
  | "unconfigured"
  | "offline";

export type BiDataStatusInput = {
  loading?: boolean;
  ready?: boolean;
  configured?: boolean;
  online?: boolean;
  browserOffline?: boolean;
  error?: string | null;
  /** True when the page has zero rows after a successful online load */
  empty?: boolean;
  /** True when showing local cache because live query failed / offline */
  hasCachedData?: boolean;
};

export function resolveBiDataStatus(input: BiDataStatusInput): BiDataStatusKind {
  const {
    loading = false,
    ready = true,
    configured = true,
    online = false,
    browserOffline = false,
    error = null,
    empty = false,
    hasCachedData = false,
  } = input;

  if (!configured) return "unconfigured";
  if (loading || !ready) return "loading";
  if (browserOffline) return hasCachedData ? "cached" : "offline";
  if (error) return hasCachedData ? "cached" : "error";
  if (online && empty) return "empty";
  if (online) return "online";
  if (hasCachedData) return "cached";
  return "error";
}

const BADGE_LABEL: Record<BiDataStatusKind, string> = {
  loading: "กำลังโหลด",
  online: "ออนไลน์",
  empty: "ไม่มีข้อมูล",
  error: "เกิดข้อผิดพลาด",
  cached: "ใช้ข้อมูลแคช",
  unconfigured: "ยังไม่ตั้งค่า",
  offline: "ออฟไลน์",
};

type Props = BiDataStatusInput & {
  emptyTitle?: string;
  emptyHint?: string;
  /** Shown under the badge — short source line */
  sourceHint?: string;
  onRetry?: () => void;
  /** When loading, show list skeleton instead of text card */
  skeleton?: boolean;
  skeletonRows?: number;
  className?: string;
};

/**
 * Shared data integrity status:
 * Loading · Online · Empty · Error · Cached fallback
 *
 * Never shows "Supabase · Online" when the page query failed.
 */
export default function BiDataStatus({
  emptyTitle = "ยังไม่มีข้อมูล",
  emptyHint,
  sourceHint,
  onRetry,
  skeleton = true,
  skeletonRows = 4,
  className = "",
  ...input
}: Props) {
  const status = resolveBiDataStatus(input);
  const muted =
    status === "loading" ||
    status === "error" ||
    status === "cached" ||
    status === "unconfigured" ||
    status === "offline";

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex min-h-[2rem] items-center rounded-full border px-3 text-[length:var(--kl-type-label-size)] font-medium ${
            muted
              ? "border-[var(--kl-border)] bg-[var(--bi-surface-muted)] text-[var(--bi-text-secondary)]"
              : "border-[var(--bi-lemon)] bg-[rgb(231_246_91/0.35)] text-[var(--bi-text-primary)]"
          }`}
          data-bi-status={status}
          role="status"
        >
          {BADGE_LABEL[status]}
        </span>
      </div>

      {sourceHint ? (
        <p className="kl-type-caption -mt-1">{sourceHint}</p>
      ) : null}

      {status === "loading" && skeleton ? (
        <BiListSkeleton rows={skeletonRows} />
      ) : null}

      {status === "loading" && !skeleton ? (
        <Card className="!p-4">
          <p className="kl-type-card-title">กำลังโหลด...</p>
          <p className="kl-type-helper mt-1">ดึงข้อมูลจากฐานข้อมูล</p>
        </Card>
      ) : null}

      {status === "unconfigured" ? (
        <Card className="space-y-3 !p-4">
          <p className="kl-type-card-title">ยังไม่ได้ตั้งค่าฐานข้อมูล</p>
          <p className="kl-type-helper">
            ใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY
            แล้วรีสตาร์ท / Redeploy
          </p>
          {onRetry ? (
            <Button fullWidth className="min-h-[2.75rem]" onClick={onRetry}>
              ลองใหม่
            </Button>
          ) : null}
        </Card>
      ) : null}

      {status === "offline" ? (
        <Card className="space-y-3 !p-4">
          <p className="kl-type-card-title">ออฟไลน์</p>
          <p className="kl-type-helper">
            ไม่มีการเชื่อมต่ออินเทอร์เน็ต — ลองใหม่เมื่อออนไลน์
          </p>
          {onRetry ? (
            <Button fullWidth className="min-h-[2.75rem]" onClick={onRetry}>
              ลองใหม่
            </Button>
          ) : null}
        </Card>
      ) : null}

      {status === "error" ? (
        <Card className="space-y-3 !p-4">
          <p className="kl-type-card-title">โหลดไม่สำเร็จ</p>
          <p className="kl-type-helper">
            {input.error || "โหลดข้อมูลไม่สำเร็จ — กดลองใหม่"}
          </p>
          {onRetry ? (
            <Button fullWidth className="min-h-[2.75rem]" onClick={onRetry}>
              ลองใหม่
            </Button>
          ) : null}
        </Card>
      ) : null}

      {status === "cached" ? (
        <Card className="space-y-3 !p-4 border border-[var(--bi-lemon)]">
          <p className="kl-type-card-title">โหมดแคชสำรอง</p>
          <p className="kl-type-helper">
            {input.error
              ? "โหลดออนไลน์ไม่สำเร็จ — แสดงแคชในเครื่องชั่วคราว ข้อมูลอาจไม่ตรงกับเครื่องอื่น"
              : "ใช้แคชในเครื่องชั่วคราว — ข้อมูลอาจไม่ตรงกับเครื่องอื่น"}
          </p>
          {onRetry ? (
            <Button fullWidth className="min-h-[2.75rem]" onClick={onRetry}>
              เชื่อมต่อใหม่
            </Button>
          ) : null}
        </Card>
      ) : null}

      {status === "empty" ? (
        <Card className="!p-4">
          <p className="kl-type-card-title">{emptyTitle}</p>
          {emptyHint ? (
            <p className="kl-type-helper mt-1">{emptyHint}</p>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
