# Kajon: Cloudflare Free hosting bootstrap

This is ONLY a closed hosting check, not the Kajon application or its migration.
It is isolated in apps/kajon-cloudflare on branch kajon/cloudflare.
The Vercel bootstrap in apps/kajon and all legacy files remain unchanged.

## Workers Builds settings

Use the existing Cloudflare account whose billing page shows Workers Free active.
Do not upgrade the plan, register domains, enable paid services, or expose user data.

- Product: Workers (not Pages)
- Repository: allfredux/cuantomequeda
- Worker name: kajon (must match wrangler.jsonc)
- Production branch: kajon/cloudflare (not main)
- Root directory: apps/kajon-cloudflare
- Build command: npm run build
- Deploy command: npx wrangler deploy
- Build/runtime variables and application secrets: none required
- Disable builds for non-production branches for this initial setup.

Workers Builds supplies the deployment authentication through the dashboard flow.
Do not paste Cloudflare/GitHub passwords or API tokens into chat or this repository.
The default Wrangler command is used; no claim is made that a particular Wrangler
version or workerd build has been validated locally.

## Expected live verification

- GET /api/health: HTTP 200, service kajon, runtime cloudflare-workers,
  bootstrapVersion 0.0.2, status setup_required, ready false.
- GET /: HTTP 503 with an explicit closed-maintenance message.
- GET /robots.txt: HTTP 200 with Disallow: /.
- POST, PUT, PATCH, DELETE, OPTIONS: HTTP 405. No write actions exist.

The health response verifies the live host only. ready:false is deliberate.
The application, login, durable storage, social accounts and AI are NOT connected.
No D1/R2/KV/AI/queue/cron bindings exist and no resources are auto-provisioned.
There is no signup, data collection, paid API call or automatic social action.
The maintenance gate is not a replacement for the future authenticated runtime.
Do not remove the Vercel project until the migration is verified separately.

## Verification performed

`npm run build` executed with Node 22.16.0: 15 tests passed, 0 failed.
Tests cover the fetch handler using Node's Fetch API and exact local configuration.
They do NOT verify Cloudflare bundling, workerd execution, billing, limits or live routing.
Those checks remain pending until Workers Builds succeeds and its actual URL is tested.

## Primary references

- https://developers.cloudflare.com/workers/ci-cd/builds/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/workers/wrangler/configuration/
