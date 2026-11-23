# Sección: Adopciones

**Ruta:** `/adopciones` · **Archivo:** `AdopcionesPage.tsx` · **Responsable:** [por asignar]

## Qué hace (según el diseño actual)

- Encabezado "Adopciones": perritos disponibles, publicados por la persona u organización responsable.
- **Filtros:** búsqueda por nombre o descripción, tamaño, edad (Cachorro / Adulto / Mayor) y sexo.
- **Carteles "SE BUSCA HOGAR"** (estilo western): foto, nombre, edad · tamaño · sexo, descripción, "RECOMPENSA: UN HOGAR" y botón "Conocer más".
- Mensaje "No hay perritos con esos filtros" cuando no hay resultados.

## Tecnologías

React + TypeScript, Tailwind (`font-cartel` para "SE BUSCA HOGAR", `bg-cartel`, `border-kraft`) y `src/lib/api.ts`.

## Endpoints de la API

| | Método | Ruta | Para qué |
|---|---|---|---|
| ⏳ | GET | `/api/adopciones` | Adopciones públicas (vista `v_adopciones_publicas` → `AdopcionPublica[]`). Filtros propuestos: `?tamano=&edad=&sexo=&q=` |
| ⏳ | GET | `/api/adopciones/:id` | Detalle y contacto del responsable para "Conocer más" (por definir qué datos se muestran) |
| ⏳ | POST | `/api/adopciones` | Publicar un perrito en adopción (queda `pendiente` de moderación). Por definir quién puede publicar |

## Diseño de referencia

- [index.html](../../../../index.html), líneas **228-250** (`data-view="adopciones"`).
- [css/styles.css](../../../../css/styles.css): cartel **195-222**, filtros **391-392**, formularios **324-338**.
- [js/app.js](../../../../js/app.js): `renderDogs()`, líneas **238-262**.
- Datos de prueba: [js/data.js](../../../../js/data.js) (`DOGS`).

## Notas

- Valores de la base (`src/types/comunes.ts`): sexo `hembra | macho | desconocido`, edad `cachorro | adulto | mayor` y tamaño `pequeno | mediano | grande`. El diseño muestra la edad en texto ("2 años"), pero la base solo guarda la categoría.
- La vista ya excluye las adopciones adoptadas y las no aprobadas.
