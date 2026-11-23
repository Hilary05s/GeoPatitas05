/**
 * Filas de las VISTAS de la base `geopatitas` (api/sql/geopatitas.sql).
 * Son las que deben usar las páginas públicas: solo traen datos aprobados
 * y sin información privada.
 */
import type { BoolBD, Edad, EstadoAdopcion, EstadoCaso, Fecha, FechaHora, Id, Salud, Sexo, Tamano } from './comunes';

/**
 * Vista `v_reportes_publicos`: reportes APROBADOS con su zona.
 * Para el mapa, la lista, las tarjetas y la ficha.
 * Las coordenadas son las del CENTRO DE LA ZONA, nunca las del perrito.
 */
export interface ReportePublico {
  id: Id;
  /** Id con ceros a la izquierda: 7 → "0007". */
  folio: string;
  nombre: string | null;
  raza_aprox: string | null;
  color: string;
  tamano: Tamano;
  es_cachorro: BoolBD;
  salud: Salud;
  descripcion: string | null;
  fecha_avistamiento: Fecha;
  foto_url: string | null;
  estado_caso: EstadoCaso;
  creado_en: FechaHora;
  zona_id: Id;
  /** Nombre de la zona, p. ej. "Centro". */
  zona: string;
  lat_centro: number;
  lng_centro: number;
}

/** Vista `v_adopciones_publicas`: adopciones aprobadas que aún no han sido adoptadas. */
export interface AdopcionPublica {
  id: Id;
  nombre: string;
  sexo: Sexo;
  edad: Edad;
  tamano: Tamano;
  descripcion: string | null;
  foto_url: string | null;
  estado: Exclude<EstadoAdopcion, 'adoptado'>;
  creado_en: FechaHora;
}

/**
 * Vista `v_estadisticas`: cifras de la portada (una sola fila).
 * casos_atendidos y reportes_semana son SUM(): llegan como null si todavía
 * no hay reportes aprobados.
 */
export interface Estadisticas {
  perritos_reportados: number;
  casos_atendidos: number | null;
  reportes_semana: number | null;
}

/** Vista `v_reportes_por_zona`: conteo de reportes aprobados por zona (incluye zonas con 0). */
export interface ReportesPorZona {
  /** Id de la zona. */
  id: Id;
  /** Nombre de la zona. */
  nombre: string;
  total: number;
  necesitan_ayuda: number;
  /** Reportes con salud herido, enfermo o en_peligro. */
  urgentes: number;
}
