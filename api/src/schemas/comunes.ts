import { z } from 'zod';

/**
 * Valores de los ENUM de la base (api/sql/geopatitas.sql).
 * Deben coincidir con web/src/types/comunes.ts.
 */
export const TAMANOS = ['pequeno', 'mediano', 'grande'] as const;
export const SALUDES = ['sano', 'herido', 'enfermo', 'desnutrido', 'en_peligro'] as const;
export const ESTADOS_CASO = ['necesita_ayuda', 'en_seguimiento', 'atendido'] as const;
export const SEXOS = ['hembra', 'macho', 'desconocido'] as const;
export const EDADES = ['cachorro', 'adulto', 'mayor'] as const;
export const TIPOS_ALIADO = ['veterinaria', 'negocio'] as const;
export const MOTIVOS_MODERACION = ['falso', 'duplicado', 'ofensivo', 'fuera_de_tema', 'otro'] as const;

/** Texto opcional: recorta espacios y convierte "" en undefined (los formularios mandan ""). */
export const textoOpcional = (maximo: number) =>
  z.preprocess(
    (valor) => (typeof valor === 'string' && valor.trim() === '' ? undefined : valor),
    z.string().trim().max(maximo).optional(),
  );

/** Id numérico en la URL: /reportes/:id */
export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

/** ?limite=&pagina= — máximo 100 por página. */
export const paginacion = z.object({
  limite: z.coerce.number().int().min(1).max(100).default(50),
  pagina: z.coerce.number().int().min(1).default(1),
});

/** Calcula el OFFSET de SQL a partir de la página. */
export function desplazamiento({ limite, pagina }: { limite: number; pagina: number }) {
  return (pagina - 1) * limite;
}
