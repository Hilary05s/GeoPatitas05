import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { config } from './lib/config.js';
import { manejadorErrores, rutaNoEncontrada } from './middlewares/errores.js';
import { limiteGeneral } from './middlewares/limites.js';
import { rutas } from './routes/index.js';

/** Crea la aplicación Express con sus middlewares y rutas (sin encenderla). */
export function crearApp() {
  const app = express();

  // IP real cuando la API está detrás de un proxy (afecta al límite de peticiones)
  app.set('trust proxy', config.TRUST_PROXY);

  // Seguridad
  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGIN, // solo los orígenes de CORS_ORIGIN
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    }),
  );
  app.use('/api', limiteGeneral);

  // Cuerpo JSON (las fotos llegan por multipart y las procesa multer en su ruta)
  app.use(express.json({ limit: '100kb' }));

  // Rutas
  app.use('/api', rutas);

  // 404 y errores: siempre al final
  app.use(rutaNoEncontrada);
  app.use(manejadorErrores);

  return app;
}
