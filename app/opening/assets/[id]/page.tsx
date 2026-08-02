"use client";

import { useParams } from "next/navigation";
import AppShell from "../../../../components/layout/AppShell";
import ButtonLink from "../../../../components/ui/ButtonLink";
import BiListSkeleton from "../../../../components/bi/BiListSkeleton";
import { useWorkspace } from "../../../providers/WorkspaceProvider";
import { useAssets } from "../AssetsProvider";
import AssetDetailDashboard from "./AssetDetailDashboard";

export default function OpeningAssetDetailPage() {
  const params = useParams<{ id: string }>();
  const { dataSource } = useWorkspace();
  const {
    getById,
    setStatus,
    addRepairRecord,
    archiveAsset,
    ready,
    loading,
    saving,
    error,
  } = useAssets();
  const asset = getById(params.id);

  if (loading && !ready) {
    return (
      <AppShell title="ทรัพย์สิน" backHref="/opening/assets" compact>
        <BiListSkeleton rows={4} />
      </AppShell>
    );
  }

  if (!asset) {
    return (
      <AppShell title="ไม่พบรายการ" backHref="/opening/assets" compact>
        <p className="kl-type-helper">ไม่มีทรัพย์สินนี้ใน Supabase</p>
        <ButtonLink href="/opening/assets" fullWidth>
          กลับรายการ
        </ButtonLink>
      </AppShell>
    );
  }

  return (
    <AppShell title="" hidePageHeader compact wide backHref="/opening/assets">
      <AssetDetailDashboard
        asset={asset}
        dataSource={dataSource}
        saving={saving}
        providerError={error}
        onSetStatus={setStatus}
        onAddRepair={addRepairRecord}
        onArchive={archiveAsset}
      />
    </AppShell>
  );
}
