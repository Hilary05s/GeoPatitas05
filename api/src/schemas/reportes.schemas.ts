import { z } from 'zod';

import { ESTADOS_CASO, SALUDES, TAMANOS, paginacion } from './comunes.js';

/** GET /api/reportes?estado=&zona=&limite=&pagina= */
export const filtrosReportes = paginacion.extend({
  estado: z.enum(ESTADOS_CASO).optional(),
  zona: z.coerce.number().int().positive().optional(),
});

// ---------- POST /api/reportes ----------

/** Texto opcional: recorta espacios y convierte "" en undefined (los formularios mandan ""). */
const textoOpcional = (maximo: number) =>
  z.preprocess(
    (valor) => (typeof valor === 'string' && valor.trim() === '' ? undefined : valor),
    z.string().trim().max(maximo).optional(),
  );

/** Acepta true/false, 1/0 y "true"/"false"/"1"/"0"/"on" (multipart manda texto). Devuelve 0 o 1. */
const booleanoBD = z
  .union([z.boolean(), z.literal(0), z.literal(1), z.enum(['true', 'false', '1', '0', 'on'])])
  .optional()
  .transform((valor) => (valor === true || valor === 1 || valor === 'true' || valor === '1' || valor === 'on' ? 1 : 0));

/** Fecha de hoy (hora del servidor) en formato AAAA-MM-DD. */
function hoyLocal(desfaseDias = 0) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + desfaseDias);
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mm}-${dd}`;
}

const fechaAvistamiento = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato AAAA-MM-DD')
  .refine((valor) => {
    const fecha = new Date(`${valor}T00:00:00`);
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(valor.slice(0, 7));
  }, 'Fecha inválida')
  // +1 día de tolerancia por diferencias de zona horaria entre el celular y el servidor
  .refine((valor) => valor <= hoyLocal(1), 'La fecha no puede ser futura')
  .refine((valor) => valor >= hoyLocal(-365), 'La fecha no puede tener más de un año');

/**
 * Cuerpo de un reporte nuevo (JSON o campos de un formulario multipart).
 * strictObject: cualquier campo no listado (lat, lng, ubicacion, estado_moderacion…)
 * se RECHAZA con 400. Así nunca se aceptan coordenadas exactas ni se puede
 * publicar un reporte saltándose la moderación.
 */
export const crearReporte = z.strictObject({
  zona_id: z.coerce.number().int().positive(),
  nombre: textoOpcional(60),
  raza_aprox: textoOpcional(60),
  color: z.string().trim().min(1, 'Es obligatorio').max(60),
  tamano: z.enum(TAMANOS),
  es_cachorro: booleanoBD,
  salud: z.enum(SALUDES),
  descripcion: textoOpcional(2000),
  fecha_avistamiento: fechaAvistamiento,
  /** Contacto de quien reporta: opcional y PRIVADO (nunca se publica). */
  contacto: textoOpcional(150),
});

export type NuevoReporte = z.infer<typeof crearReporte>;
