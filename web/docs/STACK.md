# Stack tecnológico de GeoPatitas

> Qué tecnologías usa el proyecto, para qué sirve cada una y por qué se eligió.
> **Estado:** ✅ hecho · 🟡 propuesto (falta decidir o configurar) · ⚪ por definir.

## Resumen

| Capa | Tecnología | Estado |
|---|---|---|
| Interfaz | React 19 + TypeScript | ✅ base lista en `web/`: rutas, layout y tema. Las secciones son placeholders que programa cada responsable |
| Herramienta de desarrollo y build | Vite 8 | ✅ configurado, con proxy `/api` para desarrollo |
| Estilos | Tailwind CSS 4 (tokens del diseño en `src/index.css`) | ✅ configurado |
| Navegación | React Router 8 | ✅ configurado |
| App instalable / sin conexión | vite-plugin-pwa (Workbox) | ✅ configurado |
| Mapa | Leaflet + react-leaflet + OpenStreetMap | ✅ instalado (sin componentes todavía; ver [MAPA.md](MAPA.md)) |
| API | Node.js + Express 5 + TypeScript | ✅ terminada en `api/`: lecturas públicas, crear reportes con foto, login y moderación |
| Validación | zod | ✅ en todo lo que entra a la API y en el `.env` |
| Seguridad de la API | helmet, express-rate-limit, CORS | ✅ configurado |
| Base de datos | MySQL / MariaDB (XAMPP en local) | ✅ base `geopatitas` (scripts en `api/sql/`) |
| Fotos | multer + sharp + Cloudinary, desde la API | ✅ integrado en la API (falta poner las credenciales de Cloudinary) |
| Login de moderadores | bcrypt (bcryptjs) + JWT | ✅ terminado en la API. La pantalla de login del panel la programa la sección de moderación |
| Hosting del frontend | Vercel | 🟡 propuesto (`web/vercel.json` ya está listo) |
| Hosting de API y MySQL | — | ⚪ por definir |
| Gestor de paquetes | pnpm | ✅ |

---

## Frontend (`web/`)

### React
**Para qué:** construir la interfaz con componentes reutilizables (carteles, insignias, botones, tarjetas).
**Por qué:** es la librería de interfaz más usada, con muchísima documentación y tutoriales en español. Cada sección vive en su carpeta y cada compañera puede trabajar la suya sin pisar la de las demás. El diseño actual repite piezas (carteles "SE BUSCA", insignias de estado) que en React se escriben una vez y se reutilizan.

### Vite
**Para qué:** servidor de desarrollo (`pnpm dev`) y empaquetado para producción (`pnpm build`).
**Por qué:** arranca en menos de un segundo y recarga al instante al guardar. Su proxy (`/api` → `localhost:3000`) evita los problemas de CORS en local. Es el estándar actual para proyectos React sin servidor propio.

### TypeScript
**Para qué:** que el editor avise de los errores antes de abrir el navegador.
**Por qué:**
- `src/types/` tiene los tipos de las tablas y vistas de la base (sacados de `api/sql/geopatitas.sql`) y los de las respuestas de la API (`respuestas.ts`: login, pendientes, seguimiento).
- Si alguien escribe `reporte.tamaño` en lugar de `reporte.tamano`, o `'chico'` en lugar de `'pequeno'`, el editor lo marca.
- La API también está en TypeScript, así que todo el equipo usa un solo lenguaje.

### Tailwind CSS
**Para qué:** dar estilo con clases directamente en el JSX (`bg-accion text-accion-texto rounded-boton`).
**Por qué:** los colores, tipografías y radios del diseño (`css/styles.css`) ya están cargados como **tokens** en `src/index.css`. Así nadie inventa un naranja distinto y todas las secciones se ven iguales. Además, no hay que pensar nombres de clases ni preocuparse de que un CSS rompa otra sección. Se usa la versión 4, que se configura en CSS (`@theme`) y no necesita `tailwind.config.js`.

### React Router
**Para qué:** las rutas de la app (`/mapa`, `/reportar`, `/reporte/:id`, …) y el layout compartido.
**Por qué:** es el enrutador estándar de React. Reemplaza la navegación por `#hash` del diseño viejo por URL reales, que se pueden compartir: un enlace a `/reporte/142` se abre directo en la ficha.

### vite-plugin-pwa
**Para qué:** generar el `manifest.webmanifest` y el service worker para que GeoPatitas **se pueda instalar** en el celular y abra sin conexión.
**Por qué:** antes había que editar `sw.js` a mano y subir `CACHE_VERSION` en cada cambio. El plugin genera todo en cada build y actualiza la app sola (`registerType: 'autoUpdate'`). Las peticiones a `/api` nunca se guardan en caché.

### Leaflet + react-leaflet + OpenStreetMap
**Para qué:** el mapa interactivo de reportes y el selector de zona del formulario.
**Por qué:**
- **Gratis y sin tarjeta de crédito.** Google Maps y Mapbox piden una cuenta de facturación.
- Leaflet es ligero (unos 40 KB) y funciona bien en celulares sencillos.
- OpenStreetMap tiene buen detalle de Santiago Ixcuintla, y cualquiera puede mejorarlo.
- `react-leaflet` permite escribir el mapa como componentes de React (`<MapContainer>`, `<Circle>`, `<Marker>`).

Ya están instalados y su CSS se importa en `src/main.tsx`. La propuesta de uso, para discutir con el equipo, está en [MAPA.md](MAPA.md).

---

## Backend (`api/`)

### API: Node.js + Express 5 + TypeScript
**Para qué:** recibir reportes, moderarlos y entregar al frontend **solo** los datos públicos y aprobados.
**Por qué:** es el mismo lenguaje que el frontend (TypeScript) y Express es simple de aprender. La API es la que protege la privacidad: el frontend nunca habla directo con la base.

**Estado:** ✅ terminada.

| Ya hace | Endpoints |
|---|---|
| Lecturas públicas | zonas, reportes (con filtros y paginación), ficha, seguimiento, adopciones, aliados, estadísticas |
| Crear reportes | `POST /api/reportes`, con foto opcional; quedan pendientes de moderación |
| Login | `POST /api/auth/login` y `GET /api/auth/yo` |
| Moderación | pendientes, aprobar, eliminar (borra la foto) y cambiar el estado del caso |

**Falta** (⏳ en [API.md](API.md)): avisos ("Quiero ayudar", "Quiero ser aliado"), resumen por zonas, detalle y alta de adopciones, y la moderación de adopciones, avisos y aliados.

Cómo instalarla y correrla: [api/README.md](../../api/README.md). Endpoints: [API.md](API.md).

### Validación: zod
**Para qué:** revisar todo lo que llega a la API (body, query, params) y las variables del `.env`.
**Por qué:** un solo lugar define qué es válido y devuelve errores claros por campo (`campos: { color: "Es obligatorio" }`), que el frontend puede marcar en el formulario. Además, rechaza cualquier campo que no esté permitido; por ejemplo, la API nunca acepta coordenadas exactas (`lat`, `lng`). Si el `.env` está mal, la API no arranca y dice qué variable falta.

### Seguridad de la API: helmet, express-rate-limit y CORS
**Para qué:** proteger la API publicada en internet.
**Por qué:**
- **helmet:** cabeceras HTTP de seguridad con una sola línea.
- **express-rate-limit:**
  - 300 peticiones cada 15 minutos por IP en general.
  - 5 reportes cada 10 minutos, más un tope diario que se cuenta en la base.
  - 5 intentos fallidos de login cada 15 minutos.
- **CORS:** solo los dominios de `CORS_ORIGIN` pueden llamar a la API desde el navegador.
- **SQL:** todas las consultas son parametrizadas.
- **Errores:** siempre en JSON, sin detalles internos.

### MySQL (MariaDB en XAMPP)
**Para qué:** guardar zonas, reportes, seguimiento, adopciones, aliados, avisos, moderadores y la bitácora de moderación.
**Por qué:** XAMPP ya trae MySQL y phpMyAdmin para trabajar en local sin instalar nada más. Las **vistas** (`v_reportes_publicos`, `v_estadisticas`, …) ya filtran los datos aprobados y quitan los privados.

**Scripts** (en `api/sql/`, se ejecutan en orden):
1. `geopatitas.sql`
2. `002-folio-vista.sql`

`datos-prueba.sql` es solo para desarrollo local y **nunca** se carga en producción. Detalle en [COMO-EMPEZAR.md](COMO-EMPEZAR.md).

### Fotos: multer + sharp + Cloudinary (desde la API)
**Para qué:** recibir, limpiar y guardar las fotos de los reportes.
**Por qué:**
- **multer** recibe la foto en memoria, nunca en disco, con límites de tamaño y de tipo.
- **sharp** valida que el archivo sea una imagen real, la reduce y **quita los metadatos EXIF/GPS**. Es rápido y trae binarios listos para Windows, macOS y Linux.
- **Cloudinary** tiene plan gratuito suficiente, entrega las fotos optimizadas para datos móviles y devuelve una URL y un id que encajan con las columnas `foto_url` y `foto_id` de la base.

**Cómo funciona:** la foto se sube desde la API, y las claves de Cloudinary quedan solo en el servidor (`api/.env`), nunca en el navegador.
1. El frontend manda la foto **junto con el reporte** en `POST /api/reportes` (`multipart/form-data`, campo `foto`). No hay un endpoint aparte para fotos.
2. La API valida que sea JPG, PNG o WebP de máximo 5 MB, la endereza, la reduce a 1600 px y la convierte a JPEG. HEIC no se acepta, porque sharp no trae ese decodificador.
3. La API **quita todos los metadatos (EXIF/GPS)**.
4. La API la sube a Cloudinary y guarda `foto_url` y `foto_id`.
5. Si un moderador elimina el reporte, la API también borra la foto de Cloudinary.

**Pendiente:** poner las credenciales de Cloudinary en el `.env`. Mientras tanto, los reportes se guardan sin foto y la API lo avisa. Detalle en [API.md](API.md) y en [api/README.md](../../api/README.md).

### Login de moderadores: bcrypt + JWT
**Para qué:** que solo el equipo entre al panel de moderación.
**Por qué:**
- **bcrypt** guarda la contraseña como hash (`moderadores.password_hash`). Si alguien roba la base, no ve las contraseñas. Se usa **bcryptjs**: el mismo algoritmo y formato de hash, pero en JavaScript puro, sin compilar código nativo, lo que evita problemas al instalar en Windows.
- **JWT** es un token firmado que el frontend manda en cada petición (`Authorization: Bearer …`). La API no necesita guardar sesiones.

**Estado:** ✅ terminado en la API.
- `POST /api/auth/login` devuelve el token. El mensaje de error es el mismo y tarda lo mismo exista o no el correo.
- Los tokens son HS256 y vencen según `JWT_EXPIRES_IN` (8 h por defecto).
- Si se desactiva a un moderador, su sesión deja de servir de inmediato.
- Los moderadores se crean desde la terminal con `pnpm crear-moderador`; no hay registro público.
- En el frontend, `src/lib/api.ts` ya acepta la opción `token` y los tipos `RespuestaLogin` y `CredencialesLogin` están en `src/types/`.

**Falta:** la pantalla de login del panel, que la programa la sección de moderación (`src/features/moderacion/`).

---

## Hosting

### Frontend: Vercel (propuesto)
**Por qué:** es gratis para proyectos así, da HTTPS automático (obligatorio para instalar la PWA en el celular), publica una vista previa por cada Pull Request y detecta Vite solo.
**Configuración:** raíz del proyecto `web/`, comando `pnpm build` y salida `dist`. El archivo `web/vercel.json` ya redirige todas las rutas a `index.html`, así que `/reporte/142` funciona al recargar.
**Variable de entorno en Vercel:** `VITE_API_URL` = la URL pública de la API.

### API y MySQL: por definir
Opciones para discutir: Railway, Render, Fly.io o un VPS. Que la API y la base estén en el mismo proveedor reduce la latencia.

La API ya está lista para publicarse: tiene CORS configurable, límites de peticiones y modo producción. Antes de subirla, sigue la lista de [api/README.md → Producción](../../api/README.md#10-producción). Lo principal:
- `CORS_ORIGIN` con el dominio del frontend.
- Secretos nuevos.
- `TRUST_PROXY` según el hosting.
- **No** cargar `datos-prueba.sql`.
