# Sección: Panel de moderación

**Ruta:** `/moderacion` · **Archivo:** `ModeracionPage.tsx` · **Responsable:** [por asignar]

## Qué hace (según el diseño actual)

Panel **solo para el equipo** (requiere login):

- Etiqueta "Solo equipo", título y el texto "Revisa cada reporte antes de publicarlo…".
- **Contadores:** pendientes, aprobados y eliminados.
- **Cola de reportes pendientes:** miniatura, título, zona, hora, motivo (por ejemplo "Posible duplicado de #0141") y botones **Aprobar** y **Eliminar**.
- Estado vacío: "No hay reportes pendientes".
- Además, según la base: cambiar el **estado del caso** (seguimiento), moderar **adopciones** y revisar **avisos**.

## Tecnologías

React + TypeScript, Tailwind, `src/lib/api.ts` (con la opción `token` para mandar el JWT) y **login con bcrypt + JWT** (ver [docs/STACK.md](../../../docs/STACK.md)).

## Endpoints de la API

Todos, salvo el login, requieren `Authorization: Bearer <token>`.

| | Método | Ruta | Para qué |
|---|---|---|---|
| ✅ | POST | `/api/auth/login` | `CredencialesLogin` → `RespuestaLogin` (`{ token, expira_en, moderador }`) · `401` con mensaje único si falla |
| ✅ | GET | `/api/auth/yo` | Moderador dueño del token → `Moderador`. Úsalo al abrir el panel: si da `401`, manda al login |
| ✅ | GET | `/api/moderacion/pendientes` | Cola, del más antiguo al más nuevo → `ReportePendiente[]` (incluye `contacto`, `zona`, `folio` y `envios_misma_ip_24h`). Paginado; total en `X-Total-Count` |
| ✅ | PATCH | `/api/moderacion/reportes/:id/aprobar` | `{ nota? }` (interna). Solo reportes pendientes; `409` si ya fue moderado. Se guarda en `moderaciones` |
| ✅ | PATCH | `/api/moderacion/reportes/:id/eliminar` | `{ motivo, nota?, duplicado_de? }`. El motivo es obligatorio; `duplicado_de` solo con motivo `duplicado`. Sirve también para reportes ya publicados. Borra la foto de Cloudinary → `{ …, foto_borrada, aviso? }` |
| ✅ | PATCH | `/api/reportes/:id/estado` | `{ estado_nuevo, nota? }`. Ojo: la ruta es `/api/reportes/…`, no `/api/moderacion/…`. Solo reportes aprobados. Se guarda en `seguimiento`. ⚠️ **La nota es pública** |
| ⏳ | GET | `/api/moderacion/resumen` | Contadores → `{ pendientes, aprobados, eliminados }`. Mientras no exista, "Pendientes" sale de `X-Total-Count` |
| ⏳ | GET / PATCH | `/api/moderacion/adopciones…` | Lo mismo para adopciones |
| ⏳ | GET | `/api/moderacion/avisos` | Avisos sin revisar |

## Diseño de referencia

- [index.html](../../../../index.html), líneas **304-323** (`data-view="moderacion"`).
- [css/styles.css](../../../../css/styles.css): Moderación **434-448** (`.counter`, `.mod-item`, `.empty-state`), `.tag-dark` **159**, `.btn-danger` **123**.
- [js/app.js](../../../../js/app.js): `renderModeration()` y `dropPending()`, líneas **292-314**.
- Datos de prueba: [js/data.js](../../../../js/data.js) (`PENDING`).

## Notas

- Motivos de eliminación (`MotivoModeracion`): `falso | duplicado | ofensivo | fuera_de_tema | otro`.
- ⚠️ **La nota del cambio de estado se publica** en la línea de tiempo de la ficha. Pon un aviso junto a ese campo: nada de nombres, teléfonos, domicilios ni ubicaciones exactas. Las notas de aprobar y eliminar son internas.
- Los moderadores se crean desde la terminal con `pnpm crear-moderador`, en `api/`. No hay registro en la web.
- Detalle de cada endpoint, con ejemplos: [docs/API.md → Moderación](../../../docs/API.md).
- 🔒 El token se guarda en memoria o en `sessionStorage`, **nunca** en el código. Al cerrar sesión se borra.
- 🔒 La seguridad real está en la API: ocultar el panel en el frontend **no** protege nada.
- Esta página **no** está en el menú principal; se entra desde el enlace del pie de página.
