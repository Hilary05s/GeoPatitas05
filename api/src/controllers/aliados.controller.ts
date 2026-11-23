import type { RequestHandler } from 'express';
import type { RowDataPacket } from 'mysql2';

import { pool } from '../lib/bd.js';
import { Filtros } from '../lib/consultas.js';
import { filtrosAliados } from '../schemas/aliados.schemas.js';

/**
 * GET /api/aliados — aliados activos con patrocinio vigente hoy
 * (sin fechas = vigente). Primero veterinarias, luego negocios, por nombre.
 * Filtro opcional: ?tipo=veterinaria|negocio
 */
export const listarAliados: RequestHandler = async (req, res) => {
  const q = filtrosAliados.parse(req.query);

  const filtros = new Filtros()
    .agregar('activo = 1')
    .agregar('(patrocinio_inicio IS NULL OR patrocinio_inicio <= CURDATE())')
    .agregar('(patrocinio_fin IS NULL OR patrocinio_fin >= CURDATE())');
  if (q.tipo) filtros.agregar('tipo = ?', q.tipo);

  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT id, nombre, tipo, direccion, telefono, logo_url, promocion,
            patrocinio_inicio, patrocinio_fin, activo, creado_en
       FROM aliados
       ${filtros.where()}
      ORDER BY tipo = 'veterinaria' DESC, nombre ASC`,
    filtros.valores,
  );
  res.json(filas);
};
