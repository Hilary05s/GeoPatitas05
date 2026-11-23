/**
 * Formas de las RESPUESTAS de la API que no son exactamente una tabla o vista.
 * Detalle de cada endpoint en docs/API.md.
 */
import type { FechaHora } from './comunes';
import type { Moderador, Reporte, Seguimiento } from './tablas';

// ---------- Seguimiento público ----------

/**
 * GET /api/reportes/:id/seguimiento → SeguimientoPublico[]
 * Línea de tiempo del caso en la ficha. No incluye `moderador_id`: no se publica
 * quién del equipo hizo el cambio.
 * ⚠️ `nota` es PÚBLICA (la escribe el moderador al cambiar el estado).
 */
export type SeguimientoPublico = Omit<Seguimiento, 'moderador_id'>;

// ---------- Login ----------

/** POST /api/auth/login — cuerpo que se envía. */
export interface CredencialesLogin {
  correo: string;
  password: string;
}

/** POST /api/auth/login — respuesta (200). */
export interface RespuestaLogin {
  /** JWT para mandar como "Authorization: Bearer <token>" (src/lib/api.ts → opción `token`). */
  token: string;
  /** Cuándo vence la sesión (ISO). Después de esta fecha la API responde 401. */
  expira_en: FechaHora;
  /** Moderador que inició sesión (sin password_hash). También lo devuelve GET /api/auth/yo. */
  moderador: Moderador;
}

// ---------- Moderación ----------

/**
 * GET /api/moderacion/pendientes → ReportePendiente[]  (requiere login)
 * Reporte pendiente de revisión. Incluye `contacto` (PRIVADO: solo para el equipo),
 * pero nunca `ip_hash` ni `foto_id`.
 */
export interface ReportePendiente
  extends Omit<Reporte, 'ip_hash' | 'foto_id' | 'estado_moderacion' | 'actualizado_en'> {
  /** Id con ceros a la izquierda, mínimo 4 dígitos: 7 → "0007". */
  folio: string;
  /** Nombre de la zona, p. ej. "Centro". */
  zona: string;
  /** Reportes enviados desde la misma IP en las últimas 24 h (pista de spam; la IP no se revela). */
  envios_misma_ip_24h: number;
}
