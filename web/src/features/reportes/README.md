# Sección: Reportar un perrito

**Ruta:** `/reportar` · **Archivo:** `ReportarPage.tsx` · **Responsable:** [por asignar]

## Qué hace (según el diseño actual)

Formulario para que cualquier persona reporte un perrito **sin crear cuenta**:

- **Foto opcional:** "Elegir imagen" o "Tomar foto" (`capture="environment"` en el celular).
- **Campos:** nombre (opcional), raza aproximada (opcional), color, fecha del avistamiento, tamaño (Pequeño / Mediano / Grande), estado de salud aparente, descripción y contacto (opcional, **no se publica**).
- **Ubicación aproximada:** a la derecha, un mini mapa donde se **elige una zona** (no un punto exacto).
- **Al enviar:** pantalla "¡Gracias! Tu reporte fue enviado" con los botones "Ver el mapa" y "Hacer otro reporte". El reporte queda **pendiente de moderación**.

## Tecnologías

React + TypeScript, Tailwind, Leaflet + react-leaflet (mini mapa de zonas; ver [docs/MAPA.md](../../../docs/MAPA.md)) y `src/lib/api.ts` (`api.post` con `FormData` cuando hay foto, o con un objeto si no la hay). La API se encarga de procesar la foto y subirla a Cloudinary: el frontend solo la manda junto con el reporte.

## Endpoints de la API

| | Método | Ruta | Para qué |
|---|---|---|---|
| ✅ | GET | `/api/zonas` | Zonas para elegir → `Zona[]` |
| ✅ | POST | `/api/reportes` | Crear el reporte, **con la foto en el mismo envío** (`multipart/form-data`, campo `foto`) o sin foto (JSON). Queda `pendiente` → `{ id, folio, estado_moderacion, foto_guardada, mensaje, aviso? }` |

Ya **no** existe un endpoint aparte para subir fotos. Campos, límites y errores: [docs/API.md → POST /api/reportes](../../../docs/API.md).

```ts
const datos = new FormData(formulario);   // con <input type="file" name="foto">
const r = await api.post<{ id: number; folio: string; aviso?: string }>('/reportes', datos);
```

## Diseño de referencia

- [index.html](../../../../index.html), líneas **149-221** (`data-view="reportar"`).
- [css/styles.css](../../../../css/styles.css): Formularios **324-364** (`.field`, `.radio-pill`, `.photo-drop`, `.zone-btn`, `.success-card`).
- [js/app.js](../../../../js/app.js): `renderZones()`, `onSubmitReport()` y `resetReport()`, líneas **189-236**. Ojo con el `TODO` de la línea 219.

## Notas

- Las opciones del formulario deben coincidir con los ENUM de la base (`src/types/comunes.ts`):
  - Tamaño: `pequeno | mediano | grande`.
  - Salud: `sano | herido | enfermo | desnutrido | en_peligro`.
  - En el diseño, **"Cachorro"** aparece como opción de salud, pero en la base es el campo aparte `es_cachorro` (0/1). Conviene que sea una casilla separada; coméntalo con quien diseña.
- **Foto:**
  - Formatos JPG, PNG o WebP, de máximo 5 MB: usa `accept="image/jpeg,image/png,image/webp"`.
  - **HEIC no se acepta** (responde `415`). Safari en iPhone lo convierte a JPEG al subir.
- 🔒 **La API ya quita los datos GPS/EXIF** de la foto antes de guardarla. Reducirla también en el navegador es opcional, pero ahorra datos móviles (ver [docs/REGLAS.md](../../../docs/REGLAS.md)).
- Si la respuesta trae `aviso`, muéstralo: por ejemplo, cuando la foto no se pudo guardar y el reporte se envió sin ella.
- Errores `400` con `campos`: úsalos para marcar en rojo cada campo del formulario.
- 🔒 Nunca pedir domicilio ni ubicación exacta. Solo `zona_id`: la API rechaza `lat`, `lng` o cualquier campo extra.
