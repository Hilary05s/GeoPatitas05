import { Router } from 'express';

import { listarZonas } from '../controllers/zonas.controller.js';

export const zonasRouter = Router();

zonasRouter.get('/', listarZonas);
