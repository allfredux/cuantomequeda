import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import worker from '../src/worker.mjs';
const request = (path = '/', method = 'GET') => new Request(`https://example.invalid${path}`, { method });

test('health identifies Cloudflare bootstrap without claiming readiness', async () => {
  const res = worker.fetch(request('/api/health'));
  assert.equal(res.status, 200);
  assert.match(res.headers.get('Content-Type'), /application\/json/);
  assert.deepEqual(await res.json(), {
    service: 'kajon', bootstrapVersion: '0.0.2', runtime: 'cloudflare-workers',
    status: 'setup_required', ready: false
  });
});

test('root stays closed', async () => {
  const res = worker.fetch(request());
  assert.equal(res.status, 503);
  assert.match(await res.text(), /Acceso cerrado/);
});

for (const path of ['/api/state', '/api/oauth/x/start', '/api/oauth/linkedin/start', '/.env', '/src/worker.mjs', '/api/health/extra', '/.git/config', '/.git/HEAD']) {
  test(`no application content exposed at ${path}`, () => {
    assert.equal(worker.fetch(request(path)).status, 503);
  });
}

test('HEAD returns no body for health, gate and robots', async () => {
  for (const path of ['/', '/api/health', '/robots.txt']) {
    const res = worker.fetch(request(path, 'HEAD'));
    assert.equal(await res.text(), '');
    assert.equal(res.status, path === '/' ? 503 : 200);
  }
});

test('non-read methods are refused on all routes', () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    for (const path of ['/', '/api/health', '/robots.txt']) {
      const res = worker.fetch(request(path, method));
      assert.equal(res.status, 405);
      assert.equal(res.headers.get('Allow'), 'GET, HEAD');
    }
  }
});

test('all routes prevent caching, indexing, framing and cross-origin reads', () => {
  for (const path of ['/', '/api/health', '/robots.txt']) {
    const h = worker.fetch(request(path)).headers;
    assert.match(h.get('Cache-Control'), /no-store/);
    assert.match(h.get('X-Robots-Tag'), /noindex/);
    assert.equal(h.get('X-Frame-Options'), 'DENY');
    assert.equal(h.get('Access-Control-Allow-Origin'), null);
    assert.match(h.get('Content-Security-Policy'), /default-src 'none'/);
  }
});

test('query strings, cookies and credentials are not echoed', async () => {
  for (const path of ['/', '/api/health']) {
    const req = new Request(`https://example.invalid${path}?ready=true&token=do-not-echo`, {
      headers: { Authorization: 'Bearer do-not-echo', Cookie: 'session=do-not-echo' }
    });
    const text = await worker.fetch(req).text();
    assert.doesNotMatch(text, /do-not-echo/);
    if (path === '/api/health') assert.equal(JSON.parse(text).ready, false);
  }
});

test('robots disallows the complete site', async () => {
  assert.equal(await worker.fetch(request('/robots.txt')).text(), 'User-agent: *\nDisallow: /\n');
});

test('config names only the intended Worker, with public URLs, previews and logging disabled', async () => {
  const c = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.deepEqual(c, {
    name: 'kajon', main: 'src/worker.mjs', compatibility_date: '2026-10-01',
    workers_dev: false, preview_urls: false, observability: { enabled: false }
  });
  // Exact config also prevents introducing automatic database/AI/queue provisioning.
});

test('bootstrap never accesses bindings or makes external requests', async () => {
  const prior = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Outbound network forbidden'); };
  const env = new Proxy({}, { get() { throw new Error('Bindings forbidden'); } });
  try {
    for (const path of ['/', '/api/health', '/robots.txt']) {
      const res = await worker.fetch(request(path), env);
      assert.ok([200, 503].includes(res.status));
    }
  } finally { globalThis.fetch = prior; }
});
