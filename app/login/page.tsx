"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "../../components/layout/AppShell";
import PageHeader from "../../components/bi/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import { WORKSPACE_NAME } from "../../data/seed/tangtao";
import { useAuth } from "../auth/AuthProvider";

const DEFAULT_AFTER_LOGIN = "/opening/assets";

/** Same-origin relative path only — blocks open redirects. */
function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return DEFAULT_AFTER_LOGIN;
  }
  return raw;
}

function LoginFallback() {
  return (
    <AppShell title="" hidePageHeader compact backHref="/">
      <Card className="!p-4">
        <p className="kl-type-helper">กำลังโหลด…</p>
      </Card>
    </AppShell>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const {
    configured,
    user,
    signInWithMagicLink,
    signInWithPassword,
    loading,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    router.replace(nextPath);
  }, [loading, user, nextPath, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (mode === "magic") {
        const err = await signInWithMagicLink(email.trim(), { next: nextPath });
        if (err) setError(err);
        else
          setMessage(
            "ส่งลิงก์เข้าสู่ระบบไปที่อีเมลแล้ว — เปิดจากมือถือเครื่องนี้"
          );
      } else {
        const err = await signInWithPassword(email.trim(), password);
        if (err) setError(err);
        else router.replace(nextPath);
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading || user) {
    return (
      <AppShell title="" hidePageHeader compact backHref="/">
        <Card className="!p-4">
          <p className="kl-type-helper">กำลังเข้าสู่ระบบ…</p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="" hidePageHeader compact backHref="/">
      <PageHeader
        title="Business Insight"
        workspace={WORKSPACE_NAME}
        subtitle="เข้าสู่ระบบ"
      />

      {!configured ? (
        <Card className="space-y-2 !p-4">
          <p className="kl-type-card-title">ยังไม่ต่อ Supabase</p>
          <p className="kl-type-helper">
            ใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน
            .env.local แล้วรีสตาร์ท dev server
          </p>
          <Button fullWidth onClick={() => router.push("/dev/supabase-check")}>
            ไปหน้าตรวจการเชื่อมต่อ
          </Button>
        </Card>
      ) : (
        <Card className="space-y-4">
          <div className="space-y-1.5">
            <p className="kl-type-card-title">บัญชีเจ้าของครั้งแรก</p>
            <p className="kl-type-helper">
              ระบบยังไม่เปิดสมัครสาธารณะ — สร้างผู้ใช้ใน Supabase Dashboard
              (Authentication → Users → Add user) ด้วยอีเมลจริงของคุณ แล้วตั้งรหัสผ่าน
              จากนั้นกลับมาล็อกอินที่นี่
            </p>
            <p className="kl-type-caption text-kl-muted">
              ชื่อบนหน้าเว็บหลังล็อกอินมาจากอีเมล Auth จริง ไม่ใช่รายชื่อทีมตัวอย่าง
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={mode === "magic" ? "primary" : "secondary"}
              fullWidth
              onClick={() => setMode("magic")}
            >
              Magic link
            </Button>
            <Button
              variant={mode === "password" ? "primary" : "secondary"}
              fullWidth
              onClick={() => setMode("password")}
            >
              อีเมล/รหัสผ่าน
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <FormField label="อีเมล">
              <input
                className="mt-1.5 w-full min-h-[2.75rem] rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </FormField>
            {mode === "password" ? (
              <FormField label="รหัสผ่าน">
                <input
                  className="mt-1.5 w-full min-h-[2.75rem] rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </FormField>
            ) : null}
            {error ? (
              <p className="kl-type-caption text-kl-danger-text">{error}</p>
            ) : null}
            {message ? <p className="kl-type-helper">{message}</p> : null}
            <Button
              type="submit"
              fullWidth
              className="min-h-[2.75rem]"
              disabled={busy || loading}
            >
              {mode === "magic" ? "ส่งลิงก์เข้าสู่ระบบ" : "เข้าสู่ระบบ"}
            </Button>
          </form>
        </Card>
      )}
    </AppShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
