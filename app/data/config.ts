/**
 * Master data source switch.
 *
 * - demo (default): bundled restaurant demo JSON under app/data/demo/
 * - user: import-ready JSON under app/data/user/
 *
 * Switch via NEXT_PUBLIC_KL_DATA_SOURCE=user (or KL_DATA_SOURCE=user).
 * Repositories stay unchanged — only seed loaders read this flag.
 */
export type DataSource = "demo" | "user";

const VALID_SOURCES: DataSource[] = ["demo", "user"];

export function getDataSource(): DataSource {
  const raw =
    process.env.NEXT_PUBLIC_KL_DATA_SOURCE ?? process.env.KL_DATA_SOURCE;

  if (raw && VALID_SOURCES.includes(raw as DataSource)) {
    return raw as DataSource;
  }

  return "demo";
}

export function isDemoDataSource(): boolean {
  return getDataSource() === "demo";
}

export function isUserDataSource(): boolean {
  return getDataSource() === "user";
}
