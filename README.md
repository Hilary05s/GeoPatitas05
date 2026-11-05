# GeoPatitas · PWA (cascarón)

Plataforma web para reportar perritos en situación de calle en Santiago Ixcuintla, Nayarit.
Este es el **cascarón navegable**: todas las secciones, botones y el mapa ilustrativo funcionan con datos de demostración. Todavía no hay backend.

## Estructura

```
geopatitas/
├── index.html              # Todas las secciones (una sola página)
├── manifest.webmanifest    # Datos de instalación de la PWA
├── sw.js                   # Service worker (funciona sin conexión)
├── css/
│   └── styles.css          # Estilos y colores (variables en :root)
├── js/
│   ├── data.js             # Datos de demostración (reemplazar por la API)
│   └── app.js              # Navegación, mapa, formulario, filtros, moderación
└── icons/                  # Íconos de la app (192, 512, maskable, Apple, favicon)
```

## Secciones (navegación por hash)

| Ruta | Sección |
|---|---|
| `#/inicio` | Portada, cifras, cómo funciona, reportes recientes |
| `#/mapa` | Mapa con filtros, búsqueda, lista y tarjeta del reporte |
| `#/ficha/0142` | Ficha de un reporte con seguimiento del caso |
| `#/reportar` | Formulario con foto opcional y zona aproximada |
| `#/adopciones` | Carteles "SE BUSCA HOGAR" con filtros |
| `#/aliados` | Veterinarias y negocios aliados, promociones |
| `#/nosotros` | Misión, visión, objetivo y equipo |
| `#/moderacion` | Panel del equipo para aprobar o eliminar reportes |

## Cómo correrlo

Un service worker **no funciona abriendo el archivo con doble clic** (`file://`). Hay que servirlo:

```bash
# Opción 1: Python
python -m http.server 8080

# Opción 2: Node
npx serve .
```

Luego abrir `http://localhost:8080`. En Chrome aparece el botón **Instalar** en la barra de direcciones.
Para instalarla en el celular se necesita **HTTPS** (por ejemplo, subirla a Netlify, Vercel o GitHub Pages).

## Pendientes

- Conectar el mapa real (Leaflet + OpenStreetMap o Mapbox) en `#map`.
- Conectar el formulario a la base de datos: ver `onSubmitReport` en `js/app.js` (hay un `TODO`).
- Subida real de fotos (el formulario ya acepta imagen o cámara).
- Login para el panel de moderación.
- Reemplazar los textos `[ ... ]` y las fotos de ejemplo.
- Cada vez que cambies archivos, sube `CACHE_VERSION` en `sw.js` para que los usuarios reciban la versión nueva.
