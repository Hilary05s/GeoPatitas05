# Sección: Explorar mapa

**Ruta:** `/mapa` · **Archivo:** `MapaPage.tsx` · **Responsable:** [por asignar]

## Qué hace (según el diseño actual)

- **Panel lateral:** buscador por colonia o zona, chips de filtro por estado (Todos / Necesita ayuda / En seguimiento / Atendido), contador de resultados y lista de reportes.
- **Mapa:** una huella por reporte, de color según su estado, dentro de un **círculo punteado que marca la zona aproximada**.
- **Al tocar una huella o un elemento de la lista** se abre una tarjeta flotante con foto, estado, título, zona y botón para ver la ficha.
- **Leyenda** de colores abajo a la derecha (se oculta en el celular).

## Tecnologías

React + TypeScript, Tailwind, **Leaflet + react-leaflet** sobre **OpenStreetMap** (ya instalados; el CSS de Leaflet ya se importa en `src/main.tsx`), React Router y `src/lib/api.ts`.

👉 **Lee primero [docs/MAPA.md](../../../docs/MAPA.md)**: ahí está la propuesta de cómo usar Leaflet y la regla de privacidad.

## Endpoints de la API

| | Método | Ruta | Para qué |
|---|---|---|---|
| ✅ | GET | `/api/zonas` | Zonas con su centro (`lat_centro`, `lng_centro`) → `Zona[]` |
| ⏳ | GET | `/api/reportes` | Reportes aprobados con su zona y las coordenadas del centro de la zona → `ReportePublico[]`. Filtros propuestos: `?estado_caso=&zona_id=&q=` |
| ⏳ | GET | `/api/zonas/resumen` | Conteo por zona (vista `v_reportes_por_zona`); opcional, para pintar zonas |

## Diseño de referencia

- [index.html](../../../../index.html), líneas **106-147** (`data-view="mapa"`).
- [css/styles.css](../../../../css/styles.css): Mapa **224-322** (chips, lista, huellas `.pin`, zona `.pin-area`, tarjeta `.map-popup`, leyenda), celular **460-469**.
- [js/app.js](../../../../js/app.js): `visibleReports()`, `renderChips()`, `renderMap()` y `renderPopup()`, líneas **91-152**.

## Notas

- 🔒 **Nunca** mostrar la ubicación exacta: todo se dibuja en el centro de la zona y con un círculo.
- 🔒 La atribución **"© OpenStreetMap"** es obligatoria.
- El encabezado del sitio tiene `z-[1100]` para quedar encima de los controles de Leaflet (`z-index: 1000`). No subas el z-index del mapa por encima de eso.
- Los colores por estado ya existen como tokens: `ayuda-pin`, `seguimiento-pin` y `atendido-pin` (y `-fondo` / `-texto` para chips e insignias).
