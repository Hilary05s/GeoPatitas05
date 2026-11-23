import { Router } from 'express';

import { iniciarSesion, quienSoy } from '../controllers/auth.controller.js';
import { requiereModerador } from '../middlewares/auth.js';
import { limiteLogin } from '../middlewares/limites.js';

export const authRouter = Router();

authRouter.post('/login', limiteLogin, iniciarSesion);
authRouter.get('/yo', requiereModerador, quienSoy);
