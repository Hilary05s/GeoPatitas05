import { Router } from 'express';

import { listarReportes, listarSeguimiento, obtenerReporte } from '../controllers/reportes.controller.js';

export const reportesRouter = Router();

reportesRouter.get('/', listarReportes);
reportesRouter.get('/:id', obtenerReporte);
reportesRouter.get('/:id/seguimiento', listarSeguimiento);
