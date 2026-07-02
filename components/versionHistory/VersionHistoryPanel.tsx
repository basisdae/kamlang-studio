"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";
import { useMemo, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import {
  getVersions,
  restoreVersion,
} from "../../app/repositories/VersionHistoryRepository";
import type { VersionEntityType } from "../../app/versionHistory/types";
import { formatVersionTimestamp } from "../../app/versionHistory/utils";

type Props = {
  entityType: VersionEntityType;
  entityId: string;
  refreshKey?: number;
  onRestored?: () => void;
};

export default function VersionHistoryPanel({
  entityType,
  entityId,
  refreshKey = 0,
  onRestored,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [localRefresh, setLocalRefresh] = useState(0);

  const versions = useMemo(() => {
    if (!isOpen) return [];

    return getVersions(entityType, entityId);
  }, [entityType, entityId, isOpen, refreshKey, localRefresh]);

  function handleRestore(versionId: string) {
    const restored = restoreVersion(entityType, entityId, versionId);
    if (!restored) return;

    setLocalRefresh((current) => current + 1);
    onRestored?.();
  }

  return (
    <Card className="space-y-3">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-11 w-full items-center justify-between rounded-2xl bg-kl-surface px-4 text-sm font-bold text-kl-brown kl-pressable"
      >
        <span>ดูประวัติ</span>
        {isOpen ? (
          <ChevronUp
            className={`${KL_ICON_CLASS} text-kl-muted`}
            strokeWidth={KL_ICON_STROKE}
          />
        ) : (
          <ChevronDown
            className={`${KL_ICON_CLASS} text-kl-muted`}
            strokeWidth={KL_ICON_STROKE}
          />
        )}
      </button>

      {isOpen ? (
        versions.length === 0 ? (
          <p className="text-center text-sm text-kl-muted">ยังไม่มีประวัติการแก้ไข</p>
        ) : (
          <div className="space-y-2">
            {versions.map((version) => (
              <div
                key={version.id}
                className="kl-inset space-y-3"
              >
                <div className="kl-caption">
                  {formatVersionTimestamp(version.createdAt)}
                </div>
                <div className="text-sm font-bold text-kl-brown">{version.note}</div>
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => handleRestore(version.id)}
                >
                  ใช้แบบนี้แทน
                </Button>
              </div>
            ))}
          </div>
        )
      ) : null}
    </Card>
  );
}
