import type { Request, RequestHandler } from 'express';
import type { PoolConnection } from 'mysql2/promise';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

import { enTransaccion, pool } from '../lib/bd.js';
import { borrarFoto } from '../lib/cloudinary.js';
import { ErrorHttp } from '../lib/errores.js';
import { desplazamiento, idParam } from '../schemas/comunes.js';
import {
  aprobarReporte as esquemaAprobar,
  cambiarEstado as esquemaCambiarEstado,
  eliminarReporte as esquemaEliminar,
  filtrosPendientes,
} from '../schemas/moderacion.schemas.js';

/** Id del moderador autenticado (lo deja requiereModerador). */
function idModerador(req: Request) {
  if (!req.moderador) throw new ErrorHttp(401, 'Necesitas iniciar sesión');
  return req.moderador.id;
}

interface FilaReporte extends RowDataPacket {
  id: number;
  estado_moderacion: 'pendiente' | 'aprobado' | 'eliminado';
  estado_caso: 'necesita_ayuda' | 'en_seguimiento' | 'atendido';
  foto_id: string | null;
}

/** Lee y BLOQUEA la fila del reporte hasta terminar la transacción (evita dos moderaciones a la vez). */
async function bloquearReporte(conexion: PoolConnection, id: number) {
  const [filas] = await conexion.query<FilaReporte[]>(
    'SELECT id, estado_moderacion, estado_caso, foto_id FROM reportes WHERE id = ? FOR UPDATE',
    [id],
  );
  const reporte = filas[0];
  if (!reporte) throw new ErrorHttp(404, 'Reporte no encontrado');
  return reporte;
}

/**
 * GET /api/moderacion/pendientes — cola de reportes por revisar, del más antiguo al más nuevo.
 * Solo para el equipo: incluye `contacto` (privado), pero NUNCA ip_hash ni foto_id.
 * `envios_misma_ip_24h` ayuda a detectar spam sin revelar la IP.
 */
export const listarPendientes: RequestHandler = async (req, res) => {
  const q = filtrosPendientes.parse(req.query);

  const [[conteo]] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM reportes WHERE estado_moderacion = 'pendiente'",
  );
  const [filas] = await pool.query<RowDataPacket[]>(
    `SELECT r.id,
            LPAD(r.id, GREATEST(4, CHAR_LENGTH(r.id)), '0') AS folio,
            r.zona_id, z.nombre AS zona,
            r.nombre, r.raza_aprox, r.color, r.tamano, r.es_cachorro, r.salud, r.descripcion,
            r.fecha_avistamiento, r.foto_url, r.contacto, r.estado_caso, r.duplicado_de, r.creado_en,
            (SELECT COUNT(*) FROM reportes r2
              WHERE r2.ip_hash = r.ip_hash AND r2.creado_en >= NOW() - INTERVAL 1 DAY) AS envios_misma_ip_24h
       FROM reportes r
       JOIN zonas z ON z.id = r.zona_id
      WHERE r.estado_moderacion = 'pendiente'
      ORDER BY r.creado_en ASC, r.id ASC
      LIMIT ? OFFSET ?`,
    [q.limite, desplazamiento(q)],
  );

  res.set('X-Total-Count', String(conteo?.total ?? 0));
  res.json(filas);
};

/**
 * PATCH /api/moderacion/reportes/:id/aprobar — publica un reporte PENDIENTE.
 * Registra la acción en `moderaciones`.
 */
export const aprobarReporte: RequestHandler = async (req, res) => {
  const { id } = idParam.parse(req.params);
  const { nota } = esquemaAprobar.parse(req.body ?? {});
  const moderadorId = idModerador(req);

  await enTransaccion(async (con) => {
    const reporte = await bloquearReporte(con, id);
    if (reporte.estado_moderacion === 'aprobado') throw new ErrorHttp(409, 'El reporte ya está aprobado');
    if (reporte.estado_moderacion === 'eliminado') {
      throw new ErrorHttp(409, 'El reporte fue eliminado y no se puede aprobar');
    }

    await con.query("UPDATE reportes SET estado_moderacion = 'aprobado' WHERE id = ?", [id]);
    await con.query(
      "INSERT INTO moderaciones (reporte_id, moderador_id, accion, nota) VALUES (?, ?, 'aprobar', ?)",
      [id, moderadorId, nota ?? null],
    );
  });

  res.json({ id, estado_moderacion: 'aprobado' });
};

/**
 * PATCH /api/moderacion/reportes/:id/eliminar — { motivo, nota?, duplicado_de? }
 * Borrado LÓGICO (estado_moderacion = 'eliminado'): sirve para pendientes y para
 * reportes ya publicados. Registra la acción en `moderaciones`.
 * La foto se borra de Cloudinary y se quitan foto_url y foto_id. Si Cloudinary falla,
 * se conserva foto_id para poder reintentarlo y la respuesta lo avisa.
 */
export const eliminarReporte: RequestHandler = async (req, res) => {
  const { id } = idParam.parse(req.params);
  const { motivo, nota, duplicado_de } = esquemaEliminar.parse(req.body ?? {});
  const moderadorId = idModerador(req);

  const fotoId = await enTransaccion(async (con) => {
    const reporte = await bloquearReporte(con, id);
    if (reporte.estado_moderacion === 'eliminado') throw new ErrorHttp(409, 'El reporte ya está eliminado');

    if (duplicado_de !== undefined) {
      if (duplicado_de === id) {
        throw new ErrorHttp(400, 'Datos inválidos', { duplicado_de: 'Un reporte no puede ser duplicado de sí mismo' });
      }
      const [originales] = await con.query<RowDataPacket[]>(
        "SELECT id FROM reportes WHERE id = ? AND estado_moderacion <> 'eliminado'",
        [duplicado_de],
      );
      if (!originales[0]) {
        throw new ErrorHttp(400, 'Datos inválidos', { duplicado_de: 'El reporte original no existe o fue eliminado' });
      }
    }

    // foto_url se quita ya; foto_id se quita cuando Cloudinary confirme el borrado
    await con.query(
      `UPDATE reportes
          SET estado_moderacion = 'eliminado',
              duplicado_de = COALESCE(?, duplicado_de),
              foto_url = NULL
        WHERE id = ?`,
      [duplicado_de ?? null, id],
    );
    await con.query(
      "INSERT INTO moderaciones (reporte_id, moderador_id, accion, motivo, nota) VALUES (?, ?, 'eliminar', ?, ?)",
      [id, moderadorId, motivo, nota ?? null],
    );
    return reporte.foto_id;
  });

  // Fuera de la transacción: borrar la foto (llamada externa) y limpiar foto_id
  let fotoBorrada: boolean | null = null;
  if (fotoId) {
    fotoBorrada = await borrarFoto(fotoId);
    if (fotoBorrada) {
      await pool.query('UPDATE reportes SET foto_id = NULL WHERE id = ? AND foto_id = ?', [id, fotoId]);
    } else {
      console.warn(`⚠️  [Fotos] Reporte ${id} eliminado, pero su foto (${fotoId}) no se pudo borrar de Cloudinary.`);
    }
  }

  res.json({
    id,
    estado_moderacion: 'eliminado',
    motivo,
    foto_borrada: fotoBorrada, // null = el reporte no tenía foto
    ...(fotoBorrada === false
      ? { aviso: 'El reporte se eliminó, pero la foto no se pudo borrar de Cloudinary. Quedó registrada para reintentarlo.' }
      : {}),
  });
};

/**
 * PATCH /api/reportes/:id/estado — { estado_nuevo, nota? }
 * Cambia el estado del caso de un reporte PUBLICADO y lo registra en `seguimiento`
 * (con el moderador y el estado anterior). La tabla `moderaciones` solo admite
 * aprobar/eliminar, por eso los cambios de estado quedan en `seguimiento`.
 */
export const cambiarEstado: RequestHandler = async (req, res) => {
  const { id } = idParam.parse(req.params);
  const { estado_nuevo, nota } = esquemaCambiarEstado.parse(req.body ?? {});
  const moderadorId = idModerador(req);

  const resultado = await enTransaccion(async (con) => {
    const reporte = await bloquearReporte(con, id);
    if (reporte.estado_moderacion !== 'aprobado') {
      throw new ErrorHttp(409, 'Solo se puede cambiar el estado de reportes publicados (aprobados)');
    }
    if (reporte.estado_caso === estado_nuevo) throw new ErrorHttp(409, 'El reporte ya está en ese estado');

    await con.query('UPDATE reportes SET estado_caso = ? WHERE id = ?', [estado_nuevo, id]);
    const [insercion] = await con.query<ResultSetHeader>(
      `INSERT INTO seguimiento (reporte_id, moderador_id, estado_anterior, estado_nuevo, nota)
       VALUES (?, ?, ?, ?, ?)`,
      [id, moderadorId, reporte.estado_caso, estado_nuevo, nota ?? null],
    );
    return { estado_anterior: reporte.estado_caso, seguimiento_id: insercion.insertId };
  });

  res.json({ id, estado_anterior: resultado.estado_anterior, estado_nuevo, seguimiento_id: resultado.seguimiento_id });
};
