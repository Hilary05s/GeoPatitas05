import type { RequestHandler } from 'express';
import type { RowDataPacket } from 'mysql2';

import { pool } from '../lib/bd.js';
import { Filtros } from '../lib/consultas.js';
import { ErrorHttp } from '../lib/errores.js';
import { desplazamiento, idParam } from '../schemas/comunes.js';
import { filtrosReportes } from '../schemas/reportes.schemas.js';

/**
 * Columnas PÚBLICAS de un reporte (vista v_reportes_publicos).
 * La vista ya excluye contacto, ip_hash, foto_id y los reportes no aprobados.
 * Las coordenadas son las del CENTRO DE LA ZONA, nunca las del perrito.
 */
const COLUMNAS_PUBLICAS = `
  id, folio, nombre, raza_aprox, color, tamano, es_cachorro, salud, descripcion,
  fecha_avistamiento, foto_url, estado_caso, creado_en,
  zona_id, zona, lat_centro, lng_centro`;

/**
 * GET /api/reportes — reportes aprobados, del más nuevo al más viejo.
 * Filtros: ?estado=necesita_ayuda|en_seguimiento|atendido &zona=<id> &limite= &pagina=
 * El total (para paginar) va en la cabecera X-Total-Count.
 */
export const listarReportes: RequestHandler = async (req, res) => {
  const q = filtrosReportes.parse(req.query);

  const filtros = new Filtros();
  if (q.estado) filtros.agregar('estado_caso = ?', q.estado);
  if (q.zona) filtros.agregar('zona_id = ?', q.zona);

  const [[conteo]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM v_reportes_publicos ${filtros.where()}`,
    filtros.valores,
  );
  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT ${COLUMNAS_PUBLICAS}
       FROM v_reportes_publicos
       ${filtros.where()}
      ORDER BY creado_en DESC, id DESC
      LIMIT ? OFFSET ?`,
    [...filtros.valores, q.limite, desplazamiento(q)],
  );

  res.set('X-Total-Count', String(conteo?.total ?? 0));
  res.json(filas);
};

/** Busca un reporte aprobado o lanza 404. */
async function buscarReportePublico(id: number) {
  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT ${COLUMNAS_PUBLICAS} FROM v_reportes_publicos WHERE id = ?`,
    [id],
  );
  const reporte = filas[0];
  if (!reporte) throw new ErrorHttp(404, 'Reporte no encontrado');
  return reporte;
}

/** GET /api/reportes/:id — un reporte aprobado (404 si no existe o no está aprobado). */
export const obtenerReporte: RequestHandler = async (req, res) => {
  const { id } = idParam.parse(req.params);
  res.json(await buscarReportePublico(id));
};

/**
 * GET /api/reportes/:id/seguimiento — historial del caso (línea de tiempo de la ficha).
 * No incluye moderador_id: no se publica quién del equipo hizo el cambio.
 */
export const listarSeguimiento: RequestHandler = async (req, res) => {
  const { id } = idParam.parse(req.params);
  await buscarReportePublico(id); // 404 si no es público

  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT id, reporte_id, estado_anterior, estado_nuevo, nota, creado_en
       FROM seguimiento
      WHERE reporte_id = ?
      ORDER BY creado_en ASC, id ASC`,
    [id],
  );
  res.json(filas);
};
