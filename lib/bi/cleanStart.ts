/**
 * Clean-start gate — hide seed/mock BI datasets for real production entry.
 * Opt back into demo mocks with NEXT_PUBLIC_BI_CLEAN_START=0
 */
export function isCleanStart(): boolean {
  return process.env.NEXT_PUBLIC_BI_CLEAN_START !== "0";
}
