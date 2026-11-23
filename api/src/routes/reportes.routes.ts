import { Router } from 'express';

import { cambiarEstado } from '../controllers/moderacion.controller.js';
import {
  crearReporte,
  listarReportes,
  listarSeguimiento,
  obtenerReporte,
} from '../controllers/reportes.controller.js';
import { requiereModerador } from '../middlewares/auth.js';
import { limiteReportes } from '../middlewares/limites.js';
import { subirFotoOpcional } from '../middlewares/subida.js';

export const reportesRouter = Router();

// Públicas
reportesRouter.get('/', listarReportes);
reportesRouter.get('/:id', obtenerReporte);
reportesRouter.get('/:id/seguimiento', listarSeguimiento);

// Crear reporte: límite de peticiones → foto opcional (multipart) → validar y guardar
reportesRouter.post('/', limiteReportes, subirFotoOpcional, crearReporte);

// Solo moderadores: cambiar el estado del caso (se registra en `seguimiento`)
reportesRouter.patch('/:id/estado', requiereModerador, cambiarEstado);
