/**
 * Tipos básicos y ENUM de la base `geopatitas` (api/sql/geopatitas.sql).
 *
 * Cómo llegan los datos de MySQL al frontend (mysql2 → JSON):
 * - INT, COUNT(), DECIMAL → number  (la API usa `decimalNumbers: true`).
 * - TINYINT(1)            → 0 | 1   (NO true/false).
 * - DATETIME / DATE       → string ISO (mysql2 los convierte a Date y JSON los vuelve texto).
 *   ⚠️ Las columnas DATE pueden llegar corridas un día por la zona horaria
 *   (ej. "2026-11-21T06:00:00.000Z"). Ver docs/API.md → "Fechas".
 */

/** Id numérico autoincremental (INT UNSIGNED). */
export type Id = number;

/** TINYINT(1) de MySQL: 0 = no, 1 = sí. */
export type BoolBD = 0 | 1;

/** DATETIME serializado como texto ISO 8601. */
export type FechaHora = string;

/** DATE serializado como texto (ver advertencia de zona horaria arriba). */
export type Fecha = string;

// ---------- ENUM compartidos ----------

/** reportes.tamano, adopciones.tamano */
export type Tamano = 'pequeno' | 'mediano' | 'grande';

/** reportes.salud */
export type Salud = 'sano' | 'herido' | 'enfermo' | 'desnutrido' | 'en_peligro';

/** reportes.estado_caso, seguimiento.estado_anterior / estado_nuevo. Define el color en el mapa. */
export type EstadoCaso = 'necesita_ayuda' | 'en_seguimiento' | 'atendido';

/** reportes.estado_moderacion, adopciones.estado_moderacion */
export type EstadoModeracion = 'pendiente' | 'aprobado' | 'eliminado';

/** adopciones.sexo */
export type Sexo = 'hembra' | 'macho' | 'desconocido';

/** adopciones.edad */
export type Edad = 'cachorro' | 'adulto' | 'mayor';

/** adopciones.estado */
export type EstadoAdopcion = 'disponible' | 'en_proceso' | 'adoptado';

/** aliados.tipo */
export type TipoAliado = 'veterinaria' | 'negocio';

/** avisos.tipo — "Quiero ayudar", "Ya fue atendido", "Quiero ser aliado". */
export type TipoAviso = 'ayuda' | 'atendido' | 'aliado';

/** moderaciones.accion */
export type AccionModeracion = 'aprobar' | 'eliminar';

/** moderaciones.motivo (obligatorio cuando accion = 'eliminar') */
export type MotivoModeracion = 'falso' | 'duplicado' | 'ofensivo' | 'fuera_de_tema' | 'otro';

/** moderadores.rol */
export type RolModerador = 'admin' | 'moderador';
