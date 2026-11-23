# Sección: Inicio

**Ruta:** `/` · **Archivo:** `InicioPage.tsx` · **Responsable:** [por asignar]

## Qué hace (según el diseño actual)

Portada de la plataforma:

1. **Hero:** etiqueta "Plataforma ciudadana · Santiago Ixcuintla", título, texto y botones "Explorar mapa" y "Reportar ahora", con foto a la derecha.
2. **Franja de cifras** (fondo café): perritos reportados, casos atendidos y reportes de esta semana.
3. **Cómo funciona en tres pasos:** Reporta → Aparece en el mapa → La comunidad actúa.
4. **Reportes recientes:** los 3 últimos reportes como carteles "SE BUSCA", que llevan a su ficha (`/reporte/:id`).
5. **Caja de aliados:** espacio para logos de patrocinadores y botón "Ver aliados".

## Tecnologías

React + TypeScript, Tailwind (tokens del tema), React Router (`<Link>`) y `src/lib/api.ts` para las cifras y los reportes recientes.

## Endpoints de la API

| | Método | Ruta | Para qué |
|---|---|---|---|
| ⏳ | GET | `/api/estadisticas` | Cifras de la franja (vista `v_estadisticas` → tipo `Estadisticas`) |
| ⏳ | GET | `/api/reportes?limite=3` | Reportes recientes (vista `v_reportes_publicos` → `ReportePublico[]`) |
| ⏳ | GET | `/api/aliados` | Logos de la caja de aliados (opcional) |

Detalle en [docs/API.md](../../../docs/API.md).

## Diseño de referencia

- [index.html](../../../../index.html), líneas **48-104** (`data-view="inicio"`).
- [css/styles.css](../../../../css/styles.css): Inicio **171-193**, cartel "SE BUSCA" **195-222**, tipografía **98-105**, botones **107-126**.
- [js/app.js](../../../../js/app.js): `renderRecent()`, líneas **72-86**.
- Datos de prueba: [js/data.js](../../../../js/data.js) (`REPORTS`).

## Notas

- Si `casos_atendidos` o `reportes_semana` llegan como `null` (todavía no hay reportes aprobados), muestra **0**.
- El cartel "SE BUSCA" lo van a usar también Adopciones y Ficha: hazlo en `src/components/`.
