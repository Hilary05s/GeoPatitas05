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
