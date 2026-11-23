import type { RequestHandler } from 'express';
import type { RowDataPacket } from 'mysql2';

import { pool } from '../lib/bd.js';

/**
 * GET /api/estadisticas — cifras de la portada (vista v_estadisticas).
 * Las SUM() de la vista valen NULL si no hay reportes aprobados: se devuelven como 0.
 */
export const obtenerEstadisticas: RequestHandler = async (_req, res) => {
  const [[fila]] = await pool.query<RowDataPacket[]>(
    `SELECT perritos_reportados,
            COALESCE(casos_atendidos, 0) AS casos_atendidos,
            COALESCE(reportes_semana, 0) AS reportes_semana
       FROM v_estadisticas`,
  );
  res.json({
    perritos_reportados: Number(fila?.perritos_reportados ?? 0),
    casos_atendidos: Number(fila?.casos_atendidos ?? 0),
    reportes_semana: Number(fila?.reportes_semana ?? 0),
  });
};
