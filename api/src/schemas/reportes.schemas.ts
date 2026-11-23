import { z } from 'zod';

import { ESTADOS_CASO, paginacion } from './comunes.js';

/** GET /api/reportes?estado=&zona=&limite=&pagina= */
export const filtrosReportes = paginacion.extend({
  estado: z.enum(ESTADOS_CASO).optional(),
  zona: z.coerce.number().int().positive().optional(),
});
