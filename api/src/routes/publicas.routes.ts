import { Router } from 'express';

import { listarAdopciones } from '../controllers/adopciones.controller.js';
import { listarAliados } from '../controllers/aliados.controller.js';
import { obtenerEstadisticas } from '../controllers/estadisticas.controller.js';

/** Rutas públicas de solo lectura con un único endpoint cada una. */
export const publicasRouter = Router();

publicasRouter.get('/adopciones', listarAdopciones);
publicasRouter.get('/aliados', listarAliados);
publicasRouter.get('/estadisticas', obtenerEstadisticas);
