# Kajon private workspace 0.5

This release replaces the closed bootstrap with the authenticated editorial workspace. It is NOT a claim that all social APIs, historical data or the requested .com domain are connected.

## Target

- Worker: kajon; Cloudflare account c02cf4a944fac250c8bd80ba4ba33433.
- Branch: kajon/cloudflare. Root: apps/kajon-cloudflare.
- Build: npm run build. Deploy: npx wrangler@4.151.1 deploy --config wrangler.jsonc.
- Temporary technical origin: https://kajon.alfredo-c02.workers.dev.
- Requested final domain: cuantomequeda.com. It was not found in the connected Cloudflare account on 2026-10-18. No DNS ownership is assumed and no domain is purchased.

## Privacy

Cloudflare Access gates the hostname. The Worker independently verifies the RS256 JWT signature, exact issuer, audience, expiry and ALLOWED_EMAILS. Owner IDs are derived only from verified issuer and subject. An absent JWT or missing configuration fails closed. There is no public signup, test header, authentication bypass, filesystem asset binding or public API. Preview URLs remain disabled.

The generated HTML contains only application code. Private state comes from D1 after authentication. Only approved commands can mutate state. Same-origin CSRF validation and compare-and-swap revisions protect writes. Secret values are not included in this repository.

## Runtime configuration

The Wrangler file references the existing EU D1 database, the Access issuer/audience and the Workers AI binding. ALLOWED_EMAILS and SOCIAL_ENCRYPTION_KEY are server secret bindings. Keep them out of Git and browser data. Do not rotate the encryption key without a migration plan for existing records.

Workers AI uses a bounded model available on Workers Free, with 3 cycles/user/day and 10 across this app/day. Daily provider quotas also apply. There is no paid model fallback. Claude and X API reads remain disabled by default; enabling a paid provider needs separate consumption approval.

## Editorial scope

Nine sections: daily dashboard, supplied sources, studio, selected conversations, published archive, analytics, experiments, channels and profile. Banners distinguish user-supplied data from live integrations. Editing revokes approval. Recording publication requires a human attestation and a valid URL. No API publishes, schedules, likes, follows, messages or comments externally.

## Social status

Native LinkedIn/X identity OAuth is implemented but credentials and real consent are not configured. LinkedIn analytics are not activated by profile login. X reads are explicitly disabled until consumption is authorized. Other networks support manual editorial records only.

Buffer has a per-user OAuth adapter using Authorization Code with PKCE and read scopes. Register a Kajon OAuth client in Buffer Settings > API, then configure BUFFER_CLIENT_ID (and BUFFER_CLIENT_SECRET for a confidential client) only in the Worker. Register the exact callback: APP_ORIGIN + /api/social/callback/buffer. Every admitted user consents to their own account. OAuth refresh is single-use and consumed atomically before sending, never replayed after an uncertain failure. Reading channels is implemented. Automatic Buffer publishing and metrics imports are not implemented. The Open Buffer link is not a connected account.

Buffer reference checked: https://developers.buffer.com/guides/authentication.html and https://developers.buffer.com/reference.html.

## Verification

Build generates the client bundle and validates its syntax and CSP hash. workspace.test.mjs exercises authentication, source-file denial, session-scoped storage, atomic revisions, approvals, quotas, and mock Buffer flows. These are tests against reviewed production source with synthetic users/providers and in-memory SQLite, not claims of end-user login, real Buffer authorization or original Kajon data migration. The previous 147-test report belongs to local version 0.4, not this revision.

Before opening the technical hostname: require successful build, expected bindings and Access allow policy. Then verify anonymous denial. End-user OTP and authorized browser flow still require the account owner. Keep the previous version available for rollback.
