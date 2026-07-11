/**
 * Supabase public env — never hardcode keys.
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

export function getSupabaseEnvStatus(): SupabaseEnvStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const environment = detectEnvironment();

  const urlPresent = url.length > 0;
  const anonKeyPresent = anonKey.length > 0;

  if (!urlPresent || !anonKeyPresent) {
    return {
      configured: false,
      urlPresent,
      anonKeyPresent,
      urlValid: false,
      environment,
      error:
        "ยังไม่ได้ตั้งค่าการเชื่อมต่อฐานข้อมูล — ใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน .env.local หรือ Vercel",
      values: null,
    };
  }

  let urlValid = false;
  try {
    const parsed = new URL(url);
    urlValid = parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    urlValid = false;
  }

  if (!urlValid) {
    return {
      configured: false,
      urlPresent,
      anonKeyPresent,
      urlValid: false,
      environment,
      error: "NEXT_PUBLIC_SUPABASE_URL รูปแบบไม่ถูกต้อง",
      values: null,
    };
  }

  return {
    configured: true,
    urlPresent,
    anonKeyPresent,
    urlValid: true,
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
