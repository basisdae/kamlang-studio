"use client";

import Card from "../ui/Card";
import Button from "../ui/Button";

type Props = {
  loading?: boolean;
  configured?: boolean;
  online?: boolean;
  browserOffline?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
  onRetry?: () => void;
};

/**
 * Shared Loading / Empty / Offline / Error / Retry for BI online pages.
 */
export default function BiConnectionBanner({
  loading,
  configured = true,
  online = true,
  browserOffline,
  error,
  empty,
  emptyTitle = "ยังไม่มีข้อมูล",
  emptyHint,
  onRetry,
}: Props) {
  if (loading) {
    return (
      <Card className="!p-4">
        <p className="kl-type-card-title">กำลังโหลด...</p>
        <p className="kl-type-helper mt-1">ดึงข้อมูลจาก Supabase</p>
      </Card>
    );
  }

  if (!configured) {
    return (
      <Card className="space-y-3 !p-4">
        <p className="kl-type-card-title">ยังไม่ได้ตั้งค่า Supabase</p>
        <p className="kl-type-helper">
          ใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน
          .env.local หรือ Vercel แล้วรีสตาร์ทแอป
        </p>
        {onRetry ? (
          <Button fullWidth className="min-h-[2.75rem]" onClick={onRetry}>
            ลองใหม่
          </Button>
        ) : null}
      </Card>
    );
  }

  if (browserOffline) {
    return (
      <Card className="space-y-3 !p-4">
        <p className="kl-type-card-title">ออฟไลน์</p>
        <p className="kl-type-helper">
          ไม่มีการเชื่อมต่ออินเทอร์เน็ต — แสดงแคชชั่วคราว (ถ้ามี)
        </p>
        {onRetry ? (
          <Button fullWidth className="min-h-[2.75rem]" onClick={onRetry}>
            ลองใหม่
          </Button>
        ) : null}
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="space-y-3 !p-4">
        <p className="kl-type-card-title">โหลดไม่สำเร็จ</p>
        <p className="kl-type-helper">{error}</p>
        {onRetry ? (
          <Button fullWidth className="min-h-[2.75rem]" onClick={onRetry}>
            ลองใหม่
          </Button>
        ) : null}
      </Card>
    );
  }

  if (!online) {
    return (
      <Card className="space-y-3 !p-4">
        <p className="kl-type-card-title">โหมดสำรอง</p>
        <p className="kl-type-helper">
          ใช้แคชในเครื่องชั่วคราว — ข้อมูลอาจไม่ตรงกับเครื่องอื่น
        </p>
        {onRetry ? (
          <Button fullWidth className="min-h-[2.75rem]" onClick={onRetry}>
            เชื่อมต่อใหม่
          </Button>
        ) : null}
      </Card>
    );
  }

  if (empty) {
    return (
      <Card className="!p-4">
        <p className="kl-type-card-title">{emptyTitle}</p>
        {emptyHint ? (
          <p className="kl-type-helper mt-1">{emptyHint}</p>
        ) : null}
      </Card>
    );
  }

  return null;
}
