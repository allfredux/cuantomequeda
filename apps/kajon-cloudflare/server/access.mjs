import { SignalError } from '../src/core.mjs';
const encoder = new TextEncoder();
const caches = new Map();
function fail(message = 'Necesitas una sesión privada válida.') { throw new SignalError(message, 'AUTH_REQUIRED', 401); }
function bytes(s) {
  if (typeof s !== 'string' || !/^[A-Za-z0-9_-]+$/.test(s)) fail();
  try { return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0)); } catch { fail(); }
}
const parse = s => { try { return JSON.parse(new TextDecoder().decode(bytes(s))); } catch { fail(); } };
export async function sha256(s) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(s))), b=>b.toString(16).padStart(2,'0')).join(''); }
/** Only the verified Access JWT establishes identity; request headers never establish ownership. */
export async function verifyAccess(request, env, {fetcher = fetch, now = Date.now()} = {}) {
  const issuer = env.ACCESS_ISSUER;
  if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer || '') || !env.ACCESS_AUD) throw new SignalError('Acceso privado pendiente de configurar.', 'AUTH_CONFIG', 503);
  const token = request.headers.get('cf-access-jwt-assertion');
  if (!token || token.length > 16000) fail();
  const parts = token.split('.'); if (parts.length !== 3) fail();
  const header = parse(parts[0]), c = parse(parts[1]);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string' || header.kid.length > 200) fail();
  if (c.iss !== issuer || !Array.isArray(c.aud) || !c.aud.includes(env.ACCESS_AUD)) fail();
  if (!Number.isFinite(c.exp) || c.exp*1000 <= now || (c.nbf !== undefined && (!Number.isFinite(c.nbf) || c.nbf*1000 > now+30000))) fail();
  if (!Number.isFinite(c.iat) || c.iat*1000 > now+30000 || c.exp <= c.iat) fail();
  if (typeof c.sub !== 'string' || !c.sub || c.sub.length > 500 || typeof c.email !== 'string') fail();
  const allowed = String(env.ALLOWED_EMAILS || '').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean);
  if (!allowed.includes(c.email.toLowerCase())) throw new SignalError('Tu cuenta no tiene acceso concedido a Kajon.', 'ACCESS_NOT_GRANTED', 403);
  let cached = caches.get(issuer);
  if (!cached || cached.expires <= now) {
    const r = await fetcher(`${issuer}/cdn-cgi/access/certs`, {redirect:'error',signal:AbortSignal.timeout(8000)});
    if (!r.ok) throw new SignalError('No se pudo verificar la sesión. Recarga.', 'AUTH_UNAVAILABLE', 503);
    const jwks = await r.json(); if (!Array.isArray(jwks.keys) || jwks.keys.length > 20) fail();
    cached = { keys:jwks.keys, imported:new Map(), expires:now+300000 }; caches.set(issuer,cached);
  }
  const jwk = cached.keys.find(k=>k.kid===header.kid && k.kty==='RSA' && (!k.alg || k.alg==='RS256') && (!k.use || k.use==='sig'));
  if (!jwk) { caches.delete(issuer); fail('Sesión con clave renovada: recarga para verificarla.'); }
  let key = cached.imported.get(header.kid);
  if (!key) { key = await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']); cached.imported.set(header.kid,key); }
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,bytes(parts[2]),encoder.encode(parts[0]+'.'+parts[1]));
  if (!valid) fail();
  const id = 'u_'+await sha256(JSON.stringify(['kajon:principal:v1',issuer,c.sub]));
  const sessionId = await sha256(token);
  const csrf = await sha256('kajon:csrf:v1:'+token);
  return Object.freeze({ id, sessionId, csrf, email:c.email, displayName:c.email.split('@')[0], expiresAt:c.exp*1000 });
}
export function verifyMutation(request,user,origin) {
  const site = request.headers.get('sec-fetch-site');
  return request.headers.get('origin') === origin && (!site || site === 'same-origin') && request.headers.get('x-csrf-token') === user.csrf;
}
