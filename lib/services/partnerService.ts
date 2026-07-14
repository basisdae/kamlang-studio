import { getBiRepositories } from "../repositories";
import type { PartnerWriteInput } from "../mappers/partnerMapper";
import type { PartnerListFilters } from "../repositories/partnerRepository";
import type { PartnerRecord } from "../partners/types";

export const partnerService = {
  async list(
    workspaceId: string,
    filters?: PartnerListFilters
  ): Promise<PartnerRecord[]> {
    const { partners } = getBiRepositories();
    return partners.listByWorkspace(workspaceId, filters);
  },

  async get(id: string, workspaceId: string): Promise<PartnerRecord | null> {
    const { partners } = getBiRepositories();
    return partners.getById(id, workspaceId);
  },

  async create(
    workspaceId: string,
    input: PartnerWriteInput
  ): Promise<PartnerRecord> {
    const { partners } = getBiRepositories();
    return partners.create(workspaceId, input);
  },

  async update(
    id: string,
    workspaceId: string,
    patch: Partial<PartnerWriteInput>
  ): Promise<PartnerRecord> {
    const { partners } = getBiRepositories();
    return partners.update(id, workspaceId, patch);
  },

  async archive(id: string, workspaceId: string): Promise<void> {
    const { partners } = getBiRepositories();
    return partners.archive(id, workspaceId);
  },
};
