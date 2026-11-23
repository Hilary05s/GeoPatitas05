# API de GeoPatitas

> **Base local:** `http://localhost:3000/api` · Código en `api/src/` · Cómo instalarla: [api/README.md](../../api/README.md)
> **Desde el frontend:** `VITE_API_URL=/api` y `src/lib/api.ts` (`api.get`, `api.post`, `api.patch`…). En desarrollo, el proxy de Vite reenvía `/api` a `localhost:3000`.
> **Tipos:** `src/types/` (tablas, vistas y ENUM de la base).
> **Probar a mano:** `api/peticiones.http` (extensión REST Client de VS Code).

✅ = ya existe · ⏳ = falta programarlo (propuesta) · 🔒 = requiere login de moderador

---

## Reglas generales

### Formato de las respuestas
- **Éxito:** el dato directo, un arreglo o un objeto.
- **Error:** status HTTP + `{ "mensaje": "Texto para mostrar" }`. `src/lib/api.ts` ya lo convierte en `ApiError`.
- **Datos inválidos:** `400` + `{ "mensaje": "Datos inválidos", "campos": { "color": "Es obligatorio" } }`. Sirve para marcar en rojo cada campo del formulario.
- **Listas paginadas:** reciben `?limite=` (1 a 100, por defecto 50) y `?pagina=` (desde 1), y devuelven el total en la cabecera **`X-Total-Count`**.

### Códigos de estado
| Código | Cuándo |
|---|---|
| `200` / `201` | Correcto / creado |
| `400` | Datos inválidos, JSON mal formado o un campo que no se permite |
| `401` | Falta iniciar sesión, la sesión expiró o el token no sirve (también si la cuenta se desactivó) |
| `404` | No existe, o no es público (por ejemplo, un reporte pendiente o eliminado) |
| `409` | La acción no aplica al estado actual (aprobar algo ya aprobado, etc.) |
| `413` / `415` | La foto pesa más de 5 MB / no es JPG, PNG ni WebP |
| `429` | Demasiadas peticiones (límites abajo) |
| `502` | No se pudo guardar la foto en Cloudinary |
| `503` | La base de datos no está disponible |
| `500` | Error inesperado (sin detalles internos) |

### Tipos de datos (cómo llegan de MySQL)
- `TINYINT(1)` llega como `0 | 1`, **no** `true/false` (`es_cachorro`, `activo`).
- `DECIMAL` llega como `number` (`lat_centro`, `lng_centro`).
- `DATE` llega como `"2026-11-21"`, sin corrimiento por zona horaria (`fecha_avistamiento`, `patrocinio_*`).
- `DATETIME` llega como fecha ISO en UTC: `"2026-11-23T04:31:55.000Z"` (`creado_en`).
- `folio`: el id con ceros a la izquierda, mínimo 4 dígitos (`7 → "0007"`, `12345 → "12345"`).

### 🔒 Privacidad
- Las rutas públicas **solo** devuelven reportes y adopciones **aprobados** y **nunca** incluyen `contacto`, `ip_hash`, `foto_id`, `contacto_responsable` ni `password_hash`.
- Las coordenadas son siempre las del **centro de la zona**. La API **rechaza** con `400` cualquier campo extra, como `lat` o `lng`.

### Límites de peticiones (por IP)
| Qué | Límite |
|---|---|
| Toda la API | 300 cada 15 minutos |
| `POST /api/reportes` | 5 cada 10 minutos, y además `MAX_REPORTES_POR_IP_DIA` (10) en 24 horas |
| `POST /api/auth/login` | 5 intentos **fallidos** cada 15 minutos |

---

## Públicas

### ✅ `GET /api`
Estado de la API → `{ "mensaje": "GeoPatitas API funcionando" }`

### ✅ `GET /api/zonas`
Zonas activas → `Zona[]`, ordenadas por id.
```json
[{ "id": 1, "nombre": "Centro", "lat_centro": 21.811, "lng_centro": -105.209, "activa": 1 }]
```

### ✅ `GET /api/reportes`
Reportes **aprobados**, del más nuevo al más viejo → `ReportePublico[]` (vista `v_reportes_publicos`) · paginado.

| Query | Valores |
|---|---|
| `estado` | `necesita_ayuda` \| `en_seguimiento` \| `atendido` |
| `zona` | id de la zona |
| `limite`, `pagina` | paginación |

Ejemplo: `GET /api/reportes?estado=necesita_ayuda&zona=2&limite=3`

### ✅ `GET /api/reportes/:id`
Un reporte aprobado → `ReportePublico`. `404` si no existe, está pendiente o fue eliminado.

### ✅ `GET /api/reportes/:id/seguimiento`
Línea de tiempo del caso (para la ficha), del más antiguo al más nuevo → `Omit<Seguimiento, 'moderador_id'>[]`. `404` si el reporte no es público.
```json
[{ "id": 12, "reporte_id": 142, "estado_anterior": "necesita_ayuda", "estado_nuevo": "en_seguimiento",
   "nota": "Una rescatista lo está alimentando.", "creado_en": "2026-11-20T18:00:00.000Z" }]
```
> No se publica qué moderador hizo el cambio. La `nota` **sí** es pública (ver `PATCH /api/reportes/:id/estado`).

### ✅ `POST /api/reportes`
Crea un reporte **pendiente de moderación**. No requiere cuenta.

**Recibe** JSON, o `multipart/form-data` si lleva foto:

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `zona_id` | número | ✔ | Debe existir y estar activa |
| `color` | texto ≤ 60 | ✔ | |
| `tamano` | `pequeno` \| `mediano` \| `grande` | ✔ | |
| `salud` | `sano` \| `herido` \| `enfermo` \| `desnutrido` \| `en_peligro` | ✔ | |
| `fecha_avistamiento` | `"AAAA-MM-DD"` | ✔ | No futura ni de hace más de un año |
| `es_cachorro` | booleano (`true`/`false`, `1`/`0`, `"on"`) | | Por defecto `false` |
| `nombre`, `raza_aprox` | texto ≤ 60 | | `""` se toma como vacío |
| `descripcion` | texto ≤ 2000 | | |
| `contacto` | texto ≤ 150 | | **Privado**: solo lo ve el equipo de moderación |
| `foto` | archivo (solo multipart) | | **JPG, PNG o WebP**, máx. **5 MB**, una sola. **HEIC no se acepta** (Safari en iPhone lo convierte a JPEG al subir) |

- Cualquier otro campo (`lat`, `lng`, `estado_moderacion`…) → `400` con `campos: { "lat": "Campo no permitido" }`.
- **Foto:** la API la endereza, la reduce a 1600 px, la convierte a JPEG y **elimina todos los metadatos (EXIF/GPS)** antes de subirla a Cloudinary. No hace falta un endpoint aparte para fotos.

**Devuelve** `201`:
```json
{ "id": 143, "folio": "0143", "estado_moderacion": "pendiente", "foto_guardada": true,
  "mensaje": "Gracias. Tu reporte se revisará antes de publicarse." }
```
Si Cloudinary no está configurado, se crea **sin foto**: `"foto_guardada": false` y un campo `"aviso"` que conviene mostrar a la persona.

**Ejemplo con foto desde el frontend:**
```ts
const datos = new FormData(formulario);           // incluye el <input type="file" name="foto">
await api.post('/reportes', datos);               // src/lib/api.ts manda FormData tal cual
```

### ✅ `GET /api/adopciones`
Perritos en adopción aprobados y todavía no adoptados → `AdopcionPublica[]` (vista `v_adopciones_publicas`) · paginado.
Query opcional: `tamano`, `edad` (`cachorro` \| `adulto` \| `mayor`), `sexo` (`hembra` \| `macho` \| `desconocido`), `limite`, `pagina`.

### ✅ `GET /api/aliados`
Aliados activos con patrocinio vigente hoy (sin fechas cuenta como vigente) → `Aliado[]`. Primero las veterinarias, luego los negocios, por nombre.
Query opcional: `tipo` (`veterinaria` \| `negocio`).

### ✅ `GET /api/estadisticas`
Cifras de la portada → `Estadisticas`. Nunca vienen en `null`: sin datos, valen `0`.
```json
{ "perritos_reportados": 6, "casos_atendidos": 1, "reportes_semana": 5 }
```

---

## Login de moderadores

Los moderadores se crean desde la terminal con `pnpm crear-moderador` (ver [api/README.md](../../api/README.md)). No hay registro público.

### ✅ `POST /api/auth/login`
**Recibe** `{ "correo": "...", "password": "..." }`. El correo no distingue mayúsculas.
**Devuelve** `200`:
```json
{
  "token": "eyJhbGciOi...",
  "expira_en": "2026-11-23T12:32:32.000Z",
  "moderador": { "id": 3, "nombre": "…", "correo": "…", "rol": "admin", "activo": 1, "creado_en": "…" }
}
```
- Si falla: `401` con `"Correo o contraseña incorrectos"`, **el mismo mensaje** si el correo no existe, si la contraseña está mal o si la cuenta está desactivada.
- La sesión dura `JWT_EXPIRES_IN` (8 h por defecto).
- **En el frontend:** guarda el `token` en memoria o en `sessionStorage` (nunca en `localStorage` ni en el código) y mándalo en cada petición protegida:
  ```ts
  await api.get('/moderacion/pendientes', { token });   // → Authorization: Bearer <token>
  ```

### ✅ 🔒 `GET /api/auth/yo`
Datos del moderador dueño del token → `Moderador` (sin `password_hash`). Úsalo al abrir el panel para saber si la sesión sigue viva: con `401`, manda a la persona al login.

---

## Moderación 🔒

Todas requieren `Authorization: Bearer <token>`. Sin token, con un token vencido o con una cuenta desactivada → `401`.

### ✅ 🔒 `GET /api/moderacion/pendientes`
Cola de reportes **pendientes**, del más antiguo al más nuevo · paginado (`limite`, `pagina`).

**Devuelve** un arreglo de:
```ts
{
  id, folio, zona_id, zona,          // zona = nombre ("Centro")
  nombre, raza_aprox, color, tamano, es_cachorro, salud, descripcion,
  fecha_avistamiento, foto_url,
  contacto,                          // PRIVADO: solo para el equipo
  estado_caso, duplicado_de, creado_en,
  envios_misma_ip_24h                // reportes enviados desde la misma IP en 24 h (pista de spam)
}
```
Nunca incluye `ip_hash` ni `foto_id`.

### ✅ 🔒 `PATCH /api/moderacion/reportes/:id/aprobar`
Publica un reporte **pendiente**.
- **Recibe** (opcional): `{ "nota": "..." }`, de máximo 255 caracteres. Es **interna**: no se publica.
- **Devuelve:** `{ "id": 143, "estado_moderacion": "aprobado" }`
- **Errores:** `404` no existe · `409` ya estaba aprobado o fue eliminado.
- Queda registrado en `moderaciones` con el moderador que lo hizo.

### ✅ 🔒 `PATCH /api/moderacion/reportes/:id/eliminar`
Elimina un reporte, esté **pendiente o ya publicado**. Es un borrado lógico: la fila queda con `estado_moderacion = 'eliminado'` y desaparece de todo lo público.

**Recibe:**
| Campo | Obligatorio | Valores |
|---|---|---|
| `motivo` | ✔ | `falso` \| `duplicado` \| `ofensivo` \| `fuera_de_tema` \| `otro` |
| `nota` | | texto ≤ 255, **interna** |
| `duplicado_de` | | id del reporte original. **Solo** con `motivo: "duplicado"`; debe existir, no estar eliminado y no ser el mismo reporte |

**Devuelve:**
```json
{ "id": 143, "estado_moderacion": "eliminado", "motivo": "duplicado", "foto_borrada": true }
```
- `foto_borrada`: `true` = se borró de Cloudinary · `null` = el reporte no tenía foto · `false` = Cloudinary falló. En ese caso viene un `aviso`; la foto ya no se muestra y quedó registrada para reintentar el borrado.
- **Errores:** `404` no existe · `409` ya estaba eliminado.
- Queda registrado en `moderaciones` con el motivo.

### ✅ 🔒 `PATCH /api/reportes/:id/estado`
Cambia el **estado del caso** de un reporte **publicado** (aprobado).

**Recibe:**
| Campo | Obligatorio | Valores |
|---|---|---|
| `estado_nuevo` | ✔ | `necesita_ayuda` \| `en_seguimiento` \| `atendido` |
| `nota` | | texto ≤ 255 |

> ## ⚠️ La `nota` del cambio de estado es PÚBLICA
> Se guarda en la tabla `seguimiento` y **cualquier persona la ve** en la línea de tiempo de la ficha (`GET /api/reportes/:id/seguimiento`).
> **Nunca** escribas ahí datos personales: nombres de rescatistas, teléfonos, domicilios ni la ubicación exacta del perrito.
> Ejemplo correcto: *"Una rescatista lo está alimentando."* · Incorrecto: *"Lo tiene María en Calle Hidalgo 23, tel. 311…"*.
> En el panel conviene mostrar este aviso junto al campo de la nota.
>
> (Las notas de **aprobar** y **eliminar** son internas y no se publican.)

**Devuelve:**
```json
{ "id": 142, "estado_anterior": "necesita_ayuda", "estado_nuevo": "en_seguimiento", "seguimiento_id": 13 }
```
- **Errores:** `404` no existe · `409` el reporte no está aprobado, o ya estaba en ese estado.
- Queda registrado en `seguimiento` con el moderador y el estado anterior. La tabla `moderaciones` solo admite aprobar y eliminar.

---

## ⏳ Endpoints que faltan (propuesta)

| | Método | Ruta | Para qué | Sección |
|---|---|---|---|---|
| ⏳ | POST | `/api/avisos` | "Quiero ayudar", "Ya fue atendido" y "Quiero ser aliado" (tabla `avisos`: `tipo`, `contacto`, `mensaje?`, `reporte_id?`) | ficha, aliados |
| ⏳ | GET | `/api/zonas/resumen` | Conteo por zona (vista `v_reportes_por_zona`) | mapa |
| ⏳ | GET | `/api/adopciones/:id` | Detalle y contacto del responsable para "Conocer más" | adopciones |
| ⏳ | POST | `/api/adopciones` | Publicar un perrito en adopción (pendiente de moderación). Por decidir quién puede publicar | adopciones |
| ⏳ 🔒 | GET | `/api/moderacion/resumen` | Contadores del panel: pendientes, aprobados, eliminados | moderación |
| ⏳ 🔒 | GET / PATCH | `/api/moderacion/adopciones…` | Moderar adopciones (aprobar, eliminar, cambiar estado) | moderación |
| ⏳ 🔒 | GET / PATCH | `/api/moderacion/avisos…` | Ver avisos y marcarlos como revisados | moderación |
| ⏳ 🔒 | POST / PATCH | `/api/moderacion/aliados…` | Dar de alta y editar aliados | moderación |

> Ya **no** hace falta `POST /api/fotos`: la foto se envía junto con el reporte en `POST /api/reportes`.

## Antes de publicar en producción

Ver la lista completa en [api/README.md](../../api/README.md#10-producción). Lo principal:
- `CORS_ORIGIN` con el dominio real del frontend.
- `NODE_ENV=production`.
- `TRUST_PROXY` según el hosting.
- Secretos nuevos y largos para `JWT_SECRET` e `IP_HASH_SALT`.
- **Nunca** cargar `datos-prueba.sql`.
