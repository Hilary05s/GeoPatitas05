import { z } from 'zod';

import { EDADES, SEXOS, TAMANOS, paginacion } from './comunes.js';

/** GET /api/adopciones?tamano=&edad=&sexo=&limite=&pagina= */
export const filtrosAdopciones = paginacion.extend({
  tamano: z.enum(TAMANOS).optional(),
  edad: z.enum(EDADES).optional(),
  sexo: z.enum(SEXOS).optional(),
});
