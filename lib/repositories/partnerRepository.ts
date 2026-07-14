import type { PartnerRecord } from "../partners/types";
import type { PartnerWriteInput } from "../mappers/partnerMapper";

export type PartnerListFilters = {
  includeArchived?: boolean;
  category?: string;
  status?: string;
};

export type PartnerRepository = {
  listByWorkspace(
    workspaceId: string,
    filters?: PartnerListFilters
  ): Promise<PartnerRecord[]>;
  getById(id: string, workspaceId: string): Promise<PartnerRecord | null>;
  create(workspaceId: string, input: PartnerWriteInput): Promise<PartnerRecord>;
  update(
    id: string,
    workspaceId: string,
    patch: Partial<PartnerWriteInput>
  ): Promise<PartnerRecord>;
  archive(id: string, workspaceId: string): Promise<void>;
};
