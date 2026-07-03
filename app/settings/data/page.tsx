"use client";

import { useState } from "react";
import AppShell from "../../../components/layout/AppShell";
import Card from "../../../components/ui/Card";
import {
  applyUserStorageSnapshot,
  captureUserStorageSnapshot,
  restoreUserBackup,
  validateBackupBundle,
} from "../../lib/backupService";
import { showUndoToast } from "../../lib/undoToast";
import type { KlBackupBundle } from "./types";
import BackupConfirmSheet from "./components/BackupConfirmSheet";
import BackupExportCard from "./components/BackupExportCard";
import BackupRestoreCard from "./components/BackupRestoreCard";

export default function SettingsDataPage() {
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [restoreFileName, setRestoreFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreErrors, setRestoreErrors] = useState<string[]>([]);
  const [pendingBundle, setPendingBundle] = useState<KlBackupBundle | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleExported() {
    setExportMessage("บันทึกไฟล์เก็บไว้แล้ว");
    setSuccessMessage(null);
    setRestoreErrors([]);
  }

  async function handleRestoreFileSelect(file: File) {
    setIsProcessing(true);
    setRestoreFileName(file.name);
    setRestoreErrors([]);
    setSuccessMessage(null);
    setExportMessage(null);
    setPendingBundle(null);

    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const validation = validateBackupBundle(parsed);

      if (!validation.valid) {
        setRestoreErrors(validation.errors);
        return;
      }

      setPendingBundle(validation.bundle);
    } catch {
      setRestoreErrors(["ไม่สามารถอ่านไฟล์สำรองได้"]);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleCancelRestore() {
    setPendingBundle(null);
  }

  function handleConfirmRestore() {
    if (!pendingBundle) return;

    setIsRestoring(true);
    setRestoreErrors([]);

    try {
      const previousSnapshot = captureUserStorageSnapshot();
      const summary = restoreUserBackup(pendingBundle);

      setSuccessMessage(
        `เอาข้อมูลกลับมาแล้ว (${summary.restoredKeys.length} ส่วน)`
      );
      setPendingBundle(null);

      showUndoToast({
        message: "เอากลับมาแล้ว",
        onUndo: () => {
          applyUserStorageSnapshot(previousSnapshot);
          setSuccessMessage(null);
        },
        onExpire: () => {
          window.location.reload();
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ไม่สามารถเอาข้อมูลกลับมาได้";

      setRestoreErrors([message]);
      setPendingBundle(null);
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <AppShell
      title="เก็บข้อมูลร้านไว้"
      backHref="/"
    >
      <BackupExportCard onExported={handleExported} />

      <BackupRestoreCard
        fileName={restoreFileName}
        isProcessing={isProcessing}
        onFileSelect={handleRestoreFileSelect}
      />

      {exportMessage ? (
        <Card className="kl-type-caption text-kl-success-text">
          {exportMessage}
        </Card>
      ) : null}

      {successMessage ? (
        <Card className="kl-type-caption text-kl-success-text">
          {successMessage}
        </Card>
      ) : null}

      {restoreErrors.length > 0 ? (
        <Card className="kl-alert-danger space-y-2">
          <div className="kl-type-card-title">เอาข้อมูลกลับมาไม่ได้</div>
          <ul className="space-y-1">
            {restoreErrors.map((error) => (
              <li key={error} className="break-words">
                • {error}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className="kl-type-helper">
        ข้อมูลตัวอย่างในแอปไม่เปลี่ยน — สำรองเฉพาะข้อมูลที่คุณสร้าง
      </Card>

      {pendingBundle ? (
        <BackupConfirmSheet
          bundle={pendingBundle}
          onConfirm={handleConfirmRestore}
          onCancel={handleCancelRestore}
          isRestoring={isRestoring}
        />
      ) : null}
    </AppShell>
  );
}
