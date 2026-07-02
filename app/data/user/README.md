# User data import folder

Place real restaurant master data here as JSON files.

1. Copy structure from `../demo/` or use `_examples/` for field reference
2. Fill each file (or split from `import-bundle.template.json`)
3. Set `NEXT_PUBLIC_KL_DATA_SOURCE=user` in `.env.local`
4. Restart dev server

Full documentation: [MIGRATION.md](../MIGRATION.md)

**Import order:** ingredients → packaging-items → packaging-sets → recipes → menus → inventory → production
