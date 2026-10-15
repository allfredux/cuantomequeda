# Kajon: integration and release record

## Scope and actual state

Target repository: allfredux/cuantomequeda. Working branch: kajon/integration.
Preserve main and backup/cuantomequeda-before-kajon-20261015 until a private replacement is verified.
Do not modify AllAi1, SoloGang, their databases, domains or credentials.

The 0.3 application package has been tested locally again: 125 tests passed, 0 failed. This commit adds release evidence tooling and a deployment contract only. It does NOT contain the complete 0.3 application, a production host, or a deployed service. Full source import and runtime integration remain outstanding. The local preview is not a production application.

The release evaluator has 28 local tests. Its own test fixtures are synthetic. No production evidence is included. An evidence report can be reviewed for completeness; it cannot prove facts merely by containing the word passed.

## Observed access

- GitHub repository access and branch creation work. The integration branch was created successfully.
- Creating the Vercel project returned HTTP 403. Its cause is not proven to be a particular role or consent setting. No authenticated CLI alternative is available in this environment.
- The Vercel ChatGPT app inherits the low-risk setting. That setting controls confirmation, not the provider's authorization.
- Supabase discovery returned existing projects belonging to other applications, not a Kajon database. Do not reuse or alter them without a separate decision.
- No real social account, original Sites data source, or Claude runtime configuration has been verified in this implementation.

## Permissions and decisions required

1. Vercel: explicit approval of create/configure/deploy operations in the intended team. Request Ask before writes or Always ask for this app rather than unrestricted permissions globally. Actual Vercel access must allow project creation, production environment configuration, deployment protection and deployment. Resolve any remaining provider 403 separately.
2. Storage/auth: approve an isolated Kajon project and choose the Supabase organization. Retrieve and disclose its cost before creating it; no paid project or plan upgrade is authorized by this document. Vercel+Supabase is a proposed target, not an implemented migration. The original module uses D1 and needs a tested replacement adapter.
3. Secrets: configure server-only application credentials directly in the destination's environment settings. Never put passwords, tokens or client secrets into chat, Git, browser storage, screenshots or logs. Scope all secrets to Kajon, and establish a restore/rotation procedure for the encryption key.
4. Social apps: applications belong to Kajon; each admitted user authorizes their own accounts. LinkedIn analytics require approved Community Management access and r_member_postAnalytics in addition to identity access. X requires API access, per-user OAuth and tested token expiry/renewal handling. Extra networks must not be labeled connected merely because they appear in a catalogue.
5. Original Kajon: recover authorized source/data export from Sites, verify data mapping and tenant ownership, dry-run the import, compare counts and preserve the original until the import is accepted.
6. Costs: approve provider consumption limits before enabling automatic paid API requests. This record creates no schedule and authorizes no advertising or other spending.

## Implementation still outstanding

- Import the full reviewed application source into apps/kajon; review public-repository content for secrets and personal data first.
- Add a real server host, authenticated login, invitation admission and durable isolated storage; test atomic writes and cross-user denial.
- Connect Claude server-side, original editorial data and the published archive; preserve manual drafting and informational warnings.
- Complete X refresh/expiry handling, LinkedIn canonical post resolution/history limits, and real read validation.
- Implement remaining API adapters as approved. Currently they are manual/catalogue capabilities, not live integrations.
- Verify the complete browser-to-API-to-database flow on the deployed commit, including mobile and refresh/reconnect.

## Release evidence

Run `node --test apps/kajon/deploy/release.test.mjs` for the evidence checker.
Run `node apps/kajon/deploy/release.mjs` for the current release report. Exit 1 is expected while evidence is missing.

A private LinkedIn/X release requires HTTPS, login, anonymous denial, tenant isolation, persistence across server restarts, backup/restore, CSRF protection, server-only secrets, real Claude output, real Radar data, accepted original-data migration and mobile end-to-end verification. Each primary network requires application access, user consent, verified account identity, real metrics, expiry handling and verified disconnect.

Every evidence item must identify the tested commit, production origin, environment, verification time and a non-secret reference. Local tests and mocks do not substitute for production verification. Completing this report does not publish anything by itself.

Retain invitation-only access. Public social actions remain disabled. Approval of deployment is not approval to publish posts, comment, like, follow, contact third parties or open public signup. The release checker never blocks manual editorial drafting.

## Primary documentation checked

- https://help.openai.com/en/articles/11487775-connected-apps-in-chatgpt
- https://vercel.com/docs/rbac/access-roles
- https://vercel.com/docs/environment-variables
- https://vercel.com/docs/deployment-protection
- https://learn.microsoft.com/en-us/linkedin/marketing/increasing-access
- https://learn.microsoft.com/en-us/linkedin/marketing/community-management/members/post-statistics
- https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code
