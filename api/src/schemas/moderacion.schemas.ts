import { z } from 'zod';

import { ESTADOS_CASO, MOTIVOS_MODERACION, paginacion, textoOpcional } from './comunes.js';

/** GET /api/moderacion/pendientes?limite=&pagina= */
export const filtrosPendientes = paginacion;

/** PATCH /api/moderacion/reportes/:id/aprobar — cuerpo opcional. Nota interna (no se publica). */
export const aprobarReporte = z.strictObject({
  nota: textoOpcional(255),
});

/**
 * PATCH /api/moderacion/reportes/:id/eliminar
 * El esquema exige motivo al eliminar (CHECK chk_moderaciones_motivo).
 * duplicado_de solo tiene sentido con motivo "duplicado".
 */
export const eliminarReporte = z
  .strictObject({
    motivo: z.enum(MOTIVOS_MODERACION),
    nota: textoOpcional(255),
    duplicado_de: z.coerce.number().int().positive().optional(),
  })
  .refine((datos) => datos.duplicado_de === undefined || datos.motivo === 'duplicado', {
    path: ['duplicado_de'],
    message: 'Solo se indica cuando el motivo es "duplicado"',
  });

/**
 * PATCH /api/reportes/:id/estado
 * ⚠️ La nota queda en `seguimiento` y SE PUBLICA en la línea de tiempo de la ficha.
 */
export const cambiarEstado = z.strictObject({
  estado_nuevo: z.enum(ESTADOS_CASO),
  nota: textoOpcional(255),
});
