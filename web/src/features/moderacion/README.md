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
| ⏳ | POST | `/api/auth/login` | `{ correo, password }` → `{ token, moderador }` |
| ⏳ | GET | `/api/moderacion/resumen` | Contadores → `{ pendientes, aprobados, eliminados }` |
| ⏳ | GET | `/api/moderacion/reportes?estado=pendiente` | Cola → `Reporte[]` (tabla completa, más el nombre de la zona) |
| ⏳ | PATCH | `/api/moderacion/reportes/:id/aprobar` | Aprobar (se guarda en `moderaciones`) |
| ⏳ | PATCH | `/api/moderacion/reportes/:id/eliminar` | `{ motivo, nota? }`. El motivo es obligatorio |
| ⏳ | PATCH | `/api/moderacion/reportes/:id/estado` | `{ estado_nuevo, nota? }` (se guarda en `seguimiento`) |
| ⏳ | GET / PATCH | `/api/moderacion/adopciones…` | Lo mismo para adopciones |
| ⏳ | GET | `/api/moderacion/avisos` | Avisos sin revisar |

## Diseño de referencia

- [index.html](../../../../index.html), líneas **304-323** (`data-view="moderacion"`).
- [css/styles.css](../../../../css/styles.css): Moderación **434-448** (`.counter`, `.mod-item`, `.empty-state`), `.tag-dark` **159**, `.btn-danger` **123**.
- [js/app.js](../../../../js/app.js): `renderModeration()` y `dropPending()`, líneas **292-314**.
- Datos de prueba: [js/data.js](../../../../js/data.js) (`PENDING`).

## Notas

- Motivos de eliminación (`MotivoModeracion`): `falso | duplicado | ofensivo | fuera_de_tema | otro`.
- 🔒 El token se guarda en memoria o en `sessionStorage`, **nunca** en el código. Al cerrar sesión se borra.
- 🔒 La seguridad real está en la API: ocultar el panel en el frontend **no** protege nada.
- Esta página **no** está en el menú principal; se entra desde el enlace del pie de página.
