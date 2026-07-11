export type DataSource = "sample" | "seed" | "real";

export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  sample: "กำลังโหลด",
  seed: "ใช้ข้อมูลแคช",
  real: "ออนไลน์",
};

/**
 * Prefer BiDataStatus on online pages — this badge alone must not claim Online
 * when the page query failed (WorkspaceProvider sets real only after success).
 */
export const OPENING_DATA_SOURCE: DataSource = "real";
