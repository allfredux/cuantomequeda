// Hosting verification only. No login, user data, database, secrets or paid APIs.
const headers = Object.freeze({
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
});

function reply(request, status, body, contentType = 'text/plain; charset=utf-8') {
  return new Response(request.method === 'HEAD' ? null : body, {
    status,
    headers: { ...headers, 'Content-Type': contentType }
  });
}

export default {
  fetch(request) {
    if (!['GET', 'HEAD'].includes(request.method)) {
      const response = reply(request, 405, 'Method not allowed');
      response.headers.set('Allow', 'GET, HEAD');
      return response;
    }
    const path = new URL(request.url).pathname;
    if (path === '/api/health') {
      return reply(request, 200, JSON.stringify({
        service: 'kajon',
        bootstrapVersion: '0.0.2',
        runtime: 'cloudflare-workers',
        status: 'setup_required',
        ready: false
      }), 'application/json; charset=utf-8');
    }
    if (path === '/robots.txt') {
      return reply(request, 200, 'User-agent: *\nDisallow: /\n');
    }
    return reply(request, 503,
      'KAJON — Configuración en curso.\n\nAcceso cerrado. Alojamiento Cloudflare en preparación.\n' +
      'La aplicación, el inicio de sesión, la base de datos y las conexiones sociales no están activos.\n');
  }
};
