/**
 * User backup bundle types.
 *
 * @see app/lib/backupService.ts
 */

export const KL_BACKUP_VERSION = 1;
export const KL_BACKUP_APP_ID = "kamlang-studio";

export type KlBackupData = Record<string, unknown>;

export type KlBackupBundle = {
  version: typeof KL_BACKUP_VERSION;
  exportedAt: string;
  app: typeof KL_BACKUP_APP_ID;
  data: KlBackupData;
};

export type BackupValidationResult =
  | { valid: true; bundle: KlBackupBundle }
  | { valid: false; errors: string[] };

export type BackupRestoreSummary = {
  restoredKeys: string[];
  clearedKeys: string[];
};
