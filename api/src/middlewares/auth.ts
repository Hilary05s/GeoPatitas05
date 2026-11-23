import type { RequestHandler, Response } from 'express';
import type { RowDataPacket } from 'mysql2';

import { verificarToken } from '../lib/auth.js';
import { pool } from '../lib/bd.js';
import type { ModeradorSesion } from '../types/express.js';

function rechazar(res: Response, mensaje: string) {
  res.set('WWW-Authenticate', 'Bearer');
  res.status(401).json({ mensaje });
}

/**
 * Protege una ruta: exige "Authorization: Bearer <token>" con un JWT válido
 * de un moderador que siga ACTIVO en la base (si se desactiva, su token deja
 * de servir de inmediato aunque no haya vencido).
 * Deja los datos del moderador en `req.moderador`.
 */
export const requiereModerador: RequestHandler = async (req, res, next) => {
  const [esquema, token] = (req.get('Authorization') ?? '').split(' ');
  if (esquema !== 'Bearer' || !token) {
    rechazar(res, 'Necesitas iniciar sesión');
    return;
  }

  const verificacion = verificarToken(token);
  if (!verificacion.ok) {
    rechazar(res, verificacion.motivo === 'expirado' ? 'Tu sesión expiró. Inicia sesión de nuevo.' : 'Sesión inválida');
    return;
  }

  const [filas] = await pool.query<RowDataPacket[]>(
    'SELECT id, nombre, correo, rol, activo, creado_en FROM moderadores WHERE id = ? AND activo = 1',
    [Number(verificacion.datos.sub)],
  );
  const moderador = filas[0] as ModeradorSesion | undefined;
  if (!moderador) {
    rechazar(res, 'Sesión inválida');
    return;
  }

  req.moderador = moderador;
  next();
};
