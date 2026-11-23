import { Router } from 'express';

import { zonasRouter } from './zonas.routes.js';

/** Todas las rutas de la API, montadas bajo /api en app.ts. */
export const rutas = Router();

rutas.get('/', (_req, res) => {
  res.json({ mensaje: 'GeoPatitas API funcionando' });
});

rutas.use('/zonas', zonasRouter);
