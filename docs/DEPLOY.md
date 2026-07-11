# Business Insight on Vercel

Project name: `business-insight`

## Environment variables

| Name | Required | Notes |
|------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | From kn-queue project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | anon/public key only |
| `NEXT_PUBLIC_APP_URL` | recommended | e.g. `https://business-insight.vercel.app` |

## Supabase Auth redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: production app URL
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://YOUR_VERCEL_DOMAIN/auth/callback`

## SQL

Run once (foundation):  
`supabase/migrations/20260711210000_create_business_insight_foundation_fixed.sql`

Do not run deprecated `20260711_bi_schema.sql` or `20260711200000_*`.  
Do not modify existing queue tables.

## After deploy

1. Set env on Vercel (URL + anon key from kn-queue)
2. Open `/status` and `/dev/supabase-check`
3. Open `/opening` → `/opening/assets` → `/opening/budget` on two devices
4. Auth / Realtime ยังไม่เปิดใน Sprint 2
