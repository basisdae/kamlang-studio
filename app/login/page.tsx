"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../components/layout/AppShell";
import PageHeader from "../../components/bi/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import { WORKSPACE_NAME } from "../../data/seed/tangtao";
import { useAuth } from "../auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { configured, signInWithMagicLink, signInWithPassword, loading } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (mode === "magic") {
        const err = await signInWithMagicLink(email.trim());
        if (err) setError(err);
        else setMessage("ส่งลิงก์เข้าสู่ระบบไปที่อีเมลแล้ว — เปิดจากมือถือเครื่องนี้");
      } else {
        const err = await signInWithPassword(email.trim(), password);
        if (err) setError(err);
        else router.replace("/opening/assets");
      }
    } finally {
      setBusy(false);
    }
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
          <p className="kl-type-helper">
            สมาชิกตั้งเตา: เดย์ · ครีม · เก็ต · เหมียว — สิทธิ์เท่ากันในช่วงแรก
          </p>
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
