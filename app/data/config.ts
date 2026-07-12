/**
 * Master data source switch.
 *
 * - demo (default): bundled restaurant demo JSON under app/data/demo/
 * - user: import-ready JSON under app/data/user/
 *
 * Switch via NEXT_PUBLIC_KL_DATA_SOURCE=user (or KL_DATA_SOURCE=user).
 * Repositories stay unchanged — only seed loaders read this flag.
 */
export type DataSource = "demo" | "user" | "empty";

const VALID_SOURCES: DataSource[] = ["demo", "user", "empty"];

export function getDataSource(): DataSource {
  /** Opt into bundled demo JSON with NEXT_PUBLIC_KL_DATA_SOURCE=demo */
  if (process.env.NEXT_PUBLIC_BI_CLEAN_START === "0") {
    const raw =
      process.env.NEXT_PUBLIC_KL_DATA_SOURCE ?? process.env.KL_DATA_SOURCE;
    if (raw && VALID_SOURCES.includes(raw as DataSource)) {
      return raw as DataSource;
    }
    return "demo";
  }

  if (process.env.NEXT_PUBLIC_KL_DATA_SOURCE === "demo") {
    return "demo";
  }
  if (process.env.NEXT_PUBLIC_KL_DATA_SOURCE === "user") {
    return "user";
  }

  return "empty";
}

export function isDemoDataSource(): boolean {
  return getDataSource() === "demo";
}

export function isUserDataSource(): boolean {
  return getDataSource() === "user";
}

export function isEmptyDataSource(): boolean {
  return getDataSource() === "empty";
}
