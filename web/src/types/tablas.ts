/**
 * Filas de las TABLAS de la base `geopatitas` (api/sql/geopatitas.sql).
 *
 * ⚠️ Privacidad: las páginas públicas deben usar las VISTAS (ver vistas.ts),
 * que no traen contacto, ip_hash ni reportes sin aprobar. Las tablas completas
 * son para el panel de moderación (con login).
 */
import type {
  AccionModeracion,
  BoolBD,
  Edad,
  EstadoAdopcion,
  EstadoCaso,
  EstadoModeracion,
  Fecha,
  FechaHora,
  Id,
  MotivoModeracion,
  RolModerador,
  Salud,
  Sexo,
  Tamano,
  TipoAliado,
  TipoAviso,
} from './comunes';

/** Tabla `zonas`: zonas aproximadas de la ciudad (centro del círculo en el mapa). */
export interface Zona {
  id: Id;
  nombre: string;
  /** DECIMAL(9,6): latitud del CENTRO de la zona, no de un reporte. */
  lat_centro: number;
  /** DECIMAL(9,6): longitud del CENTRO de la zona, no de un reporte. */
  lng_centro: number;
  activa: BoolBD;
}

/** Tabla `reportes`: perritos reportados por la ciudadanía. */
export interface Reporte {
  id: Id;
  zona_id: Id;
  nombre: string | null;
  raza_aprox: string | null;
  color: string;
  tamano: Tamano;
  es_cachorro: BoolBD;
  salud: Salud;
  descripcion: string | null;
  fecha_avistamiento: Fecha;
  foto_url: string | null;
  /** Id de la foto en el servicio de imágenes (p. ej. public_id de Cloudinary), para poder borrarla. */
  foto_id: string | null;
  /** Contacto de quien reporta. PRIVADO: nunca se publica. */
  contacto: string | null;
  /** Hash de la IP (anti-spam). PRIVADO. */
  ip_hash: string | null;
  estado_moderacion: EstadoModeracion;
  estado_caso: EstadoCaso;
  /** Si es duplicado, id del reporte original. */
  duplicado_de: Id | null;
  creado_en: FechaHora;
  actualizado_en: FechaHora;
}

/** Tabla `seguimiento`: historial de cambios de estado de un caso (línea de tiempo de la ficha). */
export interface Seguimiento {
  id: Id;
  reporte_id: Id;
  moderador_id: Id | null;
  estado_anterior: EstadoCaso | null;
  estado_nuevo: EstadoCaso;
  nota: string | null;
  creado_en: FechaHora;
}

/** Tabla `adopciones`: perritos en adopción ("SE BUSCA HOGAR"). */
export interface Adopcion {
  id: Id;
  /** Reporte de origen, si el perrito llegó por un reporte. */
  reporte_id: Id | null;
  nombre: string;
  sexo: Sexo;
  edad: Edad;
  tamano: Tamano;
  descripcion: string | null;
  foto_url: string | null;
  foto_id: string | null;
  /** Persona u organización que lo publica. */
  responsable: string;
  contacto_responsable: string;
  estado: EstadoAdopcion;
  estado_moderacion: EstadoModeracion;
  creado_en: FechaHora;
  actualizado_en: FechaHora;
}

/** Tabla `aliados`: veterinarias y negocios patrocinadores. */
export interface Aliado {
  id: Id;
  nombre: string;
  tipo: TipoAliado;
  direccion: string | null;
  telefono: string | null;
  logo_url: string | null;
  promocion: string | null;
  patrocinio_inicio: Fecha | null;
  patrocinio_fin: Fecha | null;
  activo: BoolBD;
  creado_en: FechaHora;
}

/** Tabla `avisos`: mensajes de la ciudadanía ("Quiero ayudar", "Ya fue atendido", "Quiero ser aliado"). */
export interface Aviso {
  id: Id;
  tipo: TipoAviso;
  reporte_id: Id | null;
  mensaje: string | null;
  contacto: string;
  ip_hash: string | null;
  revisado: BoolBD;
  creado_en: FechaHora;
}

/**
 * Tabla `moderadores`, SIN `password_hash`.
 * La columna password_hash existe en la base pero la API NUNCA debe enviarla al frontend.
 */
export interface Moderador {
  id: Id;
  nombre: string;
  correo: string;
  rol: RolModerador;
  activo: BoolBD;
  creado_en: FechaHora;
}

/**
 * Tabla `moderaciones`: bitácora de aprobaciones/eliminaciones.
 * Regla de la base: se modera un reporte O una adopción (nunca ambos),
 * y `motivo` es obligatorio cuando accion = 'eliminar'.
 */
export interface Moderacion {
  id: Id;
  reporte_id: Id | null;
  adopcion_id: Id | null;
  moderador_id: Id;
  accion: AccionModeracion;
  motivo: MotivoModeracion | null;
  nota: string | null;
  creado_en: FechaHora;
}
