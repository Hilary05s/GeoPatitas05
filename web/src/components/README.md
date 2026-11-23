# `src/components/` — componentes compartidos

Aquí van los componentes que **usa más de una sección**. Por ahora está vacía a propósito.

Ejemplos de lo que irá aquí (según el diseño actual):

| Componente | Clase en `css/styles.css` | Lo usan |
|---|---|---|
| Botón (primario, oscuro, contorno, peligro) | `.btn`, `.btn-primary`, `.btn-dark`, `.btn-outline`, `.btn-danger` | todas |
| Insignia de estado (Necesita ayuda / En seguimiento / Atendido) | `.badge.help/.follow/.done` | inicio, mapa, ficha, moderación |
| Cartel "SE BUSCA" | `.poster`, `.poster-*` | inicio, adopciones, ficha |
| Tarjeta | `.card` | varias |
| Campo de formulario | `.field`, `.radio-pill` | reportar, adopciones, mapa |
| Banner oscuro | `.banner` | aliados, nosotros |

## Reglas

- Si un componente solo lo usa una sección, déjalo **dentro de esa sección** (`src/features/<seccion>/`). Muévelo aquí cuando lo necesite una segunda.
- Usa los tokens de Tailwind (`bg-accion`, `text-tinta`, `font-titulo`, `bg-ayuda-fondo`…), definidos en `src/index.css`. No pongas colores en hexadecimal sueltos.
- `font-cartel` (Rye) es **solo** para los encabezados "SE BUSCA".
- Antes de crear un componente aquí, avisa al equipo en el Pull Request para no duplicar trabajo.
- Un archivo por componente, con nombre en PascalCase: `Boton.tsx`, `InsigniaEstado.tsx`.
