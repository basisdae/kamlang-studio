# Supabase setup — Business Insight (kn-queue)

## Project

- Supabase project: **kn-queue** (shared with Queue)
- Business Insight tables: prefix **`bi_`** only
- **Never** modify, drop, or rename Queue tables

## Keys (local)

1. Open Supabase Dashboard → Project **kn-queue** → **Settings → API**
2. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Create `.env.local` (not committed):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**สำคัญ:** URL ต้องเป็น Project URL อย่างเดียว  
ห้ามใส่ `/rest/v1` หรือ path อื่น — จะทำให้ error `Invalid path specified in request URL`  
โค้ดจะ normalize ตัด `/rest/v1` ให้อัตโนมัติ แต่ควรตั้งค่าให้ถูกบน Vercel ด้วย

4. Restart `npm run dev`

## Keys (Vercel)

Project Settings → Environment Variables → same two `NEXT_PUBLIC_*` values  
(Production + Preview)

## Forbidden

- **Do not** put `service_role` key in the browser / Next client
- **Do not** hardcode URL or keys in source

## Migration

Run once in SQL Editor:

`supabase/migrations/20260711210000_create_business_insight_foundation_fixed.sql`

## Security note

Current RLS is a **Temporary Shared Preview Policy** (anon can read/write `bi_*`).

Partners Shared Core: run `supabase/migrations/20260714180000_create_bi_partners.sql` once in SQL Editor (same anon preview RLS). Verify with `node --env-file=.env.local scripts/apply-bi-partners.mjs`.

### TODO (next sprints)

- [ ] Supabase Auth
- [ ] Close anon write
- [ ] Add `bi_members`
- [ ] Real audit actor (not “ผู้ใช้งาน”)
- [ ] Realtime (optional)

## Smoke check

Open `/dev/supabase-check` → ตรวจอีกครั้ง  
Expect: connected + workspace “ตั้งเตา”
