import { z } from 'zod';

import { TIPOS_ALIADO } from './comunes.js';

/** GET /api/aliados?tipo= */
export const filtrosAliados = z.object({
  tipo: z.enum(TIPOS_ALIADO).optional(),
});
