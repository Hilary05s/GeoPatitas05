import { Router } from 'express';

import {
  crearReporte,
  listarReportes,
  listarSeguimiento,
  obtenerReporte,
} from '../controllers/reportes.controller.js';
import { limiteReportes } from '../middlewares/limites.js';
import { subirFotoOpcional } from '../middlewares/subida.js';

export const reportesRouter = Router();

reportesRouter.get('/', listarReportes);
reportesRouter.get('/:id', obtenerReporte);
reportesRouter.get('/:id/seguimiento', listarSeguimiento);

// Crear reporte: límite de peticiones → foto opcional (multipart) → validar y guardar
reportesRouter.post('/', limiteReportes, subirFotoOpcional, crearReporte);
