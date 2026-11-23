# Propuesta: cómo usar el mapa (Leaflet)

> **Propuesta para discutir.** Todavía no hay código del mapa. Ya están instalados `leaflet`, `react-leaflet` y `@types/leaflet`, y el CSS de Leaflet se importa en `src/main.tsx`.

## Dónde se usa

| Lugar | Para qué |
|---|---|
| `/mapa` (`src/features/mapa/`) | Ver los reportes aprobados por zona, filtrar y abrir la ficha |
| `/reportar` (`src/features/reportes/`) | Mini mapa para **elegir una zona** (no un punto) |

## 🔒 Regla principal: nunca la ubicación exacta

- La base **no guarda coordenadas de los reportes**: solo `zona_id`. Las únicas coordenadas son las del **centro de cada zona** (`zonas.lat_centro` y `zonas.lng_centro`).
- Todo se dibuja en el centro de la zona y con un **círculo** que deja claro que la ubicación es aproximada.
- No usar `navigator.geolocation` para guardar dónde está el perrito. Si algún día se usa para sugerir la zona más cercana, la coordenada **no se envía ni se guarda**.
- No permitir un zoom que dé a entender una casa concreta. Propuesta: `maxZoom` de 16.

## Mapa base

- **Teselas:** OpenStreetMap, `https://tile.openstreetmap.org/{z}/{x}/{y}.png`.
- **Atribución obligatoria:** `© OpenStreetMap` con enlace a `https://www.openstreetmap.org/copyright`. Es parte de la licencia y **no se puede quitar ni tapar** (cuidado con la leyenda y las tarjetas flotantes).
- **Centro inicial:** Santiago Ixcuintla, aproximadamente `21.811, -105.209`, el centro de la zona "Centro" en la base. Zoom inicial de 14 a 15.
- **Límites:** `maxBounds` alrededor de la ciudad para que nadie se pierda en el mapa.
- **Uso justo de OSM:** las teselas públicas de OpenStreetMap son para uso moderado. **No** se precargan ni se guardan en el service worker para uso sin conexión. Si el tráfico crece, se cambia a otro proveedor de teselas (MapTiler, Stadia, etc.).

## Zonas aproximadas: `<Circle>` punteado

Cada zona es un `<Circle>` de react-leaflet en `lat_centro` / `lng_centro`, con estos estilos:

| Propiedad | Propuesta | Por qué |
|---|---|---|
| Borde | punteado (`dashArray`), 2 px, verde marca `#2E7D5B` | Igual que `.pin-area` del diseño |
| Relleno | verde marca al 8 % | Igual que `rgba(46,125,91,0.08)` |
| Radio | unos 300-350 m | Los centros de zona están a unos 700 m entre sí; un radio mayor haría que los círculos se encimen |

**Por decidir:** ¿las zonas deberían ser polígonos reales de colonias en lugar de círculos? Sería más preciso, pero hay que dibujarlos y guardarlos.

## Marcadores con ícono de huella

- Ícono con `L.divIcon` usando el **SVG de la huella** (el mismo de `src/layout/IconoHuella.tsx`): un círculo de 44 px, borde blanco de 3 px y sombra, como `.pin` en `css/styles.css` (224-322).
- `divIcon` también evita el problema conocido de las imágenes del marcador por defecto de Leaflet con Vite.
- **Tamaño táctil:** mínimo 44 × 44 px.

### Colores por estado (`estado_caso`)

| Estado | Marcador (`-pin`) | Chip e insignia (`-fondo` / `-texto`) |
|---|---|---|
| `necesita_ayuda` · Necesita ayuda | `ayuda-pin` `#E8863A` | `#FDE3CC` / `#8A3A0C` |
| `en_seguimiento` · En seguimiento | `seguimiento-pin` `#2F6B95` | `#DCEAF5` / `#1F4F7A` |
| `atendido` · Atendido | `atendido-pin` `#3E8E63` | `#DDEFE3` / `#1F5A3A` |

Todos ya existen como tokens de Tailwind en `src/index.css`. Como `divIcon` recibe HTML, se pueden usar las clases (`bg-ayuda-pin`) o `var(--color-ayuda-pin)`.

### Varios reportes en la misma zona: por decidir

Como todos los reportes de una zona comparten coordenadas, sus marcadores quedarían encimados. Hay dos opciones:

1. **Un marcador por zona con un número** (por ejemplo, "3"). Al tocarlo, se filtra la lista de la izquierda. Es el más honesto con la privacidad y el más sencillo.
2. **Repartirlos dentro del círculo** con una posición calculada **solo a partir del id del reporte**, siempre la misma para cada id y sin ningún dato real de ubicación. Se parece más al diseño actual, pero da una falsa sensación de precisión.

Recomendación: **opción 1**. Hay que validarlo con quien diseña.

## Interacción (según el diseño)

- **Lista lateral y mapa sincronizados:** al tocar un reporte en la lista se resalta en el mapa, y al tocarlo en el mapa se resalta en la lista.
- **Tarjeta del reporte:** usar la tarjeta propia del diseño (`.map-popup`) en lugar del `<Popup>` de Leaflet, para respetar el estilo. Va arriba a la derecha y abajo en el celular.
- **Leyenda de colores** abajo a la derecha. En el celular se oculta.
- **Chips de filtro por estado y buscador por zona:** filtran los marcadores y la lista al mismo tiempo.
- **Selector de zona en `/reportar`:** tocar un círculo selecciona la zona y se guarda solo su `zona_id`. Para accesibilidad, ofrecer también una lista o `<select>` de zonas.

## Otros detalles técnicos

- **Capas:** los controles de Leaflet usan `z-index: 1000`. El encabezado del sitio tiene `z-[1100]` para quedar encima al hacer scroll. No subir el z-index del mapa.
- **Carga diferida:** conviene cargar la página del mapa con `React.lazy`, para que Leaflet no se descargue en la portada.
- **Altura:** el contenedor necesita una altura definida. En el diseño son 680 px en escritorio y 520 px en el celular.
- **Datos:** `GET /api/zonas` ✅ y `GET /api/reportes` ⏳ (ver [API.md](API.md)).
