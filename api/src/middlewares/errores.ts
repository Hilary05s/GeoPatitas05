import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

import { esProduccion } from '../lib/config.js';
import { ErrorHttp } from '../lib/errores.js';

/** 404 para cualquier ruta que no exista. Va después de montar todas las rutas. */
export const rutaNoEncontrada: RequestHandler = (req, res) => {
  res.status(404).json({ mensaje: `No existe la ruta ${req.method} ${req.path}` });
};

/** Códigos de mysql2 que significan "la base no está disponible". */
const ERRORES_CONEXION_BD = new Set([
  'ECONNREFUSED',
  'ETIMEDOUT',
  'PROTOCOL_CONNECTION_LOST',
  'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR',
]);

/**
 * Manejo de errores centralizado. Siempre responde JSON { mensaje, campos? }
 * y NUNCA envía al cliente detalles internos (SQL, rutas, stack).
 * El detalle completo solo se imprime en la consola del servidor.
 */
export const manejadorErrores: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  // Errores esperados lanzados por los controladores
  if (error instanceof ErrorHttp) {
    res.status(error.status).json({ mensaje: error.message });
    return;
  }

  // Validación con zod → 400 con el detalle de cada campo
  if (error instanceof ZodError) {
    const campos: Record<string, string> = {};
    for (const problema of error.issues) {
      const campo = problema.path.join('.') || '_';
      campos[campo] ??= problema.message;
    }
    res.status(400).json({ mensaje: 'Datos inválidos', campos });
    return;
  }

  // Errores de express.json (cuerpo mal formado o demasiado grande)
  const tipo = (error as { type?: string }).type;
  if (tipo === 'entity.parse.failed') {
    res.status(400).json({ mensaje: 'El cuerpo de la petición no es JSON válido' });
    return;
  }
  if (tipo === 'entity.too.large') {
    res.status(413).json({ mensaje: 'La petición es demasiado grande' });
    return;
  }

  // MySQL apagado o credenciales incorrectas
  const codigo = (error as { code?: string }).code;
  if (codigo && ERRORES_CONEXION_BD.has(codigo)) {
    console.error(`[BD] ${req.method} ${req.originalUrl}: ${codigo}`);
    res.status(503).json({ mensaje: 'La base de datos no está disponible. Intenta más tarde.' });
    return;
  }

  // Cualquier otra cosa: error inesperado
  console.error(`[500] ${req.method} ${req.originalUrl}`, esProduccion ? (error as Error)?.message : error);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
};
