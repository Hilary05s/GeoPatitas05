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
2. **Solo la primera vez:** importa la base. Los scripts de `api/sql/` se ejecutan **en este orden**:

   | Orden | Archivo | Qué hace |
   |---|---|---|
   | 1 | `api/sql/geopatitas.sql` | Crea la base `geopatitas` con sus tablas, vistas y 5 zonas de ejemplo |
   | 2 | `api/sql/002-folio-vista.sql` | Corrige el folio de la vista `v_reportes_publicos` para que no se recorte con ids de 5 dígitos o más |

   - **phpMyAdmin:** entra a http://localhost/phpmyadmin, abre la pestaña **Importar**, elige el archivo 1 y presiona **Importar**. Repite con el archivo 2.
   - **Terminal** (desde la raíz del repositorio; si tu usuario de MySQL tiene contraseña, agrega `-p`):
     ```bash
     C:/xampp/mysql/bin/mysql.exe -u root < api/sql/geopatitas.sql
     C:/xampp/mysql/bin/mysql.exe -u root geopatitas < api/sql/002-folio-vista.sql
     ```
   - ¿Ya tenías la base importada de antes? Solo ejecuta el archivo 2.

   > Si en el futuro aparece un `003-….sql`, se ejecuta después del 002, y así sucesivamente.

## 2. API (`api/`)

> La guía completa de la API (todas las variables, seguridad, producción y problemas comunes) está en **[api/README.md](../../api/README.md)**. Aquí va lo mínimo para correrla en tu computadora.

```bash
cd api
pnpm install
cp .env.example .env      # en PowerShell: Copy-Item .env.example .env
```

Abre `api/.env` (no se sube a git) y llena **dos variables obligatorias**. Sin ellas, la API no arranca:

| Variable | Qué poner |
|---|---|
| `JWT_SECRET` | Un texto aleatorio de 32 caracteres o más |
| `IP_HASH_SALT` | Otro texto aleatorio, distinto al anterior |

Para generar cada uno, ejecuta este comando (una vez por variable) y copia el resultado:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Las variables de la base (`DB_HOST`, `DB_USER`, `DB_PASSWORD`…) ya vienen con los valores normales de XAMPP. Cámbialas solo si tu MySQL tiene otra contraseña o puerto. Cloudinary es opcional: sin él, los reportes se guardan sin foto.

Enciende la API:

```bash
pnpm dev
```

En la consola debe salir `🐾 GeoPatitas API en http://localhost:3000/api` y `✅ Conectado a MySQL`. Revisa que funcione en http://localhost:3000/api: debe responder `{"mensaje":"GeoPatitas API funcionando"}`. En http://localhost:3000/api/zonas deben salir las 5 zonas.

> Deja esta terminal abierta. Para apagar la API usa `Ctrl + C`.

**Si vas a trabajar en el panel de moderación**, crea tu usuario de moderador (pide nombre, correo y contraseña):

```bash
pnpm crear-moderador
```

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
| La API dice `❌ Configuración inválida en el archivo .env` | Falta `JWT_SECRET` o `IP_HASH_SALT` en `api/.env` (paso 2). El mensaje dice cuál |
| La API dice `⚠️ No se pudo conectar a MySQL (ER_ACCESS_DENIED_ERROR)` | Revisa `DB_USER` y `DB_PASSWORD` en `api/.env` |
| La API responde `503` | MySQL está apagado en XAMPP |
| `Table 'geopatitas.zonas' doesn't exist` | No importaste `api/sql/geopatitas.sql` (paso 1) |
| El puerto 3306 está ocupado | Hay otro MySQL corriendo. Ciérralo o cambia el puerto en XAMPP y en `DB_PORT` |
| Cambié `.env` y no pasa nada | Reinicia `pnpm dev` (en `web/` o en `api/`, según el `.env` que cambiaste): los dos solo leen `.env` al arrancar |
| Más problemas de la API | Ver la tabla de [api/README.md](../../api/README.md#11-problemas-comunes) |
| Las fuentes no cargan | Se descargan de Google Fonts: revisa tu conexión a internet |
