import type { BiError } from "../supabase/errors";

export type RepositoryResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: BiError };

export type PageQuery = {
  limit?: number;
  offset?: number;
};
