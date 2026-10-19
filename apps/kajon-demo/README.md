# Kajón · Demonstration archive

Standalone interactive demonstration of Kajón. The output is static HTML, CSS and JavaScript. It has no server, no service bindings, no accounts and no remote data source.

## Source and scope

- Visual reference: `/workspace/sites/kajon`, clean local commit `4df9b9f`, dated 14 October 2026. Its original source has not been modified.
- The palette, Kajón mark, core stylesheet, editorial shell and navigation retain the existing application design.
- GitHub `allfredux/cuantomequeda` was inspected read-only. Its `main` tree at inspection was `45a75b18d9eb1b73cd858f8cf2f8a0ac33620747`; `apps/kajon/` contained a Vercel bootstrap and no complete UI. It was not used as a substitute for the full local interface.
- A local file purporting to contain the private Cloudflare Worker of 18 October 2026 was inspected and found truncated: 23,613 bytes, ending in a truncation marker referring to 376,518 characters. It is not a complete or valid source snapshot for auditing the live handler. The subsequent read-only Cloudflare request did not return and was aborted. No live source or settings were modified. This demo explicitly retains the 14 October interface; it does not claim to match the later private Worker.
- All eight stories, scores, source labels and initial writing samples are explicitly fictitious. No private stories, user records, credentials or provider keys were copied.

## Demonstrated experience

The Radar supports story selection, Spanish/original headline switching, search, source type, topic, priority, a fixed demo-relative 24-hour period, and editorial decisions. The Mesa supports Flash X, LinkedIn and web pieces, prepared sample drafts, editing, objective selection and local saving. Marking a piece as published moves it to the demo archive and never publishes externally. A Sources view and local demo settings are included.

The demo date is fixed to 19 October 2026 at 08:00 in Madrid. The interface declares the example date so the time filter remains meaningful when the archive is visited later. Local changes use only the key `kajon.public-demo.v1`. Reset removes only that key. When browser storage is blocked, the demo continues in memory.

## Build and verify

Run from this directory, with Node 22 or later:

```sh
npm test
npm run build
```

No package installation is needed. The complete deliverable is the `dist/` directory. Asset paths are relative, so it can be hosted at the root of a separate demo host or under a directory. Navigation uses fragments, with no server routes.

`tests/flow.test.mjs` exercises nine scenarios, including the complete event-driven editor-to-archive interaction, reload, reset isolation, blocked storage, score boundaries, fixed-date filtering, output escaping and no-network checks. Its DOM harness is an in-process JavaScript harness, not a real browser.

## Deployment boundary

Publish only `dist/` as a separate static site or asset-only Worker. Do not replace the private Kajón Worker, change its Access policy, attach its database, or copy its secrets. The included `wrangler.jsonc` names a new demo and declares only static assets; the owner must select the final deployment identity and domain.

The application uses no `fetch`, XMLHttpRequest, WebSocket, EventSource or analytics. It loads no remote fonts, images or libraries. The HTML and `_headers` contain `connect-src 'none'` and prohibit forms, frames and workers. `noindex` is deliberate: these fabricated demonstration stories should not become search results presented as news.

## Validation boundary

No browser preview or screenshot was run. The managed Sites environment did not expose the required control-browser capability, and the Sites skill directs skipping browser QA in that case. Responsive and modal-scroll rules were checked in source, and interaction behavior was exercised with the Node DOM harness. Visual rendering across real browsers remains to be verified by a supported browser capability or a human.

No deployment, DNS modification, email, payment or external publication was performed by this task.
