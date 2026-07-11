/**
 * Supabase public env — never hardcode keys.
 * Normalizes Project URL (strip /rest/v1, trailing slash).
 */

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export type SupabaseEnvStatus = {
  configured: boolean;
  urlPresent: boolean;
  anonKeyPresent: boolean;
  urlValid: boolean;
  urlNormalized: boolean;
  environment: "development" | "production" | "test" | "unknown";
  error: string | null;
  values: SupabasePublicEnv | null;
};

function detectEnvironment(): SupabaseEnvStatus["environment"] {
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === "development") return "development";
  if (nodeEnv === "production") return "production";
  if (nodeEnv === "test") return "test";
  return "unknown";
}

/**
 * Project URL only — never include /rest/v1 (causes "Invalid path specified").
 */
export function normalizeSupabaseUrl(raw: string): {
  url: string;
  changed: boolean;
} {
  let url = raw.trim();
  if (!url) return { url: "", changed: false };

  const before = url;
  // Common mispaste from API docs / PostgREST
  url = url.replace(/\/rest\/v1\/?$/i, "");
  url = url.replace(/\/+$/, "");
  // Drop accidental path after host (keep origin only)
  try {
    const parsed = new URL(url);
    if (parsed.pathname && parsed.pathname !== "/") {
      url = `${parsed.protocol}//${parsed.host}`;
    }
  } catch {
    /* keep stripped string for validation below */
  }

  return { url, changed: url !== before };
}

export function getSupabaseEnvStatus(): SupabaseEnvStatus {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const environment = detectEnvironment();

  const urlPresent = rawUrl.length > 0;
  const anonKeyPresent = anonKey.length > 0;

  if (!urlPresent || !anonKeyPresent) {
    return {
      configured: false,
      urlPresent,
      anonKeyPresent,
      urlValid: false,
      urlNormalized: false,
      environment,
      error:
        "ยังไม่ได้ตั้งค่าการเชื่อมต่อฐานข้อมูล — ใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน .env.local หรือ Vercel",
      values: null,
    };
  }

  const { url, changed } = normalizeSupabaseUrl(rawUrl);

  let urlValid = false;
  try {
    const parsed = new URL(url);
    urlValid =
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      Boolean(parsed.host);
  } catch {
    urlValid = false;
  }

  if (!urlValid) {
    return {
      configured: false,
      urlPresent,
      anonKeyPresent,
      urlValid: false,
      urlNormalized: changed,
      environment,
      error:
        "ที่อยู่ฐานข้อมูลไม่ถูกต้อง — ใช้รูปแบบ https://xxxx.supabase.co (ห้ามใส่ /rest/v1)",
      values: null,
    };
  }

  return {
    configured: true,
    urlPresent,
    anonKeyPresent,
    urlValid: true,
    urlNormalized: changed,
    environment,
    error: null,
    values: { url, anonKey },
  };
}

export function requireSupabaseEnv(): SupabasePublicEnv {
  const status = getSupabaseEnvStatus();
  if (!status.values) {
    throw new Error(status.error ?? "Supabase env ไม่พร้อม");
  }
  return status.values;
}
