import { respond } from '../lib/responses.mjs';
// This gate is not authentication. Replace it only with a tested private runtime.
export default {
  fetch(request) {
    return respond(request, {
      status: 503,
      body: 'KAJON — Configuración en curso.\n\nAcceso cerrado. Este despliegue solo prepara el alojamiento.\nLa aplicación, el inicio de sesión y las conexiones sociales todavía no están activos.\n'
    });
  }
};
