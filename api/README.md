# GeoPatitas · API

API de GeoPatitas en **Node.js + Express 5 + TypeScript + MySQL/MariaDB**. Recibe los reportes de perritos en situación de calle en Santiago Ixcuintla, los pasa por moderación y entrega al frontend **solo** los datos públicos y aprobados.

- **Endpoints** (qué recibe y qué devuelve cada uno): [web/docs/API.md](../web/docs/API.md)
- **Probar a mano:** [peticiones.http](peticiones.http) (extensión **REST Client** de VS Code)
- **Base de datos:** [sql/](sql/)

---

## 1. Requisitos

| Programa | Versión |
|---|---|
| Node.js | 22 o más reciente |
| pnpm | 11 |
| XAMPP (MySQL/MariaDB) | MariaDB 10.4 o más reciente |

## 2. Instalar

```bash
cd api
pnpm install
```

> `sharp`, que procesa las fotos, trae binarios ya compilados para Windows, macOS y Linux. No hay que compilar nada.

## 3. Base de datos

Enciende **MySQL** en el XAMPP Control Panel y ejecuta los scripts de `sql/` **en este orden**:

| Orden | Archivo | Qué hace | ¿Producción? |
|---|---|---|---|
| 1 | `sql/geopatitas.sql` | Crea la base `geopatitas`: 8 tablas, 4 vistas y 5 zonas | ✅ Sí |
| 2 | `sql/002-folio-vista.sql` | Corrige el folio de `v_reportes_publicos` (no se recorta con ids de 5 dígitos o más) | ✅ Sí |
| — | `sql/datos-prueba.sql` | Datos **ficticios** para desarrollar (reportes, adopciones, aliados) | ⛔ **NUNCA** |

Desde la raíz del repositorio (si tu usuario de MySQL tiene contraseña, agrega `-p`):

```bash
C:/xampp/mysql/bin/mysql.exe -u root < api/sql/geopatitas.sql
C:/xampp/mysql/bin/mysql.exe -u root geopatitas < api/sql/002-folio-vista.sql

# Opcional, SOLO en tu computadora:
C:/xampp/mysql/bin/mysql.exe -u root geopatitas < api/sql/datos-prueba.sql
```

También puedes usar **phpMyAdmin → Importar**, un archivo a la vez y en el mismo orden.

- ¿Ya tenías la base de antes? Solo ejecuta los scripts que te falten, siguiendo el orden.
- Los cambios futuros a la base van en archivos nuevos numerados (`003-….sql`, `004-….sql`) que se ejecutan después de los anteriores. **No se edita** `geopatitas.sql`.

> ### ⛔ `datos-prueba.sql` nunca se carga en producción
> Tiene reportes, adopciones y aliados **inventados** (ids 9001 en adelante, marcados `[PRUEBA]`). En producción aparecerían en el mapa público como si fueran reales.
> Es solo para desarrollar en tu computadora. Se puede cargar varias veces sin duplicar nada.

## 4. Configurar (`.env`)

Copia `.env.example` como `.env` y llena los valores. El `.env` **nunca se sube a git**.

```bash
cp .env.example .env        # PowerShell: Copy-Item .env.example .env
```

| Variable | Obligatoria | Por defecto | Para qué |
|---|---|---|---|
| `NODE_ENV` | | `development` | `production` en el servidor |
| `PORT` | | `3000` | Puerto de la API |
| `DB_HOST` · `DB_PORT` · `DB_USER` · `DB_PASSWORD` · `DB_NAME` | | `localhost` · `3306` · `root` · *(vacía)* · `geopatitas` | Conexión a MySQL |
| `CORS_ORIGIN` | | `http://localhost:5173` | Dominios del frontend que pueden llamar a la API, separados por coma |
| `TRUST_PROXY` | | `0` | Número de proxies delante de la API (en la mayoría de los hostings: `1`) |
| `JWT_SECRET` | ✔ | — | Firma de las sesiones. **Mínimo 32 caracteres** aleatorios |
| `JWT_EXPIRES_IN` | | `8h` | Duración de la sesión (`30m`, `8h`, `1d`) |
| `IP_HASH_SALT` | ✔ | — | Sal secreta para guardar la IP como hash (anti-spam). Mínimo 16 caracteres |
| `MAX_REPORTES_POR_IP_DIA` | | `10` | Reportes por IP en 24 horas |
| `CLOUDINARY_CLOUD_NAME` · `CLOUDINARY_API_KEY` · `CLOUDINARY_API_SECRET` | | — | Fotos. **Las tres o ninguna**. Sin ellas, los reportes se crean sin foto |
| `CLOUDINARY_FOLDER` | | `geopatitas` | Carpeta de Cloudinary |

Para generar `JWT_SECRET` e `IP_HASH_SALT`, usa un valor distinto para cada una:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Si falta algo o tiene un formato incorrecto, la API **no arranca** y dice qué variable revisar.

## 5. Crear el primer moderador

```bash
pnpm crear-moderador
```

- Pide nombre, correo, contraseña (no se ve al escribirla) y rol.
- La contraseña necesita mínimo 10 caracteres, con letras y números. Se guarda como hash **bcrypt**; nunca se escribe en el código.
- Si todavía no hay moderadores activos, sugiere el rol `admin`.

## 6. Correr

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Modo desarrollo, se reinicia al guardar → http://localhost:3000/api |
| `pnpm typecheck` | Revisa los tipos de TypeScript |
| `pnpm build` | Compila a `dist/` |
| `pnpm start` | Corre la versión compilada (producción) |
| `pnpm crear-moderador` | Crea un moderador |

Al arrancar, la consola muestra:

```
🐾 GeoPatitas API en http://localhost:3000/api (development)
   CORS permitido para: http://localhost:5173
⚠️  Fotos: faltan las credenciales de Cloudinary en el .env. Los reportes se crearán SIN foto.
✅ Conectado a MySQL (localhost:3306/geopatitas)
```

Para comprobar que funciona: http://localhost:3000/api y http://localhost:3000/api/zonas.

## 7. Endpoints

| | Método | Ruta | Login |
|---|---|---|---|
| Estado | GET | `/api` | |
| Zonas | GET | `/api/zonas` | |
| Reportes | GET | `/api/reportes?estado=&zona=&limite=&pagina=` | |
| | GET | `/api/reportes/:id` | |
| | GET | `/api/reportes/:id/seguimiento` | |
| | POST | `/api/reportes` (JSON o multipart con `foto`) | |
| Adopciones | GET | `/api/adopciones?tamano=&edad=&sexo=` | |
| Aliados | GET | `/api/aliados?tipo=` | |
| Estadísticas | GET | `/api/estadisticas` | |
| Login | POST | `/api/auth/login` | |
| | GET | `/api/auth/yo` | 🔒 |
| Moderación | GET | `/api/moderacion/pendientes` | 🔒 |
| | PATCH | `/api/moderacion/reportes/:id/aprobar` | 🔒 |
| | PATCH | `/api/moderacion/reportes/:id/eliminar` | 🔒 |
| | PATCH | `/api/reportes/:id/estado` (⚠️ la nota es pública) | 🔒 |

El detalle de cada uno está en [web/docs/API.md](../web/docs/API.md).

## 8. Estructura

```
api/
├── sql/                      # scripts de la base (ver sección 3)
├── src/
│   ├── index.ts              # arranca el servidor (nada más)
│   ├── app.ts                # middlewares y rutas
│   ├── routes/               # qué URL va a qué controlador
│   ├── controllers/          # la lógica de cada endpoint
│   ├── schemas/              # validaciones con zod (body, query, params)
│   ├── middlewares/          # errores, límites, login (JWT), subida de fotos
│   ├── lib/                  # config (.env), base de datos, auth, imágenes, Cloudinary
│   ├── scripts/              # crear-moderador
│   └── types/                # tipos extra de Express (req.moderador)
├── peticiones.http           # ejemplos para probar cada endpoint
└── .env.example              # plantilla de variables (sin secretos)
```

**Para agregar un endpoint:**
1. Escribe su esquema en `schemas/`.
2. Escribe la función en `controllers/`.
3. Agrega la ruta en `routes/`.
4. Agrega su ejemplo en `peticiones.http` y documéntalo en `web/docs/API.md`.

## 9. Seguridad y privacidad (cómo está hecho)

- **Sin ubicaciones exactas:** los reportes solo guardan `zona_id`. Las coordenadas que devuelve la API son las del centro de la zona. Cualquier campo extra (`lat`, `lng`…) se rechaza con `400`.
- **Datos privados:** las rutas públicas leen de las **vistas** (`v_*`) o de columnas explícitas. Nunca devuelven `contacto`, `ip_hash`, `foto_id` ni `password_hash`.
- **Fotos sin metadatos:** sharp valida que el archivo sea una imagen real, la reduce a 1600 px, la convierte a JPEG y **borra EXIF/GPS** antes de subirla.
  - Formatos: JPG, PNG y WebP, de máximo 5 MB.
  - **HEIC no se acepta**, porque sharp no trae ese decodificador. Safari en iPhone convierte a JPEG al subir.
  - Al eliminar un reporte, su foto se borra de Cloudinary.
- **SQL:** consultas siempre parametrizadas (`?`), nunca valores concatenados.
- **Validación:** zod en todo lo que entra (body, query, params) y en el `.env`.
- **Login:**
  - bcrypt de 12 rondas y JWT HS256 con vencimiento.
  - El mensaje de error es el mismo y tarda lo mismo exista o no el correo.
  - Si se desactiva un moderador, su sesión deja de servir de inmediato.
- **Límites:** 300 peticiones cada 15 minutos por IP en general, 5 reportes cada 10 minutos más un tope diario guardado en la base, y 5 intentos fallidos de login cada 15 minutos.
- **IP de quien reporta:** se guarda como hash SHA-256 con sal (`ip_hash`), nunca en claro.
- **Cabeceras y CORS:** helmet, y CORS restringido a `CORS_ORIGIN`.
- **Errores:** siempre en JSON y sin detalles internos. El detalle solo sale en la consola del servidor.

## 10. Producción

Lista para revisar antes de publicar:

- [ ] Ejecutar `geopatitas.sql` y `002-folio-vista.sql`. **No** cargar `datos-prueba.sql`.
- [ ] `NODE_ENV=production`.
- [ ] `CORS_ORIGIN` con el dominio real del frontend (por ejemplo, `https://geopatitas.vercel.app`).
- [ ] `TRUST_PROXY=1`, o el número de proxies del hosting, para que los límites vean la IP real.
- [ ] `JWT_SECRET` e `IP_HASH_SALT` **nuevos**, largos y distintos a los de desarrollo.
- [ ] Usuario de MySQL propio con contraseña. **No** usar `root` sin contraseña.
- [ ] Credenciales de Cloudinary, si se quieren fotos.
- [ ] Crear los moderadores con `pnpm crear-moderador` en el servidor.
- [ ] `pnpm build` y `pnpm start`, detrás de HTTPS.

## 11. Problemas comunes

| Problema | Solución |
|---|---|
| `❌ Configuración inválida en el archivo .env` | Lee qué variable indica; normalmente falta `JWT_SECRET` o `IP_HASH_SALT` |
| `⚠️ No se pudo conectar a MySQL (ECONNREFUSED)` / respuestas `503` | Enciende MySQL en XAMPP y revisa `DB_*` en el `.env` |
| `Table 'geopatitas.zonas' doesn't exist` | No ejecutaste `sql/geopatitas.sql` |
| `429` mientras pruebas | Llegaste a un límite. Reinicia `pnpm dev` (los límites en memoria se reinician). El tope diario de reportes se cuenta en la base |
| La foto no se guarda y la respuesta trae `aviso` | Faltan las credenciales de Cloudinary en el `.env` |
| `415` al subir una foto de iPhone | Es HEIC. Conviértela a JPG, o súbela desde Safari, que la convierte solo |
| El navegador bloquea las peticiones (CORS) | Agrega el dominio del frontend a `CORS_ORIGIN`. En local, el proxy de Vite lo evita |
