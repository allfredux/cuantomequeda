import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRelease, CORE_CHECKS, SOCIAL_CHECKS } from './release.mjs';
const now = Date.parse('2026-10-15T12:00:00Z');
const options = { now };
function valid() {
  const target = { repository: 'allfredux/cuantomequeda', team_id: 'team_qdb4VpjV11GwKgee3zRqc1Ih', project_id: 'prj_TestOnly', commit: 'a'.repeat(40), origin: 'https://example.invalid', environment: 'production' };
  const evidence = () => ({ status: 'passed', mode: 'live', commit: target.commit, origin: target.origin, environment: target.environment, verified_at: '2026-10-15T11:00:00Z', reference: 'TEST FIXTURE ONLY: no live service was called' });
  return { target, privacy: 'invite_only', public_actions: false, core: Object.fromEntries(CORE_CHECKS.map(k => [k, evidence()])), social: Object.fromEntries(['linkedin', 'x'].map(p => [p, Object.fromEntries(SOCIAL_CHECKS.map(k => [k, evidence()]))])) };
}
test('missing report is not evidence', () => assert.equal(evaluateRelease(null, options).evidence_complete, false));
test('complete synthetic evidence satisfies the schema, not a live service test', () => assert.equal(evaluateRelease(valid(), options).evidence_complete, true));
for (const key of CORE_CHECKS) test(`requires live core evidence: ${key}`, () => { const r = valid(); delete r.core[key]; assert.ok(evaluateRelease(r, options).blockers.includes(`core.${key}`)); });
for (const field of ['commit', 'origin', 'environment']) test(`rejects evidence for another ${field}`, () => { const r = valid(); r.core.https[field] = 'different'; assert.equal(evaluateRelease(r, options).evidence_complete, false); });
test('unit tests do not replace live evidence', () => { const r = valid(); r.core.https.mode = 'mock'; assert.equal(evaluateRelease(r, options).evidence_complete, false); });
test('rejects stale evidence', () => { const r = valid(); r.core.https.verified_at = '2026-10-13T12:00:00Z'; assert.equal(evaluateRelease(r, options).evidence_complete, false); });
test('rejects future evidence', () => { const r = valid(); r.core.https.verified_at = '2026-10-16T12:00:00Z'; assert.equal(evaluateRelease(r, options).evidence_complete, false); });
test('public admission is not approved', () => { const r = valid(); r.privacy = 'public'; assert.ok(evaluateRelease(r, options).blockers.includes('privacy')); });
test('public social actions are not approved', () => { const r = valid(); r.public_actions = true; assert.ok(evaluateRelease(r, options).blockers.includes('public_actions')); });
test('an OAuth consent is not a metrics verification', () => { const r = valid(); delete r.social.linkedin.metrics_live; assert.ok(evaluateRelease(r, options).blockers.includes('social.linkedin.metrics_live')); });
test('expiry handling is required for X', () => { const r = valid(); delete r.social.x.expiry_handled; assert.equal(evaluateRelease(r, options).evidence_complete, false); });
test('catalogue does not activate extra providers', () => assert.equal(evaluateRelease(valid(), options).additional.instagram, 'not_claimed_active'));
test('claiming another network active requires evidence', () => { const r = valid(); r.social.instagram = { claimed_active: true }; assert.equal(evaluateRelease(r, options).additional.instagram, 'unverified'); });
test('an old project must not be used accidentally', () => { const r = valid(); r.target.repository = 'allfredux/allai1'; assert.ok(evaluateRelease(r, options).blockers.includes('target.repository')); });
test('rejects non-HTTPS origins', () => { const r = valid(); r.target.origin = 'http://example.invalid'; assert.ok(evaluateRelease(r, options).blockers.includes('target.origin')); });
