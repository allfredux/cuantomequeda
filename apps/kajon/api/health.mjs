import { respond } from '../lib/responses.mjs';
// Liveness is deliberately separate from application readiness.
export default {
  fetch(request) {
    return respond(request, {
      status: 200,
      type: 'application/json; charset=utf-8',
      body: JSON.stringify({ service: 'kajon', bootstrapVersion: '0.0.1', status: 'setup_required', ready: false })
    });
  }
};
