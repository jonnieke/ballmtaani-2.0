# BallMtaani Deployment Readiness (May 20, 2026)

## 1) Must-pass checks
- `npm run build` passes.
- No 404 routes for indexed pages in `public/sitemap.xml`.
- Terms and Privacy pages render content.
- API-Football key set in deploy environment.
- AdSense script present and ad slots configured.

## 2) Environment variables (Production)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — **required for prediction settlement worker** (bypasses RLS to write result/actual_score/coins_awarded and increment profiles.coins)
- `VITE_API_FOOTBALL_KEY`
- `CRON_SECRET` — set in Vercel dashboard; Vercel automatically sends this as `Authorization: Bearer <CRON_SECRET>` to cron routes. Keep it secret.
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (recommended: `gpt-4.1-mini`)
- `GEMINI_API_KEY` (optional fallback)
- `GEMINI_MODEL` (optional)
- `VITE_ADSENSE_SLOT_HORIZONTAL`
- `VITE_ADSENSE_SLOT_SQUARE` (optional)
- `VITE_VAPID_PUBLIC_KEY` — public VAPID key for Web Push notifications. Generate a keypair with `npx web-push generate-vapid-keys`. Without this, the Match Alerts toggle in Profile is gracefully disabled (no errors shown to fans).

## 3) SEO/AIO assets in this repo
- `index.html`:
  - OpenGraph + Twitter meta
  - canonical + hreflang
  - Organization/WebSite/WebApplication schema
- `public/robots.txt`
- `public/sitemap.xml`
- `public/llms.txt`
- Route/page SEO via `src/components/SEO.tsx` and `src/components/RouteSEO.tsx`

## 4) Pre-deploy QA flow
1. Open `/`, `/home`, `/matches`, `/live-center`, `/world-cup-2026`, `/mchambuzi-halisi`.
2. Confirm live data sections do not show mock fixtures as real live matches.
3. Submit at least one analyst prompt and verify:
   - response is concise fan tone
   - citation line exists below answer
4. Check one ad unit appears on quiet page and non-quiet page.
5. Validate mobile layout at 390px width:
   - no overlapping text
   - cards readable
   - sticky nav usable

## 5) Revenue guardrails
- Keep ad density moderate (avoid policy-risk crowding around nav/form controls).
- Put ad units between sections, not between interactive voting controls.
- Keep all football intelligence sections usable even when ads fail to load.

## 6) One command before ship
```bash
npm run build
```
