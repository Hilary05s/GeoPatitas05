import { rateLimit } from 'express-rate-limit';

/**
 * Límites de peticiones por IP (en memoria: se reinician al reiniciar la API).
 * Responden 429 con JSON { mensaje } y las cabeceras estándar RateLimit-*.
 */

/** Límite general para toda la API: 300 peticiones cada 15 minutos por IP. */
export const limiteGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { mensaje: 'Demasiadas peticiones. Espera unos minutos e intenta de nuevo.' },
});

/**
 * POST /api/reportes: 5 reportes cada 10 minutos por IP (evita ráfagas).
 * Además, el controlador limita los reportes por IP en 24 h contando en la base
 * (MAX_REPORTES_POR_IP_DIA), que no se reinicia al reiniciar la API.
 */
export const limiteReportes = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { mensaje: 'Enviaste varios reportes seguidos. Espera unos minutos para enviar otro.' },
});
