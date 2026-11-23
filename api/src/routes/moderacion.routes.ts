import { Router } from 'express';

import { aprobarReporte, eliminarReporte, listarPendientes } from '../controllers/moderacion.controller.js';
import { requiereModerador } from '../middlewares/auth.js';

/** /api/moderacion — TODAS las rutas exigen sesión de moderador (JWT). */
export const moderacionRouter = Router();

moderacionRouter.use(requiereModerador);

moderacionRouter.get('/pendientes', listarPendientes);
moderacionRouter.patch('/reportes/:id/aprobar', aprobarReporte);
moderacionRouter.patch('/reportes/:id/eliminar', eliminarReporte);
