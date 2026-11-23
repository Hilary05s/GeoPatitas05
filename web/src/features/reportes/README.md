# Sección: Reportar un perrito

**Ruta:** `/reportar` · **Archivo:** `ReportarPage.tsx` · **Responsable:** [por asignar]

## Qué hace (según el diseño actual)

Formulario para que cualquier persona reporte un perrito **sin crear cuenta**:

- **Foto opcional:** "Elegir imagen" o "Tomar foto" (`capture="environment"` en el celular).
- **Campos:** nombre (opcional), raza aproximada (opcional), color, fecha del avistamiento, tamaño (Pequeño / Mediano / Grande), estado de salud aparente, descripción y contacto (opcional, **no se publica**).
- **Ubicación aproximada:** a la derecha, un mini mapa donde se **elige una zona** (no un punto exacto).
- **Al enviar:** pantalla "¡Gracias! Tu reporte fue enviado" con los botones "Ver el mapa" y "Hacer otro reporte". El reporte queda **pendiente de moderación**.

## Tecnologías

React + TypeScript, Tailwind, Leaflet + react-leaflet (mini mapa de zonas; ver [docs/MAPA.md](../../../docs/MAPA.md)), `src/lib/api.ts` (`api.post` con JSON, y con `FormData` para la foto) y el servicio de fotos propuesto, Cloudinary (ver [docs/STACK.md](../../../docs/STACK.md)).

## Endpoints de la API

| | Método | Ruta | Para qué |
|---|---|---|---|
| ✅ | GET | `/api/zonas` | Zonas para elegir → `Zona[]` |
| ⏳ | POST | `/api/fotos` | Subir la foto (`multipart/form-data`) → `{ foto_url, foto_id }` |
| ⏳ | POST | `/api/reportes` | Crear el reporte (queda `pendiente`) → `{ id, folio }` |

## Diseño de referencia

- [index.html](../../../../index.html), líneas **149-221** (`data-view="reportar"`).
- [css/styles.css](../../../../css/styles.css): Formularios **324-364** (`.field`, `.radio-pill`, `.photo-drop`, `.zone-btn`, `.success-card`).
- [js/app.js](../../../../js/app.js): `renderZones()`, `onSubmitReport()` y `resetReport()`, líneas **189-236**. Ojo con el `TODO` de la línea 219.

## Notas

- Las opciones del formulario deben coincidir con los ENUM de la base (`src/types/comunes.ts`):
  - Tamaño: `pequeno | mediano | grande`.
  - Salud: `sano | herido | enfermo | desnutrido | en_peligro`.
  - En el diseño, **"Cachorro"** aparece como opción de salud, pero en la base es el campo aparte `es_cachorro` (0/1). Conviene que sea una casilla separada; coméntalo con quien diseña.
- 🔒 **Quitar los datos GPS/EXIF de la foto** antes de subirla (ver [docs/REGLAS.md](../../../docs/REGLAS.md)).
- 🔒 Nunca pedir domicilio ni ubicación exacta. Solo `zona_id`.
