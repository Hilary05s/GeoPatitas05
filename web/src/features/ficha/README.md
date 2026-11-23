# Sección: Ficha del reporte

**Ruta:** `/reporte/:id` (ej. `/reporte/142`) · **Archivo:** `FichaPage.tsx` · **Responsable:** [por asignar]

## Qué hace (según el diseño actual)

Detalle de un reporte, con estilo de cartel:

- Enlace "← Volver al mapa".
- **Foto principal** con la insignia de estado.
- "SE BUSCA AYUDA" (tipografía Rye), número de reporte (folio) y título.
- Caja de **estado de salud aparente**.
- **Datos:** tamaño, color, zona aproximada, último reporte y características particulares.
- **Seguimiento del caso:** línea de tiempo Reportado → En seguimiento → Atendido → Adoptado.
- **Botones:** "Quiero ayudar", "Compartir reporte" (`navigator.share` o copiar el enlace) e "Informar que ya fue atendido".

## Tecnologías

React + TypeScript, Tailwind, React Router (`useParams` para leer el `:id`, que ya usa el placeholder), `src/lib/api.ts` y la Web Share API del navegador.

## Endpoints de la API

| | Método | Ruta | Para qué |
|---|---|---|---|
| ✅ | GET | `/api/reportes/:id` | Un reporte aprobado → `ReportePublico` (404 si no existe o no está aprobado) |
| ✅ | GET | `/api/reportes/:id/seguimiento` | Historial del caso, del más antiguo al más nuevo → `SeguimientoPublico[]` (sin `moderador_id`). Su `nota` la escribe el equipo y es pública |
| ⏳ | POST | `/api/avisos` | "Quiero ayudar" (`tipo: 'ayuda'`) e "Informar que ya fue atendido" (`tipo: 'atendido'`) |

## Diseño de referencia

- [index.html](../../../../index.html), líneas **223-226**: el contenedor está vacío porque la ficha se arma desde JS.
- [js/app.js](../../../../js/app.js): `renderFicha()`, líneas **154-183** (todo el HTML de la ficha está aquí), y el botón Compartir en las líneas **328-332**.
- [css/styles.css](../../../../css/styles.css): Ficha **366-389**, insignias **155-158**, cartel **195-222**.

## Notas

- La ruta del diseño viejo era `#/ficha/0142`; la nueva es `/reporte/:id`, con el id numérico. El folio (`"0142"`) viene en `ReportePublico.folio`.
- El paso "Adoptado" de la línea de tiempo no está en `estado_caso`: se sabe si existe una adopción con `reporte_id` igual a este reporte y en estado `adoptado`. Hay que definir con la API cómo se informa.
- 🔒 No mostrar `contacto` ni datos del moderador.
