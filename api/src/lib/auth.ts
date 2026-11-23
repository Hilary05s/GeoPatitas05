import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';

import { config } from './config.js';

/** Costo de bcrypt: 12 rondas (~0.2-0.3 s por hash; lento a propósito contra ataques). */
export const RONDAS_BCRYPT = 12;

/** bcrypt solo usa los primeros 72 bytes de la contraseña: más larga no se acepta. */
export const BYTES_MAXIMOS_PASSWORD = 72;

const EMISOR = 'geopatitas-api';
const ALGORITMO = 'HS256';

/** Datos del moderador que viajan dentro del token (nada sensible). */
export interface DatosToken {
  /** id del moderador */
  sub: string;
  rol: 'admin' | 'moderador';
}

/** Firma un JWT para el moderador. */
export function firmarToken(moderador: { id: number; rol: 'admin' | 'moderador' }) {
  const opciones: SignOptions = {
    algorithm: ALGORITMO,
    issuer: EMISOR,
    subject: String(moderador.id),
    expiresIn: config.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
  };
  const token = jwt.sign({ rol: moderador.rol }, config.JWT_SECRET, opciones);
  const { exp } = jwt.decode(token) as { exp: number };
  return { token, expira_en: new Date(exp * 1000).toISOString() };
}

export type ResultadoVerificacion =
  | { ok: true; datos: DatosToken }
  | { ok: false; motivo: 'expirado' | 'invalido' };

/** Verifica firma, emisor, algoritmo y vencimiento del token. */
export function verificarToken(token: string): ResultadoVerificacion {
  try {
    const datos = jwt.verify(token, config.JWT_SECRET, {
      algorithms: [ALGORITMO],
      issuer: EMISOR,
    }) as jwt.JwtPayload;
    if (typeof datos.sub !== 'string' || (datos.rol !== 'admin' && datos.rol !== 'moderador')) {
      return { ok: false, motivo: 'invalido' };
    }
    return { ok: true, datos: { sub: datos.sub, rol: datos.rol } };
  } catch (error) {
    return { ok: false, motivo: error instanceof jwt.TokenExpiredError ? 'expirado' : 'invalido' };
  }
}

/** Genera el hash bcrypt de una contraseña. */
export function hashearPassword(password: string) {
  return bcrypt.hash(password, RONDAS_BCRYPT);
}

// Hash de relleno para comparar aunque el correo no exista: así la respuesta
// tarda lo mismo y no revela qué correos están registrados.
const HASH_DE_RELLENO = bcrypt.hashSync('relleno-para-igualar-tiempos', RONDAS_BCRYPT);

/** Formato de un hash bcrypt: $2a$, $2b$ o $2y$ + costo de 2 dígitos + 53 caracteres. */
const FORMATO_BCRYPT = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/**
 * Compara una contraseña con su hash. Si no hay hash (correo inexistente) o el hash
 * no es un bcrypt válido, compara contra un hash de relleno y devuelve false.
 * Así el tiempo de respuesta es el mismo en todos los casos.
 */
export async function compararPassword(password: string, hash: string | null | undefined) {
  const hashValido = typeof hash === 'string' && FORMATO_BCRYPT.test(hash);
  const coincide = await bcrypt.compare(password, hashValido ? hash : HASH_DE_RELLENO);
  return hashValido && coincide;
}
