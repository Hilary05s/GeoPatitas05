/**
 * Cliente para hablar con la API de GeoPatitas.
 *
 * La URL base sale de la variable de entorno VITE_API_URL (ver .env.example).
 * En desarrollo vale "/api" y el proxy de Vite la reenvía a http://localhost:3000.
 *
 * Ejemplos de uso (todavía NINGUNA página llama a la API):
 *
 *   import { api } from '@/lib/api';
 *   import type { Zona } from '@/types';
 *
 *   const zonas = await api.get<Zona[]>('/zonas');
 *   await api.post('/reportes', { zona_id: 1, color: 'Café' });
 *   await api.post('/fotos', formData);                     // FormData se envía tal cual
 *   await api.patch('/moderacion/reportes/7/aprobar', undefined, { token });
 */

const URL_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/+$/, '');
const TIEMPO_LIMITE_MS = 15_000;

/** Error de la API. `status` es 0 cuando no hubo respuesta (API apagada, sin internet o tiempo agotado). */
export class ApiError extends Error {
  readonly status: number;
  readonly datos: unknown;

  constructor(mensaje: string, status: number, datos?: unknown) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.datos = datos;
  }

  /** true si la API no respondió (apagada, sin conexión o tiempo agotado). */
  get sinConexion() {
    return this.status === 0;
  }
}

type ValorQuery = string | number | boolean | null | undefined;

export interface OpcionesApi extends Omit<RequestInit, 'body'> {
  /** Objeto (se envía como JSON) o FormData (para subir archivos). */
  body?: unknown;
  /** Parámetros de búsqueda: { estado: 'atendido' } → ?estado=atendido. Se omiten null/undefined. */
  query?: Record<string, ValorQuery>;
  /** JWT del moderador; se manda como "Authorization: Bearer <token>". */
  token?: string | null;
  /** Milisegundos antes de cancelar la petición. Por defecto 15 s. */
  tiempoLimiteMs?: number;
}

function construirUrl(ruta: string, query?: Record<string, ValorQuery>) {
  const url = URL_BASE + (ruta.startsWith('/') ? ruta : `/${ruta}`);
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(query)) {
    if (valor !== null && valor !== undefined) params.append(clave, String(valor));
  }
  const texto = params.toString();
  return texto ? `${url}?${texto}` : url;
}

async function leerCuerpo(respuesta: Response): Promise<unknown> {
  if (respuesta.status === 204) return undefined;
  const tipo = respuesta.headers.get('content-type') ?? '';
  if (tipo.includes('application/json')) {
    try {
      return await respuesta.json();
    } catch {
      return null;
    }
  }
  const texto = await respuesta.text();
  return texto || undefined;
}

/** Busca un mensaje de error legible en la respuesta ({ mensaje }, { error } o { message }). */
function mensajeDeError(datos: unknown, status: number): string {
  if (datos && typeof datos === 'object') {
    for (const clave of ['mensaje', 'error', 'message'] as const) {
      const valor = (datos as Record<string, unknown>)[clave];
      if (typeof valor === 'string' && valor) return valor;
    }
  }
  if (status === 401) return 'Necesitas iniciar sesión.';
  if (status === 403) return 'No tienes permiso para hacer esto.';
  if (status === 404) return 'No se encontró lo que buscabas.';
  if (status >= 500) return 'La API tuvo un problema. Intenta más tarde.';
  return `Error ${status} al hablar con la API.`;
}

/**
 * Hace una petición a la API y devuelve el JSON ya tipado.
 * Lanza ApiError si la respuesta no es 2xx o si la API no responde.
 * Si quien llama cancela con `signal`, se relanza el AbortError original.
 */
export async function apiFetch<T = unknown>(ruta: string, opciones: OpcionesApi = {}): Promise<T> {
  const { body, query, token, tiempoLimiteMs = TIEMPO_LIMITE_MS, headers, signal, ...resto } = opciones;

  const cabeceras = new Headers(headers);
  cabeceras.set('Accept', 'application/json');
  if (token) cabeceras.set('Authorization', `Bearer ${token}`);

  let cuerpo: BodyInit | undefined;
  if (body instanceof FormData) {
    cuerpo = body; // el navegador pone el Content-Type con su "boundary"
  } else if (body !== undefined) {
    cabeceras.set('Content-Type', 'application/json');
    cuerpo = JSON.stringify(body);
  }

  // Cancelación por tiempo límite + cancelación de quien llama (p. ej. al salir de la página).
  const control = new AbortController();
  let porTiempo = false;
  const temporizador = setTimeout(() => {
    porTiempo = true;
    control.abort();
  }, tiempoLimiteMs);
  const cancelarDesdeFuera = () => control.abort();
  signal?.addEventListener('abort', cancelarDesdeFuera, { once: true });
  if (signal?.aborted) control.abort();

  try {
    let respuesta: Response;
    try {
      respuesta = await fetch(construirUrl(ruta, query), {
        ...resto,
        headers: cabeceras,
        body: cuerpo,
        signal: control.signal,
      });
    } catch (error) {
      if (porTiempo) throw new ApiError('La API tardó demasiado en responder.', 0);
      if (signal?.aborted) throw error;
      throw new ApiError('No se pudo conectar con la API. ¿Está encendida?', 0);
    }

    const datos = await leerCuerpo(respuesta);
    if (!respuesta.ok) throw new ApiError(mensajeDeError(datos, respuesta.status), respuesta.status, datos);
    return datos as T;
  } finally {
    clearTimeout(temporizador);
    signal?.removeEventListener('abort', cancelarDesdeFuera);
  }
}

type OpcionesSinCuerpo = Omit<OpcionesApi, 'method' | 'body'>;

/** Atajos por método HTTP. */
export const api = {
  get: <T = unknown>(ruta: string, opciones?: OpcionesSinCuerpo) =>
    apiFetch<T>(ruta, { ...opciones, method: 'GET' }),
  post: <T = unknown>(ruta: string, body?: unknown, opciones?: OpcionesSinCuerpo) =>
    apiFetch<T>(ruta, { ...opciones, method: 'POST', body }),
  put: <T = unknown>(ruta: string, body?: unknown, opciones?: OpcionesSinCuerpo) =>
    apiFetch<T>(ruta, { ...opciones, method: 'PUT', body }),
  patch: <T = unknown>(ruta: string, body?: unknown, opciones?: OpcionesSinCuerpo) =>
    apiFetch<T>(ruta, { ...opciones, method: 'PATCH', body }),
  delete: <T = unknown>(ruta: string, opciones?: OpcionesSinCuerpo) =>
    apiFetch<T>(ruta, { ...opciones, method: 'DELETE' }),
};
