import { v2 as cloudinary } from 'cloudinary';

import { config } from './config.js';

/**
 * Fotos en Cloudinary.
 * Si faltan las credenciales en el .env, `fotosHabilitadas` es false y los
 * reportes se crean sin foto (se avisa en consola al arrancar y en cada intento).
 */
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = config;

export const fotosHabilitadas = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface FotoSubida {
  foto_url: string;
  /** public_id de Cloudinary: sirve para borrar la foto después. */
  foto_id: string;
}

/** Sube una imagen ya procesada (sin EXIF) y devuelve su URL https y su id. */
export function subirFoto(imagen: Buffer): Promise<FotoSubida> {
  return new Promise((resolve, reject) => {
    const subida = cloudinary.uploader.upload_stream(
      {
        folder: config.CLOUDINARY_FOLDER,
        resource_type: 'image',
        overwrite: false,
      },
      (error, resultado) => {
        if (error || !resultado) {
          reject(error ?? new Error('Cloudinary no devolvió resultado'));
          return;
        }
        resolve({ foto_url: resultado.secure_url, foto_id: resultado.public_id });
      },
    );
    subida.end(imagen);
  });
}

/** Borra una foto de Cloudinary. No lanza error: si falla, solo lo registra en consola. */
export async function borrarFoto(fotoId: string): Promise<boolean> {
  if (!fotosHabilitadas) return false;
  try {
    const { result } = (await cloudinary.uploader.destroy(fotoId, { invalidate: true })) as { result?: string };
    return result === 'ok' || result === 'not found';
  } catch (error) {
    console.error(`[Cloudinary] No se pudo borrar la foto ${fotoId}:`, (error as Error).message);
    return false;
  }
}
