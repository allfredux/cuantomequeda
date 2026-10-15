import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import gate from '../api/gateway.mjs';
import health from '../api/health.mjs';
const request = (path = '/', method = 'GET') => new Request(`https://example.invalid${path}`, { method });
test('root is closed, not an active Kajon application', async () => {
  const response = gate.fetch(request());
  assert.equal(response.status, 503);
  assert.match(await response.text(), /Acceso cerrado/);
});
for (const path of ['/api/state', '/api/oauth/x/start', '/.env', '/src/panel.mjs']) {
  test(`the gate refuses ${path}`, () => assert.equal(gate.fetch(request(path)).status, 503));
}
test('health is live but never declares the application ready', async () => {
  const response = health.fetch(request('/api/health'));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { service: 'kajon', bootstrapVersion: '0.0.1', status: 'setup_required', ready: false });
});
test('HEAD has no response body', async () => {
  for (const handler of [gate, health]) assert.equal(await handler.fetch(request('/', 'HEAD')).text(), '');
});
test('write methods do not execute actions', () => {
  for (const handler of [gate, health]) for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    const response = handler.fetch(request('/', method));
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('Allow'), 'GET, HEAD');
  }
});
test('responses prevent caching, indexing and framing', () => {
  for (const handler of [gate, health]) {
    const h = handler.fetch(request()).headers;
    assert.match(h.get('Cache-Control'), /no-store/);
    assert.match(h.get('X-Robots-Tag'), /noindex/);
    assert.equal(h.get('X-Frame-Options'), 'DENY');
    assert.equal(h.get('Access-Control-Allow-Origin'), null);
  }
});
test('input and credentials are not echoed', async () => {
  const req = new Request('https://example.invalid/?token=do-not-echo', { headers: { Authorization: 'Bearer do-not-echo', Cookie: 'session=do-not-echo' } });
  for (const handler of [gate, health]) assert.doesNotMatch(await handler.fetch(req).text(), /do-not-echo/);
});
test('only robots.txt is an explicitly public asset', async () => {
  assert.deepEqual(await readdir(new URL('../public/', import.meta.url)), ['robots.txt']);
});
test('Vercel only exports public assets and routes the rest to the gate', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.equal(config.outputDirectory, 'public');
  // The deployment API rejected this property; access stays closed in gateway.mjs.
  assert.equal(Object.hasOwn(config, 'public'), false);
  assert.equal(config.framework, null);
  assert.deepEqual(config.routes, [{ handle: 'filesystem' }, { src: '/(.*)', dest: '/api/gateway' }]);
});
