// Closed bootstrap only: no accounts, data, secrets, integrations or write actions.
const securityHeaders = Object.freeze({
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
});
export function respond(request, { status, body, type = 'text/plain; charset=utf-8' }) {
  const headers = { ...securityHeaders, 'Content-Type': type };
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Method not allowed', { status: 405, headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' } });
  }
  return new Response(request.method === 'HEAD' ? null : body, { status, headers });
}
