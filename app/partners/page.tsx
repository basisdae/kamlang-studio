"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Handshake } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import PartnerCard from "../../components/bi/PartnerCard";
import PartnerFormDialog from "../../components/bi/PartnerFormDialog";
import BiDataStatus from "../../components/bi/BiDataStatus";
import SectionHeader from "../../components/bi/SectionHeader";
import SummaryCard from "../../components/bi/SummaryCard";
import WorkspaceLandingHeader from "../../components/workspaces/WorkspaceLandingHeader";
import EmptyState from "../../components/ui/EmptyState";
import SearchBar from "../../components/ui/SearchBar";
import SegmentChip from "../../components/ui/SegmentChip";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import Card from "../../components/ui/Card";
import { useWorkspace } from "../providers/WorkspaceProvider";
import { partnerService } from "../../lib/services/partnerService";
import {
  buildPartnersSummary,
  type PartnerWriteInput,
} from "../../lib/partners/partnerCore";
import {
  PARTNER_CATEGORIES,
  PARTNER_CATEGORY_LABELS,
  PARTNER_STATUS_LABELS,
  partnerCategoryLabel,
  type PartnerCategory,
  type PartnerRecord,
} from "../../lib/partners/types";
import {
  PARTNERS_MODULE_ENABLED,
  partnersDevLog,
} from "../../lib/partners/feature";
import { showInfoToast } from "../lib/biInfoToast";
import { biRuntimeError, userFacingMessage } from "../../lib/supabase/errors";

type CategoryFilter = "all" | PartnerCategory;
type StatusFilter = "all" | "active" | "pending" | "paused";

/** Owner-facing copy only — technical detail stays in console. */
function ownerErrorMessage(error: unknown): string {
  const raw = userFacingMessage(error);
  const lower = raw.toLowerCase();
  if (
    lower.includes("supabase") ||
    lower.includes("rls") ||
    lower.includes("bi_") ||
    lower.includes("shared core") ||
    lower.includes("postgrest") ||
    lower.includes("schema cache")
  ) {
    return "โหลดหรือบันทึกไม่สำเร็จ — ลองใหม่";
  }
  return raw;
}

/**
 * Partners route — when feature flag is off, leave the surface immediately.
 */
export default function PartnersPage() {
  const router = useRouter();

  useEffect(() => {
    if (!PARTNERS_MODULE_ENABLED) {
      router.replace("/home");
    }
  }, [router]);

  if (!PARTNERS_MODULE_ENABLED) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-[var(--bi-app-width)] items-center justify-center px-4">
        <p className="kl-type-caption text-kl-muted">กำลังกลับ…</p>
      </div>
    );
  }

  return <PartnersPageLive />;
}

function PartnersPageLive() {
  const {
    workspaceId,
    configured,
    browserOffline,
    online,
    ready: workspaceReady,
    error: workspaceError,
    retry: retryWs,
  } = useWorkspace();

  const [rows, setRows] = useState<PartnerRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  /** Workspace id whose list/error currently match `rows` / `error`. */
  const [loadedWorkspaceId, setLoadedWorkspaceId] = useState<string | null>(
    null
  );
  /** True only while a user-triggered reload is in flight (event handlers). */
  const [fetching, setFetching] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<PartnerRecord | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<PartnerRecord | null>(
    null
  );

  const canFetch = Boolean(configured && workspaceId);
  const loading =
    canFetch && (fetching || loadedWorkspaceId !== workspaceId);
  const visibleRows = useMemo(
    () =>
      canFetch && loadedWorkspaceId === workspaceId ? rows : [],
    [canFetch, loadedWorkspaceId, workspaceId, rows]
  );
  const visibleError =
    canFetch && loadedWorkspaceId === workspaceId ? error : null;

  const reload = useCallback(async () => {
    if (!configured || !workspaceId) {
      return;
    }
    setFetching(true);
    setError(null);
    try {
      const list = await partnerService.list(workspaceId);
      setRows(list);
      setLoadedWorkspaceId(workspaceId);
    } catch (e) {
      biRuntimeError("PartnersPage", "list", e);
      partnersDevLog("list failed", e);
      setError(ownerErrorMessage(e));
      setRows([]);
      setLoadedWorkspaceId(workspaceId);
    } finally {
      setFetching(false);
    }
  }, [configured, workspaceId]);

  // Hydrate from service when workspace is ready — setState only after await.
  useEffect(() => {
    if (!configured || !workspaceId) {
      return;
    }
    const requestWorkspaceId = workspaceId;
    let cancelled = false;
    void partnerService
      .list(requestWorkspaceId)
      .then((list) => {
        if (cancelled) return;
        setRows(list);
        setError(null);
        setLoadedWorkspaceId(requestWorkspaceId);
      })
      .catch((e) => {
        if (cancelled) return;
        biRuntimeError("PartnersPage", "list", e);
        partnersDevLog("list failed", e);
        setError(ownerErrorMessage(e));
        setRows([]);
        setLoadedWorkspaceId(requestWorkspaceId);
      });
    return () => {
      cancelled = true;
    };
  }, [configured, workspaceId]);

  const summary = useMemo(
    () => buildPartnersSummary(visibleRows),
    [visibleRows]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleRows.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      const hay =
        `${p.name} ${partnerCategoryLabel(p.category)} ${p.phone} ${p.notes}`.toLowerCase();
      return hay.includes(q);
    });
  }, [visibleRows, query, categoryFilter, statusFilter]);

  const categoryMetrics = Object.entries(summary.byCategory).sort((a, b) =>
    a[0].localeCompare(b[0], "th")
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(partner: PartnerRecord) {
    setDetail(null);
    setEditing(partner);
    setFormOpen(true);
  }

  function resetFilters() {
    setQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  }

  async function handleSave(input: PartnerWriteInput) {
    if (!workspaceId) return;
    setSaving(true);
    try {
      if (editing) {
        await partnerService.update(editing.id, workspaceId, input);
        showInfoToast("บันทึก Partner แล้ว");
      } else {
        await partnerService.create(workspaceId, input);
        showInfoToast("เพิ่ม Partner แล้ว");
      }
      setFormOpen(false);
      setEditing(null);
      await reload();
    } catch (e) {
      biRuntimeError("PartnersPage", "save", e);
      partnersDevLog("save failed", e);
      showInfoToast(ownerErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleArchiveConfirm() {
    if (!archiveTarget || !workspaceId) return;
    setSaving(true);
    try {
      await partnerService.archive(archiveTarget.id, workspaceId);
      showInfoToast("Archive แล้ว");
      setArchiveTarget(null);
      setDetail(null);
      await reload();
    } catch (e) {
      biRuntimeError("PartnersPage", "archive", e);
      partnersDevLog("archive failed", e);
      showInfoToast(ownerErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  const connectionIssue = !configured || browserOffline;
  const isEmpty = !loading && !visibleError && visibleRows.length === 0;
  /** Show CTA only when create can actually open a working form path */
  const showAddCta =
    configured && !browserOffline && !visibleError && !loading;

  return (
    <AppShell title="" hidePageHeader compact>
      <WorkspaceLandingHeader
        title="Partners"
        description="คนและองค์กรรอบร้าน"
      />

      {connectionIssue || workspaceError ? (
        <BiDataStatus
          loading={!workspaceReady}
          ready={workspaceReady}
          configured={configured}
          online={online}
          browserOffline={browserOffline}
          error={workspaceError}
          skeleton={false}
          onRetry={() => {
            void retryWs();
            void reload();
          }}
        />
      ) : null}

      {!loading && visibleError ? (
        <Card className="!p-4 space-y-2">
          <p className="kl-type-helper">{visibleError}</p>
          <Button type="button" variant="secondary" size="sm" onClick={() => void reload()}>
            ลองใหม่
          </Button>
        </Card>
      ) : null}

      <SummaryCard title="สรุป">
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Partner ทั้งหมด" value={`${summary.total}`} />
          <Metric label="Active" value={`${summary.active}`} />
          {categoryMetrics.map(([label, count]) => (
            <Metric key={label} label={label} value={`${count}`} />
          ))}
        </div>
      </SummaryCard>

      {!isEmpty && !loading && !visibleError ? (
        <div className="space-y-2">
          <SearchBar
            placeholder="ค้นหาชื่อ ประเภท เบอร์…"
            value={query}
            onChange={setQuery}
          />
          <div className="flex flex-wrap gap-1.5">
            <SegmentChip
              label="ทุกประเภท"
              active={categoryFilter === "all"}
              onClick={() => setCategoryFilter("all")}
            />
            {PARTNER_CATEGORIES.map((c) => (
              <SegmentChip
                key={c}
                label={PARTNER_CATEGORY_LABELS[c]}
                active={categoryFilter === c}
                onClick={() => setCategoryFilter(c)}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["all", "ทุกสถานะ"],
                ["active", "Active"],
                ["pending", "รอยืนยัน"],
                ["paused", "พักไว้"],
              ] as const
            ).map(([id, label]) => (
              <SegmentChip
                key={id}
                label={label}
                active={statusFilter === id}
                onClick={() => setStatusFilter(id)}
              />
            ))}
            <Button type="button" variant="text" size="sm" onClick={resetFilters}>
              ล้างตัวกรอง
            </Button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <Card className="!p-4">
          <p className="kl-type-helper">กำลังโหลด…</p>
        </Card>
      ) : null}

      {isEmpty ? (
        <EmptyState
          icon={Handshake}
          title="ยังไม่มี Partner"
          actionLabel={showAddCta ? "เพิ่ม Partner" : undefined}
          onAction={showAddCta ? openCreate : undefined}
        />
      ) : null}

      {!loading && !visibleError && !isEmpty ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <SectionHeader title="รายชื่อ" />
            {showAddCta ? (
              <Button type="button" size="sm" onClick={openCreate}>
                เพิ่ม Partner
              </Button>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <Card className="!p-4">
              <p className="kl-type-helper">
                ไม่พบรายการตามค้นหา/ตัวกรอง —{" "}
                <button
                  type="button"
                  className="underline text-[var(--bi-text-primary)]"
                  onClick={resetFilters}
                >
                  ล้างตัวกรอง
                </button>
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((partner) => (
                <PartnerCard
                  key={partner.id}
                  partner={partner}
                  onEdit={() => openEdit(partner)}
                  onArchive={() => setArchiveTarget(partner)}
                  onOpenDetail={() => setDetail(partner)}
                />
              ))}
            </div>
          )}
        </>
      ) : null}

      <PartnerFormDialog
        open={formOpen}
        initial={editing}
        saving={saving}
        onClose={() => {
          if (saving) return;
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      {detail ? (
        <Dialog open onClose={() => setDetail(null)} title={detail.name}>
          <div className="space-y-3">
            <p className="kl-type-helper">
              {partnerCategoryLabel(detail.category)} ·{" "}
              {PARTNER_STATUS_LABELS[detail.status]}
            </p>
            {detail.phone ? (
              <p className="kl-type-body">เบอร์: {detail.phone}</p>
            ) : null}
            {detail.notes ? (
              <p className="kl-type-body text-kl-muted">{detail.notes}</p>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => openEdit(detail)}
              >
                แก้ไข
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setArchiveTarget(detail)}
              >
                Archive
              </Button>
            </div>
            <Button variant="text" fullWidth onClick={() => setDetail(null)}>
              ปิด
            </Button>
          </div>
        </Dialog>
      ) : null}

      {archiveTarget ? (
        <Dialog
          open
          onClose={() => {
            if (saving) return;
            setArchiveTarget(null);
          }}
          title="Archive Partner?"
          role="alertdialog"
        >
          <p className="kl-type-body">
            Archive “{archiveTarget.name}”? รายการจะหายจากรายชื่อ (ไม่ลบถาวร)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              fullWidth
              disabled={saving}
              onClick={() => setArchiveTarget(null)}
            >
              ยกเลิก
            </Button>
            <Button
              fullWidth
              disabled={saving}
              onClick={() => void handleArchiveConfirm()}
            >
              {saving ? "กำลังบันทึก…" : "Archive"}
            </Button>
          </div>
        </Dialog>
      ) : null}
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-2 text-center">
      <p className="kl-type-caption text-kl-muted">{label}</p>
      <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
        {value}
      </p>
    </div>
  );
}
