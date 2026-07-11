export type DataSource = "sample" | "seed" | "real";

export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  sample: "Sample Data",
  seed: "Seed · ตั้งเตา",
  real: "Supabase · Online",
};

/**
 * Tang Tao workspace — flip badge via WorkspaceProvider.dataSource when online.
 */
export const OPENING_DATA_SOURCE: DataSource = "real";
