"use client";

import { useState } from "react";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import type { ImportResult } from "../lib/excelImport";
import {
  commitImportWrite,
  detectImportConflicts,
  type ConflictResolution,
  type ImportWriteSummary,
} from "../lib/importWriteService";
import ImportConflictSheet from "./components/ImportConflictSheet";
import ImportResultPanel from "./components/ImportResultPanel";
import ImportResultPanelSkeleton from "../../components/ui/skeletons/ImportResultPanelSkeleton";
import ImportSuccessSummary from "./components/ImportSuccessSummary";
import ImportTypePicker from "./components/ImportTypePicker";
import ImportUploadCard from "./components/ImportUploadCard";
import type { ImportUiType } from "./types";
import { runImportParser } from "./utils";

type NamedRecord = { id: string; name: string };

function getNamedRecords(result: ImportResult<unknown>): NamedRecord[] {
  return result.records as NamedRecord[];
}

export default function ImportPage() {
  const [importType, setImportType] = useState<ImportUiType>("ingredients");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult<unknown> | null>(null);
  const [conflicts, setConflicts] = useState<
    ReturnType<typeof detectImportConflicts> | null
  >(null);
  const [resolution, setResolution] = useState<ConflictResolution>("skip");
  const [writeSummary, setWriteSummary] = useState<ImportWriteSummary | null>(
    null
  );

  async function handleFileSelect(file: File) {
    setIsParsing(true);
    setParseError(null);
    setResult(null);
    setWriteSummary(null);
    setConflicts(null);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const nextResult = runImportParser(importType, buffer);
      setResult(nextResult);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ไม่สามารถอ่านไฟล์ได้";

      setParseError(message);
    } finally {
      setIsParsing(false);
    }
  }

  function handleResetFile() {
    setResult(null);
    setFileName(null);
    setParseError(null);
    setWriteSummary(null);
    setConflicts(null);
  }

  function handleTypeChange(nextType: ImportUiType) {
    setImportType(nextType);
    setResult(null);
    setParseError(null);
    setFileName(null);
    setWriteSummary(null);
    setConflicts(null);
  }

  const canImport =
    result !== null &&
    result.errors.length === 0 &&
    result.failedCount === 0 &&
    result.successCount > 0;

  function performWrite(selectedResolution: ConflictResolution) {
    if (!result) return;

    setIsSaving(true);

    try {
      const summary = commitImportWrite(
        importType,
        getNamedRecords(result),
        selectedResolution
      );

      setWriteSummary(summary);
      setConflicts(null);
      window.setTimeout(() => {
        window.location.reload();
      }, 1800);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้";

      setParseError(message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleImportClick() {
    if (!result || !canImport) return;

    const detected = detectImportConflicts(importType, getNamedRecords(result));

    if (detected.length > 0) {
      setConflicts(detected);
      setResolution("skip");
      return;
    }

    performWrite("replace");
  }

  function handleConfirmConflictWrite() {
    performWrite(resolution);
  }

  return (
    <AppShell
      title="นำข้อมูลจาก Excel"
      backHref="/"
    >
      <ImportTypePicker value={importType} onChange={handleTypeChange} />

      <ImportUploadCard
        importType={importType}
        fileName={fileName}
        isParsing={isParsing}
        onFileSelect={handleFileSelect}
      />

      {parseError ? (
        <Card className="kl-alert-danger">{parseError}</Card>
      ) : null}

      {isParsing ? <ImportResultPanelSkeleton /> : null}

      {result && !isParsing ? (
        <ImportResultPanel result={result} onResetFile={handleResetFile} />
      ) : null}

      {writeSummary ? <ImportSuccessSummary summary={writeSummary} /> : null}

      <div className="space-y-3">
        <Button
          type="button"
          fullWidth
          disabled={!canImport || isSaving || Boolean(writeSummary)}
          onClick={handleImportClick}
        >
          {isSaving ? "กำลังบันทึก..." : "เอาเข้าร้าน"}
        </Button>

        <p className="kl-type-label text-center text-kl-muted">
          {writeSummary
            ? "กำลังอัปเดตข้อมูล..."
            : canImport
              ? "ไม่แตะข้อมูลตัวอย่าง"
              : "ตรวจสอบไฟล์ให้ผ่านก่อน จึงจะบันทึกได้"}
        </p>
      </div>

      {conflicts && conflicts.length > 0 ? (
        <ImportConflictSheet
          conflicts={conflicts}
          resolution={resolution}
          onResolutionChange={setResolution}
          onConfirm={handleConfirmConflictWrite}
          onCancel={() => setConflicts(null)}
          isSaving={isSaving}
        />
      ) : null}
    </AppShell>
  );
}
