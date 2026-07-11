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

    if (
      msg.toLowerCase().includes("fetch") ||
      msg.toLowerCase().includes("network") ||
      msg.toLowerCase().includes("failed to fetch")
    ) {
      return new BiError("network", "เชื่อมต่อฐานข้อมูลไม่ได้", msg);
    }

    if (code === "PGRST116" || msg.toLowerCase().includes("0 rows")) {
      return new BiError("not_found", "ไม่พบข้อมูล", msg);
    }

    if (
      code === "42501" ||
      msg.toLowerCase().includes("permission") ||
      msg.toLowerCase().includes("row-level security") ||
      msg.toLowerCase().includes("rls")
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
  return bi.message || "โหลดหรือบันทึกไม่สำเร็จ";
}
