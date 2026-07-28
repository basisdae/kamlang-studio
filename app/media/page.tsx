"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Images, Upload } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ButtonLink from "../../components/ui/ButtonLink";
import Dialog from "../../components/ui/Dialog";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../auth/AuthProvider";
import { useWorkspace } from "../providers/WorkspaceProvider";
import { mediaService } from "../../lib/services/mediaService";
import {
  BI_MEDIA_ALLOWED_MIME,
  BI_MEDIA_MAX_BYTES,
  type MediaRecord,
} from "../../lib/media/types";
import { showInfoToast } from "../lib/biInfoToast";
import { biRuntimeError, userFacingMessage } from "../../lib/supabase/errors";

type UploadJob = {
  key: string;
  name: string;
  status: "uploading" | "done" | "error";
  message?: string;
};

function fileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function ownerMediaError(error: unknown): string {
  const raw = userFacingMessage(error);
  const lower = raw.toLowerCase();
  if (
    lower.includes("bucket") ||
    lower.includes("not found") ||
    lower.includes("bi_media") ||
    lower.includes("schema cache") ||
    lower.includes("row-level security") ||
    lower.includes("jwt")
  ) {
    return "อัปโหลดหรือลบไม่สำเร็จ — ตรวจการตั้งค่าที่เก็บไฟล์ หรือเข้าสู่ระบบแล้วลองใหม่";
  }
  return raw;
}

/**
 * Backstore media library — real Supabase Storage uploads (no menu linking yet).
 */
export default function MediaLibraryPage() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, loading: authLoading } = useAuth();
  const { workspaceId, configured } = useWorkspace();

  const [items, setItems] = useState<MediaRecord[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [loadedWorkspaceId, setLoadedWorkspaceId] = useState<string | null>(
    null
  );
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [busyKeys, setBusyKeys] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const canFetch = Boolean(configured && workspaceId);
  const loading = canFetch && loadedWorkspaceId !== workspaceId;
  const canWrite = Boolean(user) && canFetch;
  /** Do not treat “session still hydrating” or “workspace not ready” as logged-out. */
  const authReady = !authLoading;
  const showLoginCta = authReady && !user;
  const showUploadCta = authReady && Boolean(user) && canFetch;
  const showActionLoading =
    authLoading || (Boolean(user) && !canFetch);

  useEffect(() => {
    if (!configured || !workspaceId) return;
    const requestWorkspaceId = workspaceId;
    let cancelled = false;
    void mediaService
      .list(requestWorkspaceId)
      .then((list) => {
        if (cancelled) return;
        setItems(list);
        setListError(null);
        setLoadedWorkspaceId(requestWorkspaceId);
      })
      .catch((e) => {
        if (cancelled) return;
        biRuntimeError("MediaLibraryPage", "list", e);
        setListError(ownerMediaError(e));
        setItems([]);
        setLoadedWorkspaceId(requestWorkspaceId);
      });
    return () => {
      cancelled = true;
    };
  }, [configured, workspaceId, refreshNonce]);

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList?.length || !canWrite || !workspaceId || !user) return;
    if (uploading) return;

    const selected = Array.from(fileList);
    const accepted: File[] = [];
    const nextJobs: UploadJob[] = [];

    for (const file of selected) {
      const key = fileKey(file);
      if (busyKeys.has(key)) continue;
      if (!(BI_MEDIA_ALLOWED_MIME as readonly string[]).includes(file.type)) {
        nextJobs.push({
          key,
          name: file.name,
          status: "error",
          message: "รองรับเฉพาะ JPG, PNG หรือ WebP",
        });
        continue;
      }
      if (file.size <= 0 || file.size > BI_MEDIA_MAX_BYTES) {
        nextJobs.push({
          key,
          name: file.name,
          status: "error",
          message: "ไฟล์ต้องไม่เกิน 5 MB",
        });
        continue;
      }
      accepted.push(file);
      nextJobs.push({ key, name: file.name, status: "uploading" });
    }

    if (nextJobs.length === 0) return;

    setJobs((prev) => [...nextJobs, ...prev].slice(0, 20));
    setBusyKeys((prev) => {
      const next = new Set(prev);
      for (const f of accepted) next.add(fileKey(f));
      return next;
    });
    setUploading(true);

    try {
      for (const file of accepted) {
        const key = fileKey(file);
        try {
          const record = await mediaService.upload(workspaceId, file, {
            createdBy: user.id,
          });
          setItems((prev) => [record, ...prev.filter((p) => p.id !== record.id)]);
          setJobs((prev) =>
            prev.map((j) =>
              j.key === key ? { ...j, status: "done", message: "อัปโหลดแล้ว" } : j
            )
          );
        } catch (e) {
          biRuntimeError("MediaLibraryPage", "upload", e);
          const message = ownerMediaError(e);
          setJobs((prev) =>
            prev.map((j) =>
              j.key === key ? { ...j, status: "error", message } : j
            )
          );
        }
      }
    } finally {
      setUploading(false);
      setBusyKeys((prev) => {
        const next = new Set(prev);
        for (const f of accepted) next.delete(fileKey(f));
        return next;
      });
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget || !workspaceId || !canWrite || deleting) return;
    setDeleting(true);
    const target = deleteTarget;
    try {
      await mediaService.remove(target.id, workspaceId);
      setItems((prev) => prev.filter((p) => p.id !== target.id));
      setDeleteTarget(null);
      showInfoToast("ลบรูปแล้ว");
    } catch (e) {
      biRuntimeError("MediaLibraryPage", "remove", e);
      showInfoToast(ownerMediaError(e));
    } finally {
      setDeleting(false);
    }
  }

  const visibleItems =
    canFetch && loadedWorkspaceId === workspaceId ? items : [];
  const visibleError =
    canFetch && loadedWorkspaceId === workspaceId ? listError : null;
  const isEmpty = !loading && !visibleError && visibleItems.length === 0;

  return (
    <AppShell title="คลังรูปภาพ">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="kl-type-helper text-kl-muted">
            เก็บรูปสินค้าและสื่อสำหรับเมนู
          </p>
          {showActionLoading ? (
            <Button
              type="button"
              size="sm"
              disabled
              className="min-h-[44px]"
            >
              กำลังตรวจสิทธิ์…
            </Button>
          ) : showUploadCta ? (
            <>
              <input
                id={inputId}
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                className="sr-only"
                disabled={uploading}
                onChange={(e) => void handleFilesSelected(e.target.files)}
              />
              <Button
                type="button"
                size="sm"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="min-h-[44px]"
              >
                <Upload className="kl-icon-sm mr-1.5" aria-hidden />
                {uploading ? "กำลังอัปโหลด…" : "อัปโหลดรูป"}
              </Button>
            </>
          ) : showLoginCta ? (
            <ButtonLink
              href="/login?next=%2Fmedia"
              variant="secondary"
              size="sm"
              className="min-h-[44px]"
            >
              เข้าสู่ระบบ
            </ButtonLink>
          ) : null}
        </div>

        {showLoginCta ? (
          <Card className="!p-3">
            <p className="kl-type-helper">
              เข้าสู่ระบบเพื่ออัปโหลดหรือลบรูปในคลัง
            </p>
          </Card>
        ) : null}

        {jobs.length > 0 ? (
          <Card className="!p-3 space-y-1.5">
            {jobs.slice(0, 8).map((job) => (
              <p key={job.key} className="kl-type-caption">
                <span className="text-kl-muted">{job.name}</span>
                {" · "}
                {job.status === "uploading"
                  ? "กำลังอัปโหลด…"
                  : job.status === "done"
                    ? "สำเร็จ"
                    : job.message ?? "ไม่สำเร็จ"}
              </p>
            ))}
          </Card>
        ) : null}

        {loading ? (
          <Card className="!p-4">
            <p className="kl-type-helper">กำลังโหลดคลังรูป…</p>
          </Card>
        ) : null}

        {!loading && visibleError ? (
          <Card className="!p-4 space-y-2">
            <p className="kl-type-helper">{visibleError}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setLoadedWorkspaceId(null);
                setRefreshNonce((n) => n + 1);
              }}
            >
              ลองใหม่
            </Button>
          </Card>
        ) : null}

        {isEmpty ? (
          <EmptyState
            icon={Images}
            title="ยังไม่มีรูปในคลัง"
            hint={
              canWrite
                ? "กด “อัปโหลดรูป” เพื่อเพิ่มรูปสินค้าหรือสื่อสำหรับเมนู"
                : "เข้าสู่ระบบแล้วกดอัปโหลดรูปเพื่อเริ่มเก็บสื่อ"
            }
            actionLabel={canWrite ? "อัปโหลดรูป" : undefined}
            onAction={
              canWrite
                ? () => {
                    inputRef.current?.click();
                  }
                : undefined
            }
          />
        ) : null}

        {!loading && !visibleError && visibleItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {visibleItems.map((item) => (
              <Card key={item.id} className="!p-2 space-y-2 overflow-hidden">
                <div className="aspect-square overflow-hidden rounded-[var(--kl-radius-inner)] bg-kl-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.publicUrl}
                    alt={item.fileName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 space-y-0.5 px-0.5">
                  <p className="kl-type-caption truncate" title={item.fileName}>
                    {item.fileName}
                  </p>
                  <p className="kl-type-caption text-kl-muted">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                {canWrite ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    fullWidth
                    disabled={deleting}
                    onClick={() => setDeleteTarget(item)}
                  >
                    ลบ
                  </Button>
                ) : null}
              </Card>
            ))}
          </div>
        ) : null}
      </div>

      {deleteTarget ? (
        <Dialog
          open
          onClose={() => {
            if (deleting) return;
            setDeleteTarget(null);
          }}
          title="ลบรูปออกจากคลัง?"
          role="alertdialog"
        >
          <p className="kl-type-body">
            ลบ “{deleteTarget.fileName}”? รูปจะหายจากคลังและที่เก็บไฟล์
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              fullWidth
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
            >
              ยกเลิก
            </Button>
            <Button
              fullWidth
              disabled={deleting}
              onClick={() => void handleDeleteConfirm()}
            >
              {deleting ? "กำลังลบ…" : "ลบรูป"}
            </Button>
          </div>
        </Dialog>
      ) : null}
    </AppShell>
  );
}
