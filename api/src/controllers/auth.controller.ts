import type { RequestHandler } from 'express';
import type { RowDataPacket } from 'mysql2';

import { compararPassword, firmarToken } from '../lib/auth.js';
import { pool } from '../lib/bd.js';
import { ErrorHttp } from '../lib/errores.js';
import { login as esquemaLogin } from '../schemas/auth.schemas.js';

/**
 * POST /api/auth/login — { correo, password } → { token, expira_en, moderador }
 * Siempre responde el mismo mensaje si falla (no revela si el correo existe,
 * si la contraseña está mal o si la cuenta está desactivada).
 */
export const iniciarSesion: RequestHandler = async (req, res) => {
  const { correo, password } = esquemaLogin.parse(req.body ?? {});

  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT id, nombre, correo, password_hash, rol, activo, creado_en
       FROM moderadores
      WHERE correo = ?`,
    [correo],
  );
  const fila = filas[0];

  const passwordCorrecta = await compararPassword(password, fila?.password_hash as string | undefined);
  if (!fila || !passwordCorrecta || fila.activo !== 1) {
    throw new ErrorHttp(401, 'Correo o contraseña incorrectos');
  }

  const { token, expira_en } = firmarToken({ id: fila.id, rol: fila.rol });
  res.json({
    token,
    expira_en,
    // Nunca se envía password_hash
    moderador: {
      id: fila.id,
      nombre: fila.nombre,
      correo: fila.correo,
      rol: fila.rol,
      activo: fila.activo,
      creado_en: fila.creado_en,
    },
  });
};

/** GET /api/auth/yo — datos del moderador dueño del token (para saber si la sesión sigue viva). */
export const quienSoy: RequestHandler = (req, res) => {
  res.json(req.moderador);
};
