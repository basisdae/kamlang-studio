# Settings — Data & Backup

Route: `/settings/data`

## Backup format

```json
{
  "version": 1,
  "exportedAt": "2026-07-02T12:00:00.000Z",
  "app": "kamlang-studio",
  "data": {
    "kl-user-master-ingredients": [],
    "kl-user-master-recipes": [],
    "kl-user-master-packaging": [],
    "kl-user-master-menus": [],
    "kl-settings": {},
    "kl-builder-recipes": [],
    "kl-builder-menus": [],
    "kl-production-plans": [],
    "kl-production-hidden-dates": [],
    "kl-purchase-states": {},
    "kl-inventory-adjustments": {}
  }
}
```

Only keys present in localStorage are included on export.

## Restore validation

Before restore, `validateBackupBundle()` checks:

- Root is a JSON object
- `version === 1`
- `app === "kamlang-studio"`
- `data` is an object with at least one key
- Each key is in the known whitelist
- Array keys contain arrays; object keys contain objects
- Unknown keys are rejected

User must confirm — current localStorage user data is fully replaced.

Demo JSON under `app/data/demo/` is never modified.

## Service

`app/lib/backupService.ts`

- `exportUserBackup()` / `downloadUserBackup()`
- `validateBackupBundle(raw)`
- `restoreUserBackup(bundle)`
- `resetAllApplicationCaches()`
