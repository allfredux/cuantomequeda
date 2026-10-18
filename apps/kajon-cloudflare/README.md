# Kajon: closed Cloudflare hosting bootstrap

This is ONLY a closed hosting check, not the Kajon application or its data migration.
The legacy site and Vercel bootstrap remain unchanged.

## Workers Builds target

- Worker: kajon
- Repository: allfredux/cuantomequeda
- Production branch: kajon/cloudflare
- Root directory: apps/kajon-cloudflare
- Build command: npm run build
- Deploy command: npx wrangler@4.151.1 deploy --config wrangler.jsonc
- Preview builds: disabled
- Build cache: disabled for this repair
- Application variables and secrets: none

The explicit config path avoids falling back to automatic static-site detection.
The version is pinned to the Wrangler version observed in the original build log.
Do not deploy the repository root or pass --assets .; repository internals must
never be uploaded as static assets.

## Containment

workers_dev:false and preview_urls:false keep both public URL types disabled,
including after later Wrangler deployments. No asset directory, domains, D1,
R2, KV, AI, containers, queues or scheduled tasks are configured.
Do not enable public routes until a separate authorized readiness check.

## Local verification

On 2026-10-18 npm run build ran on Node 22.16.0: 17 tests passed, 0 failed.
These are Node Fetch API tests, including /.git/config and /.git/HEAD denial.
They are not production HTTP checks or proof of a complete Kajon application.

The source handler returns HTTP 200 with ready:false at /api/health, HTTP 503
maintenance elsewhere (except robots.txt), and HTTP 405 for non-read methods.
With public URLs disabled, these responses are not publicly reachable.

## Remote verification required

Read back the build configuration, check the exact deployed commit and build
logs, confirm a Worker module was uploaded without static assets, and read back
the subdomain settings after deployment. Keep runtime HTTP verification separate
from successful deployment status. No signup, database or social/API integration
is active. Do not delete the Vercel project until migration is validated.

## References

- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/workers/wrangler/commands/workers/
- https://developers.cloudflare.com/workers/wrangler/configuration/
