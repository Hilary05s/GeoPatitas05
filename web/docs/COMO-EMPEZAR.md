# Cómo empezar

Guía para correr GeoPatitas en tu computadora: base de datos, API y frontend.

## 0. Requisitos (una sola vez)

| Programa | Versión | Cómo revisarlo |
|---|---|---|
| [Node.js](https://nodejs.org) | 22 o más reciente | `node -v` |
| [pnpm](https://pnpm.io/es/installation) | 11 | `pnpm -v` (para instalarlo: `npm install -g pnpm`) |
| [XAMPP](https://www.apachefriends.org/es/) | con MySQL/MariaDB | — |
| Git | — | `git --version` |

Editor recomendado: VS Code con la extensión **Tailwind CSS IntelliSense**.

```bash
git clone https://github.com/Hilary05s/GeoPatitas05.git
cd GeoPatitas05
```

## 1. Base de datos (XAMPP)

1. Abre el **XAMPP Control Panel** y presiona **Start** en **MySQL**. Si quieres usar phpMyAdmin, inicia también **Apache**.
2. **Solo la primera vez:** importa la base.
   - Entra a http://localhost/phpmyadmin.
   - Abre la pestaña **Importar**, elige `api/sql/geopatitas.sql` y presiona **Importar**.
   - Se crea la base `geopatitas` con sus tablas, vistas y 5 zonas de ejemplo.

## 2. API (`api/`)

```bash
cd api
pnpm install
```

Crea el archivo `api/.env` (no se sube a git) con los datos de tu MySQL. Con XAMPP normalmente quedan así:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=geopatitas
```

Enciende la API:

```bash
pnpm tsx src/index.ts
```

Revisa que funcione en http://localhost:3000/api: debe responder `{"mensaje":"GeoPatitas API funcionando"}`. En http://localhost:3000/api/zonas deben salir las 5 zonas.

> Deja esta terminal abierta. Para apagar la API usa `Ctrl + C`.

## 3. Frontend (`web/`)

En **otra terminal**:

```bash
cd web
pnpm install
cp .env.example .env      # en PowerShell: Copy-Item .env.example .env
pnpm dev
```

Abre http://localhost:5173. Deberías ver el encabezado, el pie y poder navegar entre las secciones.

Para comprobar que el frontend llega a la API, abre http://localhost:5173/api/zonas: deben salir las mismas zonas, pasando por el proxy de Vite.

## Comandos del frontend

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo con recarga automática (http://localhost:5173) |
| `pnpm build` | Revisa los tipos de TypeScript y genera la versión de producción en `dist/` |
| `pnpm preview` | Sirve la versión de `dist/` (http://localhost:4173) para probar la PWA |
| `pnpm typecheck` | Solo revisa los tipos |

## Probar la PWA (instalar la app)

El service worker **no corre con `pnpm dev`**, solo con la versión de producción:

```bash
pnpm build
pnpm preview
```

Abre http://localhost:4173 en Chrome o Edge. Aparece el ícono **Instalar** en la barra de direcciones. En DevTools, la pestaña **Application** muestra el manifest y el service worker.

> Para instalarla en el celular se necesita **HTTPS**, así que se prueba en el despliegue de Vercel.

## ¿Dónde está cada cosa?

```
web/
├── docs/                 ← esta documentación
├── public/icons/         ← íconos de la PWA (copiados de /icons)
├── src/
│   ├── main.tsx          ← punto de entrada (importa Tailwind y el CSS de Leaflet)
│   ├── router.tsx        ← todas las rutas
│   ├── index.css         ← tokens del diseño (colores, tipografías)
│   ├── layout/           ← encabezado, pie y marco de todas las páginas
│   ├── components/       ← componentes compartidos (vacía por ahora)
│   ├── features/<seccion>/  ← TU sección: página + README con lo que hay que hacer
│   ├── lib/api.ts        ← función para llamar a la API
│   └── types/            ← tipos de la base de datos
├── .env.example          ← plantilla de variables (copiar como .env)
└── vite.config.ts        ← Vite, Tailwind, PWA y proxy /api
```

## Problemas comunes

| Problema | Solución |
|---|---|
| `ECONNREFUSED` o "No se pudo conectar con la API" | La API no está encendida (paso 2) o MySQL está apagado en XAMPP |
| La API marca un error de acceso a MySQL | Revisa el usuario y la contraseña en `api/.env` |
| `Table 'geopatitas.zonas' doesn't exist` | No importaste `api/sql/geopatitas.sql` (paso 1) |
| El puerto 3306 está ocupado | Hay otro MySQL corriendo. Ciérralo o cambia el puerto en XAMPP y en `DB_PORT` |
| Cambié `.env` y no pasa nada | Reinicia `pnpm dev`, porque Vite solo lee `.env` al arrancar |
| Las fuentes no cargan | Se descargan de Google Fonts: revisa tu conexión a internet |
