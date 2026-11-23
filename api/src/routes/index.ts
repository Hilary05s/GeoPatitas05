import { Router } from 'express';

import { authRouter } from './auth.routes.js';
import { publicasRouter } from './publicas.routes.js';
import { reportesRouter } from './reportes.routes.js';
import { zonasRouter } from './zonas.routes.js';

/** Todas las rutas de la API, montadas bajo /api en app.ts. */
export const rutas = Router();

rutas.get('/', (_req, res) => {
  res.json({ mensaje: 'GeoPatitas API funcionando' });
});

rutas.use('/zonas', zonasRouter);
rutas.use('/reportes', reportesRouter);
rutas.use('/auth', authRouter);
rutas.use('/', publicasRouter); // /adopciones, /aliados, /estadisticas
