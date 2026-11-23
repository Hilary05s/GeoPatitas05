import { createHash } from 'node:crypto';

import type { RequestHandler } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

import { pool } from '../lib/bd.js';
import { borrarFoto, fotosHabilitadas, subirFoto, type FotoSubida } from '../lib/cloudinary.js';
import { config } from '../lib/config.js';
import { Filtros } from '../lib/consultas.js';
import { ErrorHttp } from '../lib/errores.js';
import { procesarFoto } from '../lib/imagenes.js';
import { desplazamiento, idParam } from '../schemas/comunes.js';
import { crearReporte as esquemaCrearReporte, filtrosReportes } from '../schemas/reportes.schemas.js';

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

/** Hash SHA-256 de la IP con sal secreta: permite limitar spam sin guardar la IP. */
function hashIp(ip: string | undefined) {
  return createHash('sha256').update(`${config.IP_HASH_SALT}:${ip ?? 'desconocida'}`).digest('hex');
}

/** Folio con ceros a la izquierda (7 → "0007"). No recorta ids de más de 4 dígitos. */
function folio(id: number) {
  return String(id).padStart(4, '0');
}

/**
 * POST /api/reportes — crea un reporte PENDIENTE de moderación.
 * Acepta JSON o multipart/form-data (con la foto opcional en el campo "foto").
 * Nunca acepta coordenadas: solo zona_id.
 */
export const crearReporte: RequestHandler = async (req, res) => {
  const datos = esquemaCrearReporte.parse(req.body ?? {});

  // La zona debe existir y estar activa
  const [zonas] = await pool.query<RowDataPacket[]>('SELECT id FROM zonas WHERE id = ? AND activa = 1', [
    datos.zona_id,
  ]);
  if (!zonas[0]) {
    throw new ErrorHttp(400, 'Datos inválidos', { zona_id: 'La zona no existe o no está activa' });
  }

  // Anti-spam persistente: reportes de esta IP en las últimas 24 h
  const ipHash = hashIp(req.ip);
  const [[conteo]] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS total FROM reportes WHERE ip_hash = ? AND creado_en >= NOW() - INTERVAL 1 DAY',
    [ipHash],
  );
  if (Number(conteo?.total ?? 0) >= config.MAX_REPORTES_POR_IP_DIA) {
    throw new ErrorHttp(429, 'Llegaste al máximo de reportes por día. Intenta mañana.');
  }

  // Foto opcional: se procesa (sin EXIF/GPS) y se sube ANTES de guardar el reporte
  let foto: FotoSubida | null = null;
  let aviso: string | undefined;
  if (req.file) {
    // Se valida y limpia siempre, aunque no haya Cloudinary (un archivo falso da 400 igual)
    const imagen = await procesarFoto(req.file.buffer);
    if (fotosHabilitadas) {
      try {
        foto = await subirFoto(imagen);
      } catch (error) {
        console.error('[Cloudinary] Error al subir la foto:', (error as Error).message);
        throw new ErrorHttp(502, 'No se pudo guardar la foto. Intenta de nuevo o envía el reporte sin foto.');
      }
    } else {
      console.warn('⚠️  [Fotos] Llegó una foto pero Cloudinary no está configurado: el reporte se guarda sin foto.');
      aviso = 'La foto no se guardó porque el servicio de fotos no está configurado. El reporte se envió sin foto.';
    }
  }

  try {
    const [resultado] = await pool.query<ResultSetHeader>(
      `INSERT INTO reportes
         (zona_id, nombre, raza_aprox, color, tamano, es_cachorro, salud, descripcion,
          fecha_avistamiento, foto_url, foto_id, contacto, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        datos.zona_id,
        datos.nombre ?? null,
        datos.raza_aprox ?? null,
        datos.color,
        datos.tamano,
        datos.es_cachorro,
        datos.salud,
        datos.descripcion ?? null,
        datos.fecha_avistamiento,
        foto?.foto_url ?? null,
        foto?.foto_id ?? null,
        datos.contacto ?? null,
        ipHash,
      ],
    );

    res.status(201).json({
      id: resultado.insertId,
      folio: folio(resultado.insertId),
      estado_moderacion: 'pendiente',
      foto_guardada: foto !== null,
      mensaje: 'Gracias. Tu reporte se revisará antes de publicarse.',
      ...(aviso ? { aviso } : {}),
    });
  } catch (error) {
    // Si falla el INSERT, no dejar la foto huérfana en Cloudinary
    if (foto) await borrarFoto(foto.foto_id);
    throw error;
  }
};
