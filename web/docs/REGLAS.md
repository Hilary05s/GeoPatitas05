# Reglas del equipo

Estas reglas **no se negocian por sección**. Si algo no encaja, se discute con el equipo antes de cambiarlo.

## 1. 🔒 Privacidad

GeoPatitas habla de perritos, pero las fotos y las ubicaciones también revelan dónde vive la gente.

- **Nunca coordenadas exactas.** Un reporte solo guarda `zona_id`. En el mapa se muestra el **centro de la zona** con un círculo punteado, nunca un punto exacto (ver [MAPA.md](MAPA.md)).
- **Nunca pedir domicilios.** Ni en el formulario ni en la descripción. El texto de ayuda lo dice: "Nunca pidas ni compartas domicilios exactos".
- **Quitar los datos GPS/EXIF de las fotos.** Las fotos del celular guardan la ubicación donde se tomaron. Antes de guardarlas:
  - **En el frontend:** volver a dibujar la imagen en un `<canvas>` y exportarla (`canvas.toBlob`). Eso elimina el EXIF y además reduce el tamaño (propuesta: máximo 1600 px y JPEG al 80 %).
  - **En la API:** volver a limpiar por si acaso, porque nunca hay que confiar solo en el navegador. Revisar también la configuración de Cloudinary para que no conserve los metadatos.
- **El contacto de quien reporta es privado.** `reportes.contacto` solo lo ve el panel de moderación. Las páginas públicas usan las **vistas** (`ReportePublico`, `AdopcionPublica`), que no lo traen.
- **No publicar nada sin moderar.** Todo reporte o adopción nuevo queda como `pendiente`.
- **No hay datos personales en el código.** Nada de teléfonos, correos ni fotos de personas reales en los datos de prueba (salvo el equipo, con su permiso).

## 2. 🎨 El diseño se respeta

- El diseño de referencia es el sitio actual de la raíz: `index.html`, `css/styles.css` y `js/`. **No se modifica ni se borra.** Es la guía visual.
- Usa **solo los tokens** de `src/index.css`: `bg-crema`, `text-tinta`, `bg-accion`, `font-titulo`, `bg-ayuda-fondo`… **Nada de colores en hexadecimal sueltos** en los componentes.
- Tipografías: **Alfa Slab One** (`font-titulo`) para títulos, **Rye** (`font-cartel`) **solo** para los encabezados "SE BUSCA" e **Inter** (`font-sans`) para todo lo demás.
- Cada README de sección dice qué líneas del diseño replicar.
- **Accesibilidad:** botones y enlaces de mínimo 44 px de alto, `aria-label` en los íconos, contraste como el del diseño y que todo funcione con teclado.
- **Celular primero:** casi toda la gente lo va a usar desde el teléfono. Prueba siempre a 360 px de ancho.
- ¿Quieres cambiar algo del diseño? Propónlo en el Pull Request con una captura y que lo apruebe quien diseña.

## 3. 🌿 Ramas y Pull Requests

- **Nadie sube directo a `main`.** Conviene activar la protección de la rama en GitHub (Settings → Branches) para exigir Pull Request y revisión.
- **Una rama por tarea**, creada desde `main` actualizada:
  - `feat/mapa-marcadores`, `feat/reportar-formulario`, `fix/ficha-fecha`, `docs/api-reportes`.
  - Formato: `tipo/seccion-descripcion`, en minúsculas y con guiones.
- **Commits** con [Conventional Commits](https://www.conventionalcommits.org/es/) en español:
  - `feat(mapa): agregar círculos de zona`
  - `fix(reportes): validar fecha del avistamiento`
  - `docs(api): documentar POST /reportes`
  - Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`.
- **Pull Request:**
  1. Antes de abrirlo: `pnpm build` sin errores.
  2. Descripción: qué hace, captura de pantalla (escritorio y celular) y qué falta.
  3. Al menos **una persona del equipo** lo revisa y lo aprueba.
  4. Se hace merge cuando está aprobado. Después se borra la rama.
- **Trabaja solo en tu carpeta** (`src/features/<tu-seccion>/`). Si necesitas tocar algo compartido (`src/components/`, `src/layout/`, `src/lib/`, `src/types/`, `src/index.css`, `vite.config.ts`), avísalo en el PR.
- **`api/` la programa el responsable de la API.** Si necesitas un endpoint, pídelo o abre un issue. Su lista está en [API.md](API.md).

## 4. 🔑 Nadie sube el `.env`

- Los archivos `.env` tienen contraseñas y claves: **nunca se suben a git**. Ya están en `.gitignore` (en la raíz y en `web/.gitignore`).
- Para compartir qué variables existen se usa **`.env.example`**, sin valores secretos.
- Las claves de producción (Cloudinary, JWT, MySQL) se configuran en el panel del hosting, no en el código.
- En el frontend, **toda variable `VITE_*` es pública**: termina dentro del JavaScript que descarga cualquiera. Nunca pongas una clave secreta con `VITE_`.
- Si alguien sube un secreto por error: avisa de inmediato y **cambia la clave**. Borrar el commit no basta.
