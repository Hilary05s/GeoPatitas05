import { z } from 'zod';

/** POST /api/auth/login */
export const login = z.strictObject({
  correo: z.string().trim().toLowerCase().max(150).pipe(z.email('Correo inválido')),
  password: z.string().min(1, 'Es obligatoria').max(200),
});
