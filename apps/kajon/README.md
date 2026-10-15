# Kajon — hosting bootstrap only

This directory is an additive hosting bootstrap. It is NOT the Kajon 0.3 application.
It contains no user content, credentials, login implementation or social integrations.
The existing website at the repository root is not replaced.

## Vercel import settings

- Repository: allfredux/cuantomequeda
- Branch: main
- Team: allai1 (the Pro label is a plan, not a team name)
- Project name: cuantomequeda
- Root Directory: apps/kajon
- Application / Framework Preset: Other
- Build and output settings: use the committed vercel.json
- Environment variables: none for this bootstrap

After importing, a successful build may be Ready while the root URL correctly
returns HTTP 503 with `KAJON — Configuración en curso` and closed access.
`/api/health` returns HTTP 200 with `ready: false`. This proves runtime liveness,
not application readiness or Vercel deployment-protection configuration.
No APIs are called, no accounts are connected, and no data are stored.

## Local verification

Run `npm test` or `npm run build`. The tests check functions and configuration
locally; Vercel routing and the deployed URL still require live verification.

## Next gate, not implemented here

Import the reviewed Kajon source, implement the private authenticated runtime
and durable tenant-isolated storage, and test before removing the closed gate.
Keep the original website and backup until the replacement is verified.
No secrets belong in this public repository.

No preview, generated QA report, personal profile or previous local-state file
is published by this bootstrap.
