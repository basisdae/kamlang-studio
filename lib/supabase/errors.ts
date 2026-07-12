/**
 * Normalized Business Insight errors — UI never sees raw Supabase errors.
 */

export type BiErrorCode =
  | "config"
  | "not_found"
  | "permission"
  | "network"
  | "validation"
  | "unknown";

export class BiError extends Error {
  readonly code: BiErrorCode;
  readonly details: string | null;

  constructor(code: BiErrorCode, message: string, details: string | null = null) {
    super(message);
    this.name = "BiError";
    this.code = code;
    this.details = details;
  }
}

export function configError(message = "ยังไม่ได้ตั้งค่าการเชื่อมต่อฐานข้อมูล"): BiError {
  return new BiError(
    "config",
    message,
    "ใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export function validationError(message: string): BiError {
  return new BiError("validation", message);
}

export function notFoundError(entity: string): BiError {
  return new BiError("not_found", `ไม่พบ${entity}`);
}

type PostgrestLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

export function normalizeError(error: unknown): BiError {
  if (error instanceof BiError) return error;

  if (typeof error === "object" && error !== null) {
    const e = error as PostgrestLike;
    const msg = e.message ?? "เกิดข้อผิดพลาด";
    const code = e.code ?? "";
    const lower = msg.toLowerCase();

    if (
      lower.includes("invalid path specified") ||
      lower.includes("invalid path")
    ) {
      return new BiError(
        "config",
        "ที่อยู่ฐานข้อมูลไม่ถูกต้อง — ตรวจ NEXT_PUBLIC_SUPABASE_URL บน Vercel ต้องเป็น https://xxxx.supabase.co โดยไม่มี /rest/v1",
        msg
      );
    }

    if (
      lower.includes("fetch") ||
      lower.includes("network") ||
      lower.includes("failed to fetch")
    ) {
      return new BiError("network", "เชื่อมต่อฐานข้อมูลไม่ได้", msg);
    }

    if (code === "PGRST116" || lower.includes("0 rows")) {
      return new BiError("not_found", "ไม่พบข้อมูล", msg);
    }

    if (
      code === "42501" ||
      lower.includes("permission") ||
      lower.includes("row-level security") ||
      lower.includes("rls")
    ) {
      return new BiError(
        "permission",
        "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
        msg
      );
    }

    return new BiError("unknown", msg, e.details ?? e.hint ?? null);
  }

  if (error instanceof Error) {
    const lower = error.message.toLowerCase();
    if (lower.includes("invalid path specified") || lower.includes("invalid path")) {
      return new BiError(
        "config",
        "ที่อยู่ฐานข้อมูลไม่ถูกต้อง — ตรวจ NEXT_PUBLIC_SUPABASE_URL บน Vercel ต้องเป็น https://xxxx.supabase.co โดยไม่มี /rest/v1",
        error.message
      );
    }
    return new BiError("unknown", error.message);
  }

  return new BiError("unknown", "เกิดข้อผิดพลาดไม่ทราบสาเหตุ");
}

export function userFacingMessage(error: unknown): string {
  const bi = normalizeError(error);
  if (bi.code === "config") return bi.message;
  if (bi.code === "network") return "เชื่อมต่อฐานข้อมูลไม่ได้ — ตรวจเน็ตแล้วกดลองใหม่";
  if (bi.code === "permission") return "ยังไม่มีสิทธิ์เขียนข้อมูล (ตรวจ RLS / preview policy)";
  if (bi.code === "not_found") return bi.message;
  if (bi.code === "validation") return bi.message;
  // Production UI: avoid dumping raw technical strings when possible
  if (
    bi.message.toLowerCase().includes("invalid path") ||
    bi.message.toLowerCase().includes("postgrest")
  ) {
    return "โหลดข้อมูลไม่สำเร็จ — กดลองใหม่ หรือตรวจการตั้งค่าฐานข้อมูล";
  }
  return bi.message || "โหลดหรือบันทึกไม่สำเร็จ";
}

/** Development-only diagnostics — never logs keys. */
export function biDevError(page: string, query: string, error: unknown) {
  biRuntimeError(page, query, error);
}

/**
 * Safe runtime diagnostics (browser + server).
 * Logs table/query, status/code, message — never URL keys or anon key.
 */
export function biRuntimeError(
  page: string,
  query: string,
  error: unknown,
  extra?: { table?: string; httpStatus?: number | string | null }
) {
  const bi = normalizeError(error);
  const payload: Record<string, string | number | null> = {
    page,
    query,
    code: bi.code,
    message: bi.message,
  };
  if (extra?.table) payload.table = extra.table;
  if (extra?.httpStatus != null && extra.httpStatus !== "") {
    payload.status = String(extra.httpStatus);
  }
  if (bi.details) payload.details = bi.details.slice(0, 240);
  console.error("[BI]", payload);
}
