import multer from 'multer';

import { ErrorHttp } from '../lib/errores.js';

/** Tamaño máximo de la foto original (antes de comprimirla). */
export const MB_MAXIMOS_FOTO = 5;

/**
 * Tipos de imagen aceptados. HEIC/HEIF (fotos de iPhone) NO está: los binarios
 * de sharp no incluyen el decodificador HEVC. En la práctica, Safari en iPhone
 * convierte a JPEG al subir con <input type="file">.
 * El tipo real se vuelve a comprobar con sharp (no se confía solo en el mimetype).
 */
export const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp'] as const;

/**
 * Recibe UNA foto opcional en el campo "foto" de un formulario multipart.
 * - Se guarda en memoria (nunca en disco) para procesarla con sharp.
 * - Si la petición es JSON, multer no hace nada y pasa al siguiente paso.
 */
export const subirFotoOpcional = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MB_MAXIMOS_FOTO * 1024 * 1024,
    files: 1,
    fields: 20,
    fieldSize: 10 * 1024, // 10 KB por campo de texto
    parts: 25,
  },
  fileFilter: (_req, archivo, cb) => {
    if ((TIPOS_FOTO as readonly string[]).includes(archivo.mimetype)) {
      cb(null, true);
    } else {
      cb(new ErrorHttp(415, 'La foto debe ser JPG, PNG o WebP', { foto: 'Formato no permitido' }));
    }
  },
}).single('foto');
