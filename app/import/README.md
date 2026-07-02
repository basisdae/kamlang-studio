# Import

Excel validation and write flow at `/import`.

## Storage (Write V1)

Imported master data is saved to **localStorage** only:

| Key | Entity |
|-----|--------|
| `kl-user-master-ingredients` | วัตถุดิบ |
| `kl-user-master-recipes` | สูตรอาหาร |
| `kl-user-master-packaging` | แพ็กเกจ |
| `kl-user-master-menus` | เมนูขาย |

Repository: `app/repositories/UserMasterDataRepository.ts`

## Layering

```
app/data/demo/*.json     ← never modified
        +
localStorage user layer  ← Excel imports
        =
effective master data (via seed getters)
```

Demo JSON files in the repo are **not overwritten**.

## Conflict resolution

When id or name already exists:

- **ข้าม** — skip conflicting rows
- **แทนที่** — override existing record in user layer
- **เพิ่มเป็นรายการใหม่** — new id / renamed copy
