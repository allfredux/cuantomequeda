import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const CORE_CHECKS = Object.freeze([
  'https', 'private_login', 'anonymous_denied', 'tenant_isolation',
  'persistent_state', 'backup_restore', 'csrf', 'secrets_server_only',
  'claude_live', 'radar_live', 'original_data_migrated', 'mobile_e2e'
]);
export const SOCIAL_CHECKS = Object.freeze([
  'app_access_granted', 'oauth_consent', 'own_account_verified',
  'metrics_live', 'expiry_handled', 'disconnect_verified'
]);

/** A release report is evidence to review, not a service probe or an authorization. */
export function evaluateRelease(report, { now = Date.now(), maxAgeMs = 86400000 } = {}) {
  const blockers = [];
  const target = report?.target || {};
  if (target.repository !== 'allfredux/cuantomequeda') blockers.push('target.repository');
  if (target.team_id !== 'team_qdb4VpjV11GwKgee3zRqc1Ih') blockers.push('target.team_id');
  if (!/^prj_[A-Za-z0-9]+$/.test(target.project_id || '')) blockers.push('target.project_id');
  if (!/^[a-f0-9]{40}$/.test(target.commit || '')) blockers.push('target.commit');
  if (target.environment !== 'production') blockers.push('target.environment');
  let origin = '';
  try {
    const u = new URL(target.origin);
    if (u.protocol === 'https:' && u.pathname === '/' && !u.search && !u.hash && !u.username && !u.password) origin = u.origin;
  } catch { /* Unresolved target remains a blocker. */ }
  if (!origin) blockers.push('target.origin');
  if (report?.privacy !== 'invite_only') blockers.push('privacy');
  if (report?.public_actions !== false) blockers.push('public_actions');
  const checkEvidence = (name, evidence) => {
    const at = Date.parse(evidence?.verified_at || '');
    if (evidence?.status !== 'passed' || evidence?.mode !== 'live' ||
        evidence?.commit !== target.commit || evidence?.origin !== origin ||
        evidence?.environment !== target.environment ||
        typeof evidence?.reference !== 'string' || !evidence.reference.trim() ||
        !Number.isFinite(at) || at > now || now - at > maxAgeMs) blockers.push(name);
  };
  for (const name of CORE_CHECKS) checkEvidence(`core.${name}`, report?.core?.[name]);
  for (const provider of ['linkedin', 'x']) {
    for (const name of SOCIAL_CHECKS) checkEvidence(`social.${provider}.${name}`, report?.social?.[provider]?.[name]);
  }
  // Exposing a catalogue is not proof of a working additional social adapter.
  const additional = {};
  for (const provider of ['instagram', 'facebook', 'threads', 'youtube', 'tiktok', 'bluesky']) {
    const start = blockers.length;
    const checks = report?.social?.[provider];
    if (checks?.claimed_active === true) {
      for (const name of SOCIAL_CHECKS) checkEvidence(`social.${provider}.${name}`, checks[name]);
      additional[provider] = blockers.length === start ? 'evidence_complete' : 'unverified';
    } else additional[provider] = 'not_claimed_active';
  }
  return { evidence_complete: blockers.length === 0, blockers, additional,
    note: 'No ejecuta despliegues ni verifica servicios por sí solo. Revisar las evidencias. No limita la edición editorial.' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const report = JSON.parse(await readFile(process.argv[2] || new URL('./status.json', import.meta.url), 'utf8'));
    const result = evaluateRelease(report);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.evidence_complete ? 0 : 1;
  } catch {
    console.error('No se pudo leer un informe de verificación válido. No incluir secretos en ese archivo.');
    process.exitCode = 2;
  }
}
