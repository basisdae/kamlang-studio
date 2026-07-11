import { getBiRepositories } from "../repositories";
import { validationError } from "../supabase/errors";
import type {
  Asset,
  AssetDecisionGroup,
  AssetListFilters,
  AssetStatus,
  AssetWriteInput,
  PurchaseWriteInput,
  RepairWriteInput,
} from "../types/asset";
import { uiAssetToWriteInput } from "../mappers/assetMapper";

const OWNED_STATUSES: AssetStatus[] = [
  "ordered",
  "awaiting_delivery",
  "received",
  "in_use",
];

function assertValidWrite(input: AssetWriteInput) {
  if (!input.name?.trim()) {
    throw validationError("ชื่ออุปกรณ์ห้ามว่าง");
  }
  if (!input.category?.trim()) {
    throw validationError("ต้องระบุหมวดหมู่");
  }
  if (!input.unit?.trim()) {
    throw validationError("ต้องระบุหน่วย");
  }
  if (!input.status) {
    throw validationError("ต้องระบุสถานะ");
  }
  const qty = input.quantity ?? 1;
  if (!(qty > 0)) {
    throw validationError("จำนวนต้องมากกว่า 0");
  }
  if (input.estimatedUnitPrice != null && input.estimatedUnitPrice < 0) {
    throw validationError("ราคาประเมินห้ามติดลบ");
  }
  if (input.actualUnitPrice != null && input.actualUnitPrice < 0) {
    throw validationError("ราคาจริงห้ามติดลบ");
  }
}

function ownedNeedsPriceWarning(input: AssetWriteInput): string | null {
  const status = input.status ?? "planned";
  if (!OWNED_STATUSES.includes(status)) return null;
  if (input.actualUnitPrice == null && input.estimatedUnitPrice == null) {
    return "สถานะนี้ควรมีราคาจริงหรือราคาประเมิน";
  }
  return null;
}

async function logSafe(
  workspaceId: string,
  action: string,
  entityId: string | null,
  summary: string,
  actorName: string
) {
  try {
    const { activity } = getBiRepositories();
    await activity.create({
      workspaceId,
      entityType: "asset",
      entityId,
      action,
      actorName,
      summary,
      metadata: { source: "assetService" },
    });
  } catch {
    /* activity must never fail the main mutation */
  }
}

export class AssetService {
  async list(
    workspaceId: string,
    filters?: AssetListFilters
  ): Promise<Asset[]> {
    const { assets } = getBiRepositories();
    return assets.listByWorkspace(workspaceId, filters);
  }

  async get(workspaceId: string, id: string): Promise<Asset | null> {
    const { assets } = getBiRepositories();
    return assets.getById(id, workspaceId);
  }

  async listDecisionGroups(
    workspaceId: string
  ): Promise<AssetDecisionGroup[]> {
    const { assets } = getBiRepositories();
    return assets.listDecisionGroups(workspaceId);
  }

  async createAsset(
    workspaceId: string,
    input: AssetWriteInput | Record<string, unknown>,
    actorName = "ผู้ใช้งาน"
  ): Promise<{ asset: Asset; warning: string | null }> {
    const write =
      "estimatedUnitPrice" in input || "name" in input
        ? "estimatedPrice" in input
          ? uiAssetToWriteInput(input as Record<string, unknown>)
          : (input as AssetWriteInput)
        : uiAssetToWriteInput(input as Record<string, unknown>);

    // Prefer UI shape when estimatedPrice present
    const normalized =
      "estimatedPrice" in (input as object) ||
      "purchasedAt" in (input as object) ||
      "supplier" in (input as object)
        ? uiAssetToWriteInput(input as Record<string, unknown>)
        : write;

    assertValidWrite(normalized);
    const warning = ownedNeedsPriceWarning(normalized);
    const { assets, budget } = getBiRepositories();
    const asset = await assets.create(workspaceId, normalized);
    await logSafe(
      workspaceId,
      "create",
      asset.id,
      `${actorName}เพิ่มอุปกรณ์ “${asset.name}”`,
      actorName
    );
    try {
      await budget.updateFromAsset(workspaceId, asset);
    } catch {
      /* budget link optional */
    }
    return { asset, warning };
  }

  async updateAsset(
    workspaceId: string,
    id: string,
    patch: Record<string, unknown>,
    actorName = "ผู้ใช้งาน"
  ): Promise<{ asset: Asset; warning: string | null }> {
    const { assets, budget } = getBiRepositories();
    const existing = await assets.getById(id, workspaceId);
    if (!existing) throw validationError("ไม่พบอุปกรณ์");

    const merged = uiAssetToWriteInput({
      ...existing,
      estimatedPrice: existing.estimatedUnitPrice,
      actualPrice: existing.actualUnitPrice,
      supplier: existing.supplierName,
      purchasedAt: existing.purchaseDate,
      note: existing.notes,
      warrantyUntil: existing.warrantyExpiresAt,
      size: existing.specifications.size,
      color: existing.specifications.color,
      material: existing.specifications.material,
      power: existing.specifications.power,
      specs: existing.specifications.specs,
      requiredForOpening: existing.specifications.requiredForOpening,
      ...patch,
    });

    assertValidWrite(merged);
    const warning = ownedNeedsPriceWarning(merged);
    const statusChanged =
      Boolean(patch.status) && patch.status !== existing.status;
    const asset = await assets.update(id, workspaceId, merged);
    await logSafe(
      workspaceId,
      statusChanged ? "status" : "update",
      id,
      statusChanged
        ? `${actorName}เปลี่ยนสถานะ “${asset.name}”`
        : `${actorName}อัปเดต “${asset.name}”`,
      actorName
    );
    try {
      await budget.updateFromAsset(workspaceId, asset);
    } catch {
      /* optional */
    }
    return { asset, warning };
  }

  async duplicateAsset(
    workspaceId: string,
    id: string,
    overrides: Record<string, unknown> = {},
    actorName = "ผู้ใช้งาน"
  ): Promise<Asset> {
    const source = await this.get(workspaceId, id);
    if (!source) throw validationError("ไม่พบอุปกรณ์ต้นทาง");

    const { asset } = await this.createAsset(
      workspaceId,
      {
        name: source.name,
        category: source.category,
        brand: source.brand,
        model: source.model,
        quantity: 1,
        unit: source.unit,
        estimatedPrice: source.estimatedUnitPrice,
        actualPrice: null,
        supplier: source.supplierName,
        purchaseChannel: source.purchaseChannel,
        purchaseUrl: source.purchaseUrl,
        priority: source.priority,
        status: "planned",
        purchasedAt: null,
        size: source.specifications.size ?? "",
        color: source.specifications.color ?? "",
        material: source.specifications.material ?? "",
        power: source.specifications.power ?? "",
        specs: source.specifications.specs ?? "",
        note: source.notes
          ? `${source.notes} · สำเนาจากรายการเดิม`
          : "สำเนาจากรายการเดิม",
        warranty: source.warrantyMonths
          ? `${source.warrantyMonths} เดือน`
          : "",
        warrantyUntil: null,
        serialNumber: "",
        requiredForOpening:
          source.specifications.requiredForOpening !== false,
        decisionGroupId: source.decisionGroupId,
        ...overrides,
      },
      actorName
    );
    return asset;
  }

  async purchaseMore(
    workspaceId: string,
    assetId: string,
    input: PurchaseWriteInput | Record<string, unknown>,
    actorName = "ผู้ใช้งาน"
  ): Promise<Asset> {
    const { assets, budget } = getBiRepositories();
    const purchase: PurchaseWriteInput = {
      quantity: Number(
        (input as PurchaseWriteInput).quantity ??
          (input as { quantity?: number }).quantity
      ),
      unitPrice: Number(
        (input as PurchaseWriteInput).unitPrice ??
          (input as { unitPrice?: number }).unitPrice
      ),
      totalPrice:
        (input as PurchaseWriteInput).totalPrice ??
        (input as { total?: number }).total,
      purchaseDate: String(
        (input as PurchaseWriteInput).purchaseDate ??
          (input as { purchasedAt?: string }).purchasedAt ??
          ""
      ),
      supplierName:
        (input as PurchaseWriteInput).supplierName ??
        (input as { supplier?: string }).supplier,
      purchaseChannel: (input as PurchaseWriteInput).purchaseChannel,
      status:
        (input as PurchaseWriteInput).status ??
        (input as { status?: AssetStatus }).status,
      notes:
        (input as PurchaseWriteInput).notes ??
        (input as { note?: string }).note,
    };

    if (!(purchase.quantity > 0)) {
      throw validationError("จำนวนซื้อต้องมากกว่า 0");
    }
    if (purchase.unitPrice < 0) {
      throw validationError("ราคาห้ามติดลบ");
    }
    if (!purchase.purchaseDate) {
      throw validationError("ต้องระบุวันที่ซื้อ");
    }

    await assets.addPurchase(assetId, workspaceId, purchase);
    await logSafe(
      workspaceId,
      "purchase",
      assetId,
      `${actorName}ซื้อเพิ่ม`,
      actorName
    );
    const asset = await assets.getById(assetId, workspaceId);
    if (!asset) throw validationError("ไม่พบอุปกรณ์หลังซื้อเพิ่ม");
    try {
      await budget.updateFromAsset(workspaceId, asset);
    } catch {
      /* optional */
    }
    return asset;
  }

  async addRepair(
    workspaceId: string,
    assetId: string,
    input: RepairWriteInput | Record<string, unknown>,
    actorName = "ผู้ใช้งาน"
  ): Promise<Asset> {
    const { assets } = getBiRepositories();
    const repair: RepairWriteInput = {
      reportedAt: String(
        (input as RepairWriteInput).reportedAt ??
          (input as { reportedAt?: string }).reportedAt ??
          ""
      ),
      problem: String(
        (input as RepairWriteInput).problem ??
          (input as { symptom?: string }).symptom ??
          ""
      ),
      repairProvider:
        (input as RepairWriteInput).repairProvider ??
        (input as { repairer?: string }).repairer,
      repairCost:
        (input as RepairWriteInput).repairCost ??
        (input as { cost?: number | null }).cost ??
        null,
      returnedAt: (input as RepairWriteInput).returnedAt ?? null,
      result: (input as RepairWriteInput).result,
      notes:
        (input as RepairWriteInput).notes ??
        (input as { note?: string }).note,
    };

    if (!repair.problem.trim()) {
      throw validationError("ต้องระบุปัญหา");
    }
    if (!repair.reportedAt) {
      throw validationError("ต้องระบุวันที่แจ้งซ่อม");
    }
    if (repair.repairCost != null && repair.repairCost < 0) {
      throw validationError("ค่าซ่อมห้ามติดลบ");
    }

    await assets.addRepair(assetId, workspaceId, repair);
    await logSafe(
      workspaceId,
      "repair",
      assetId,
      `${actorName}เพิ่มประวัติซ่อม`,
      actorName
    );
    const asset = await assets.getById(assetId, workspaceId);
    if (!asset) throw validationError("ไม่พบอุปกรณ์");
    return asset;
  }

  async changeStatus(
    workspaceId: string,
    id: string,
    status: AssetStatus,
    actorName = "ผู้ใช้งาน"
  ): Promise<Asset> {
    const { asset } = await this.updateAsset(
      workspaceId,
      id,
      { status },
      actorName
    );
    return asset;
  }

  async archiveAsset(
    workspaceId: string,
    id: string,
    actorName = "ผู้ใช้งาน"
  ): Promise<void> {
    const { assets } = getBiRepositories();
    await assets.archive(id, workspaceId);
    await logSafe(
      workspaceId,
      "archive",
      id,
      `${actorName}เก็บรายการ`,
      actorName
    );
  }
}

export const assetService = new AssetService();
