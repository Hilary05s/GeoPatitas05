import sharp from 'sharp';

import { ErrorHttp } from './errores.js';

/** Formatos que sharp debe detectar en el CONTENIDO del archivo (no en el nombre). */
const FORMATOS_REALES = new Set(['jpeg', 'png', 'webp']);
const LADO_MAXIMO = 1600; // px
const CALIDAD_JPEG = 80;

/**
 * Prepara la foto de un reporte antes de subirla:
 * 1. Comprueba que el contenido sea de verdad JPG, PNG o WebP.
 * 2. La gira según su orientación EXIF (para que no quede de lado).
 * 3. La reduce a 1600 px como máximo, sin agrandar fotos chicas.
 * 4. La convierte a JPEG al 80 %.
 * 5. Elimina TODOS los metadatos (EXIF, GPS, modelo del celular, fecha…):
 *    sharp los descarta por defecto al generar la imagen nueva.
 */
export async function procesarFoto(original: Buffer): Promise<Buffer> {
  let formato: string | undefined;
  try {
    ({ format: formato } = await sharp(original).metadata());
  } catch {
    formato = undefined;
  }
  if (!formato || !FORMATOS_REALES.has(formato)) {
    throw new ErrorHttp(400, 'El archivo no es una imagen válida', { foto: 'Imagen dañada o con formato no permitido' });
  }

  try {
    return await sharp(original, { limitInputPixels: 50_000_000 }) // evita imágenes gigantes
      .rotate()
      .resize({ width: LADO_MAXIMO, height: LADO_MAXIMO, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: CALIDAD_JPEG, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new ErrorHttp(400, 'No se pudo procesar la imagen', { foto: 'Imagen dañada o demasiado grande' });
  }
}
