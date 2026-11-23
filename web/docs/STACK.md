# Stack tecnológico de GeoPatitas

> Documento para discutir con el equipo. Lo marcado como **propuesto** o **por definir** todavía no está decidido.

## Resumen

| Capa | Tecnología | Estado |
|---|---|---|
| Interfaz | React 19 + TypeScript | ✅ instalado en `web/` |
| Herramienta de desarrollo y build | Vite 8 | ✅ instalado |
| Estilos | Tailwind CSS 4 (tokens del diseño en `src/index.css`) | ✅ configurado |
| Navegación | React Router 8 | ✅ configurado |
| App instalable / sin conexión | vite-plugin-pwa (Workbox) | ✅ configurado |
| Mapa | Leaflet + react-leaflet + OpenStreetMap | ✅ instalado (sin componentes todavía) |
| API | Node.js + Express 5 + TypeScript | ✅ en `api/` (en desarrollo) |
| Base de datos | MySQL / MariaDB (XAMPP en local) | ✅ base `geopatitas` |
| Fotos | Cloudinary | 🟡 propuesto |
| Login de moderadores | bcrypt + JWT | 🟡 propuesto |
| Hosting del frontend | Vercel | 🟡 propuesto |
| Hosting de API y MySQL | — | ⚪ por definir |
| Gestor de paquetes | pnpm | ✅ |

---

## Frontend

### React
**Para qué:** construir la interfaz con componentes reutilizables (carteles, insignias, botones, tarjetas).
**Por qué:** es la librería de interfaz más usada, con muchísima documentación y tutoriales en español. Cada sección vive en su carpeta y cada compañera puede trabajar la suya sin pisar la de las demás. El diseño actual repite piezas (carteles "SE BUSCA", insignias de estado) que en React se escriben una vez y se reutilizan.

### Vite
**Para qué:** servidor de desarrollo (`pnpm dev`) y empaquetado para producción (`pnpm build`).
**Por qué:** arranca en menos de un segundo y recarga al instante al guardar. Su proxy (`/api` → `localhost:3000`) evita los problemas de CORS en local. Es el estándar actual para proyectos React sin servidor propio.

### TypeScript
**Para qué:** que el editor avise de los errores antes de abrir el navegador.
**Por qué:** los tipos de `src/types/` salen directo de la base de datos (`api/sql/geopatitas.sql`). Si alguien escribe `reporte.tamaño` en lugar de `reporte.tamano`, o `'chico'` en lugar de `'pequeno'`, el editor lo marca. La API también está en TypeScript, así que todo el equipo usa un solo lenguaje.

### Tailwind CSS
**Para qué:** dar estilo con clases directamente en el JSX (`bg-accion text-accion-texto rounded-boton`).
**Por qué:** los colores, tipografías y radios del diseño (`css/styles.css`) ya están cargados como **tokens** en `src/index.css`. Así nadie inventa un naranja distinto y todas las secciones se ven iguales. Además, no hay que pensar nombres de clases ni preocuparse de que un CSS rompa otra sección. Se usa la versión 4, que se configura en CSS (`@theme`) y no necesita `tailwind.config.js`.

### React Router
**Para qué:** las rutas de la app (`/mapa`, `/reportar`, `/reporte/:id`, …) y el layout compartido.
**Por qué:** es el enrutador estándar de React. Reemplaza la navegación por `#hash` del diseño viejo por URL reales, que se pueden compartir: un enlace a `/reporte/142` se abre directo en la ficha.

### vite-plugin-pwa
**Para qué:** generar el `manifest.webmanifest` y el service worker para que GeoPatitas **se pueda instalar** en el celular y abra sin conexión.
**Por qué:** antes había que editar `sw.js` a mano y subir `CACHE_VERSION` en cada cambio. El plugin genera todo en cada build y actualiza la app sola (`registerType: 'autoUpdate'`).

### Leaflet + react-leaflet + OpenStreetMap
**Para qué:** el mapa interactivo de reportes y el selector de zona del formulario.
**Por qué:**
- **Gratis y sin tarjeta de crédito.** Google Maps y Mapbox piden una cuenta de facturación.
- Leaflet es ligero (unos 40 KB) y funciona bien en celulares sencillos.
- OpenStreetMap tiene buen detalle de Santiago Ixcuintla, y cualquiera puede mejorarlo.
- `react-leaflet` permite escribir el mapa como componentes de React (`<MapContainer>`, `<Circle>`, `<Marker>`).

La propuesta de uso está en [MAPA.md](MAPA.md).

---

## Backend

### API: Node.js + Express + TypeScript
**Para qué:** recibir reportes, moderarlos y entregar al frontend **solo** los datos públicos.
**Por qué:** es el mismo lenguaje que el frontend (TypeScript) y Express es simple de aprender. La API es la que protege la privacidad: el frontend nunca habla directo con la base. Vive en `api/` y la programa el responsable de la API. Ver [API.md](API.md).

### MySQL (MariaDB en XAMPP)
**Para qué:** guardar zonas, reportes, seguimiento, adopciones, aliados, avisos y moderadores.
**Por qué:** XAMPP ya trae MySQL y phpMyAdmin para trabajar en local sin instalar nada más. Las **vistas** (`v_reportes_publicos`, `v_estadisticas`, …) ya filtran los datos aprobados y quitan los privados.

### Fotos: Cloudinary (propuesto)
**Para qué:** guardar las fotos de los reportes y las adopciones, y entregarlas optimizadas.
**Por qué:**
- Tiene plan gratuito suficiente para el proyecto.
- Redimensiona y comprime solo, así las fotos cargan rápido con datos móviles.
- Devuelve una URL y un id que encajan con las columnas `foto_url` y `foto_id` que ya tiene la base.

**Por decidir:** si la foto se sube desde la API (más seguro, la clave queda en el servidor) o directo desde el navegador con un *upload preset* firmado. En los dos casos hay que **quitar los datos GPS/EXIF** ([REGLAS.md](REGLAS.md)).

### Login de moderadores: bcrypt + JWT (propuesto)
**Para qué:** que solo el equipo entre al panel de moderación.
**Por qué:**
- **bcrypt** guarda la contraseña como hash (`moderadores.password_hash`). Si alguien roba la base, no ve las contraseñas.
- **JWT** es un token firmado que el frontend manda en cada petición (`Authorization: Bearer …`). La API no necesita guardar sesiones.
- `src/lib/api.ts` ya acepta la opción `token`.

---

## Hosting

### Frontend: Vercel (propuesto)
**Por qué:** es gratis para proyectos así, da HTTPS automático (obligatorio para instalar la PWA en el celular), publica una vista previa por cada Pull Request y detecta Vite solo.
**Configuración:** raíz del proyecto `web/`, comando `pnpm build` y salida `dist`. El archivo `web/vercel.json` ya redirige todas las rutas a `index.html`, así que `/reporte/142` funciona al recargar.
**Variable de entorno en Vercel:** `VITE_API_URL` = la URL pública de la API.

### API y MySQL: por definir
Opciones para discutir: Railway, Render, Fly.io o un VPS. Que la API y la base estén en el mismo proveedor reduce la latencia. Antes de publicar, la API necesita **CORS** ([API.md](API.md)).
