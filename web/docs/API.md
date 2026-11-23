# API de GeoPatitas

> **Base local:** `http://localhost:3000/api` · Código en `api/src/index.ts` · Base de datos en `api/sql/geopatitas.sql`
> **Desde el frontend:** `VITE_API_URL=/api` y se usa `src/lib/api.ts` (`api.get`, `api.post`, …). En desarrollo, el proxy de Vite reenvía `/api` a `localhost:3000`.
> **Tipos:** `src/types/` (tablas, vistas y ENUM).

✅ = ya existe · ⏳ = falta programarlo (lo que aparece aquí es una **propuesta** para discutir)

---

## ⚠️ Pendientes de la API antes de producción

1. **CORS (obligatorio).** La API no tiene CORS. En local no hace falta porque el proxy de Vite lo evita, pero en producción el frontend (Vercel) y la API van en dominios distintos y el navegador **bloquearía** las peticiones. Hay que instalar `cors` en `api/` y permitir **solo** el dominio del frontend:
   ```ts
   import cors from 'cors';
   app.use(cors({ origin: ['https://<dominio-del-frontend>'] }));
   ```
2. **`express.json()`** para poder leer el cuerpo JSON de los `POST` y `PATCH`.
3. **Manejo de errores.** Las rutas no tienen `try/catch`. Si MySQL está apagado, Express responde 500 con HTML. Propuesta: un middleware de errores que siempre responda JSON `{ "mensaje": "..." }`. `src/lib/api.ts` ya lee `mensaje`, `error` o `message`.
4. **Fechas (`DATE`).** mysql2 convierte `DATE` a un objeto `Date` en la hora local, y al pasarlo a JSON puede quedar corrido un día (por ejemplo, `fecha_avistamiento` `2026-11-21` → `"2026-11-21T06:00:00.000Z"`). Propuesta: `dateStrings: true` en el pool de `bd.ts` (devuelve `"2026-11-21"` tal cual), o `DATE_FORMAT` en las consultas.
5. **Script `dev`.** `api/package.json` no tiene script para arrancar. Hoy se corre con `pnpm tsx src/index.ts`. Propuesta: `"dev": "tsx watch src/index.ts"`.
6. **Nunca enviar** `password_hash`, `contacto`, `ip_hash` ni `contacto_responsable` en las rutas públicas. Para eso están las vistas `v_*`.

## Formato de respuestas (propuesta)

- **Éxito:** el dato directo (un arreglo o un objeto), como ya hace `/api/zonas`.
- **Error:** status HTTP + `{ "mensaje": "Texto para mostrar" }`.
- **Validación:** `400` + `{ "mensaje": "...", "campos": { "color": "Es obligatorio" } }`.
- **Sin sesión o permiso:** `401` / `403`. **No existe:** `404`.

---

## ✅ Endpoints que ya existen

| | Método | Ruta | Recibe | Devuelve |
|---|---|---|---|---|
| ✅ | GET | `/api` | — | `{ "mensaje": "GeoPatitas API funcionando" }` |
| ✅ | GET | `/api/zonas` | — | `Zona[]` (`SELECT * FROM zonas`) |

Ejemplo de `/api/zonas` con los datos del script:

```json
[
  { "id": 1, "nombre": "Centro", "lat_centro": 21.811, "lng_centro": -105.209, "activa": 1 },
  { "id": 2, "nombre": "Zona norte", "lat_centro": 21.818, "lng_centro": -105.209, "activa": 1 }
]
```

> Sugerencia: filtrar `WHERE activa = 1` para el público.

---

## ⏳ Endpoints que faltan

### Públicos

| | Método | Ruta | Recibe | Devuelve | Sección |
|---|---|---|---|---|---|
| ⏳ | GET | `/api/reportes` | query opcional: `estado_caso`, `zona_id`, `q` (busca en zona y color), `limite` | `ReportePublico[]` (vista `v_reportes_publicos`, del más nuevo al más viejo) | mapa, inicio |
| ⏳ | GET | `/api/reportes/:id` | `id` numérico | `ReportePublico` · `404` si no existe o no está aprobado | ficha |
| ⏳ | GET | `/api/reportes/:id/seguimiento` | `id` | `Seguimiento[]` **sin** `moderador_id` | ficha |
| ⏳ | **POST** | **`/api/reportes`** (crear reporte) | JSON: `zona_id`, `color`, `tamano`, `salud`, `fecha_avistamiento` (obligatorios) + `nombre?`, `raza_aprox?`, `es_cachorro?`, `descripcion?`, `contacto?`, `foto_url?`, `foto_id?` | `201` + `{ id, folio }`. Queda con `estado_moderacion = 'pendiente'`. La API calcula y guarda `ip_hash` (anti-spam) | reportar |
| ⏳ | **POST** | **`/api/fotos`** (subir foto) | `multipart/form-data` con el campo `foto` (imagen, máx. ~5 MB) | `201` + `{ foto_url, foto_id }`. La API **quita los datos EXIF/GPS** y sube a Cloudinary | reportar, adopciones |
| ⏳ | GET | `/api/estadisticas` | — | `Estadisticas` (vista `v_estadisticas`, una fila) | inicio |
| ⏳ | GET | `/api/zonas/resumen` | — | `ReportesPorZona[]` (vista `v_reportes_por_zona`) | mapa |
| ⏳ | GET | `/api/adopciones` | query opcional: `tamano`, `edad`, `sexo`, `q` | `AdopcionPublica[]` (vista `v_adopciones_publicas`) | adopciones |
| ⏳ | GET | `/api/adopciones/:id` | `id` | `AdopcionPublica` + `responsable` (y el contacto si se decide mostrarlo) | adopciones |
| ⏳ | POST | `/api/adopciones` | JSON: `nombre`, `sexo`, `edad`, `tamano`, `responsable`, `contacto_responsable` + `descripcion?`, `foto_url?`, `foto_id?`, `reporte_id?` | `201` + `{ id }`. Queda `pendiente`. **Por decidir:** ¿público o solo moderadores? | adopciones |
| ⏳ | GET | `/api/aliados` | — | `Aliado[]` con `activo = 1` y patrocinio vigente (`patrocinio_fin` nulo o mayor o igual a hoy) | aliados, inicio |
| ⏳ | POST | `/api/avisos` | JSON: `tipo` (`ayuda` \| `atendido` \| `aliado`), `contacto`, `mensaje?`, `reporte_id?` (obligatorio si el tipo es `ayuda` o `atendido`) | `201` + `{ id }` | ficha, aliados |

### Login

| | Método | Ruta | Recibe | Devuelve |
|---|---|---|---|---|
| ⏳ | **POST** | **`/api/auth/login`** | JSON: `correo`, `password` | `{ token, moderador: Moderador }` (sin `password_hash`) · `401` si las credenciales son incorrectas. Se verifica con **bcrypt**; el **JWT** expira (propuesta: 8 h) |
| ⏳ | GET | `/api/auth/yo` | cabecera `Authorization: Bearer <token>` | `Moderador` · `401` si el token no es válido o expiró |

### Moderación (requiere `Authorization: Bearer <token>`)

| | Método | Ruta | Recibe | Devuelve |
|---|---|---|---|---|
| ⏳ | GET | `/api/moderacion/resumen` | — | `{ pendientes, aprobados, eliminados }` |
| ⏳ | GET | `/api/moderacion/reportes` | query: `estado` (`pendiente` por defecto) | `(Reporte & { zona: string })[]`. Aquí sí va `contacto`, solo para el equipo |
| ⏳ | **PATCH** | **`/api/moderacion/reportes/:id/aprobar`** (aprobar) | JSON opcional: `nota?` | `{ ok: true }`. Pone `estado_moderacion = 'aprobado'` e inserta en `moderaciones` (`accion = 'aprobar'`) |
| ⏳ | **PATCH** | **`/api/moderacion/reportes/:id/eliminar`** (eliminar) | JSON: `motivo` (`falso` \| `duplicado` \| `ofensivo` \| `fuera_de_tema` \| `otro`, **obligatorio**), `nota?`, `duplicado_de?` | `{ ok: true }`. Pone `estado_moderacion = 'eliminado'` (borrado lógico, no `DELETE`) e inserta en `moderaciones`. Si hay foto, se borra de Cloudinary con `foto_id` |
| ⏳ | PATCH | `/api/moderacion/reportes/:id/estado` | JSON: `estado_nuevo` (`EstadoCaso`), `nota?` | `{ ok: true }`. Actualiza `estado_caso` e inserta en `seguimiento` |
| ⏳ | GET | `/api/moderacion/adopciones` | query: `estado` | `Adopcion[]` |
| ⏳ | PATCH | `/api/moderacion/adopciones/:id/aprobar` · `/eliminar` | igual que en reportes | `{ ok: true }` |
| ⏳ | PATCH | `/api/moderacion/adopciones/:id/estado` | JSON: `estado` (`disponible` \| `en_proceso` \| `adoptado`) | `{ ok: true }` |
| ⏳ | GET | `/api/moderacion/avisos` | query: `revisado` (0/1), `tipo?` | `Aviso[]` |
| ⏳ | PATCH | `/api/moderacion/avisos/:id/revisado` | — | `{ ok: true }` |
| ⏳ | POST / PATCH | `/api/moderacion/aliados` · `/api/moderacion/aliados/:id` | JSON con los campos de `Aliado` | `Aliado` (dar de alta y editar aliados) |

> Reglas de la base que la API debe respetar (están como `CHECK` en `moderaciones`):
> - Cada moderación es de un reporte **o** de una adopción, nunca de los dos.
> - `motivo` es obligatorio al eliminar.
