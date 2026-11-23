import type { RequestHandler } from 'express';

import { pool } from '../lib/bd.js';

/** GET /api/zonas — zonas activas con el CENTRO aproximado de cada una. */
export const listarZonas: RequestHandler = async (_req, res) => {
  const [filas] = await pool.query(
    `SELECT id, nombre, lat_centro, lng_centro, activa
       FROM zonas
      WHERE activa = 1
      ORDER BY id`,
  );
  res.json(filas);
};
