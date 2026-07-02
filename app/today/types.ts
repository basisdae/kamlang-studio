export type StaffPrepChecklistState = {
  planDate: string;
  planId: string;
  checked: Record<string, boolean>;
  updatedAt: string;
};

export type StaffPrepChecklistItem = {
  key: string;
  name: string;
  quantityLabel: string;
  unitLabel: string;
  note?: string;
};
