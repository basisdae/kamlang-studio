/**
 * Merge demo/base master records with localStorage user imports.
 * Demo JSON files are never modified — overrides live in user layer only.
 */
export function mergeUserMasterRecords<T extends { id: string }>(
  base: T[],
  overrides: T[]
): T[] {
  const byId = new Map(base.map((item) => [item.id, item]));

  for (const item of overrides) {
    byId.set(item.id, item);
  }

  return Array.from(byId.values());
}
