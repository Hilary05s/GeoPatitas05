import type { RequestHandler } from 'express';
import type { RowDataPacket } from 'mysql2';

import { pool } from '../lib/bd.js';
import { Filtros } from '../lib/consultas.js';
import { desplazamiento } from '../schemas/comunes.js';
import { filtrosAdopciones } from '../schemas/adopciones.schemas.js';

/**
 * GET /api/adopciones — perritos en adopción aprobados y todavía no adoptados
 * (vista v_adopciones_publicas; no incluye responsable ni su contacto).
 * Filtros: ?tamano= &edad= &sexo= &limite= &pagina= · Total en X-Total-Count.
 */
export const listarAdopciones: RequestHandler = async (req, res) => {
  const q = filtrosAdopciones.parse(req.query);

  const filtros = new Filtros();
  if (q.tamano) filtros.agregar('tamano = ?', q.tamano);
  if (q.edad) filtros.agregar('edad = ?', q.edad);
  if (q.sexo) filtros.agregar('sexo = ?', q.sexo);

  const [[conteo]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM v_adopciones_publicas ${filtros.where()}`,
    filtros.valores,
  );
  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT id, nombre, sexo, edad, tamano, descripcion, foto_url, estado, creado_en
       FROM v_adopciones_publicas
       ${filtros.where()}
      ORDER BY creado_en DESC, id DESC
      LIMIT ? OFFSET ?`,
    [...filtros.valores, q.limite, desplazamiento(q)],
  );

  res.set('X-Total-Count', String(conteo?.total ?? 0));
  res.json(filas);
};
