# Sección: Veterinarias y negocios aliados

**Ruta:** `/aliados` · **Archivo:** `AliadosPage.tsx` · **Responsable:** [por asignar]

## Qué hace (según el diseño actual)

- Encabezado: aliados que apoyan a los perritos de Santiago Ixcuintla.
- **Tarjetas de aliado:** logo, nombre, dirección, insignia tipo sheriff ("Veterinaria aliada" / "Negocio aliado"), cupón de **PROMOCIÓN** y botones "Ver promociones" y "Contactar".
- **Tarjeta punteada "Espacio disponible":** tu veterinaria o negocio puede aparecer aquí.
- **Banner oscuro** "¿Tienes una veterinaria o negocio?" con el botón "Quiero ser aliado".

## Tecnologías

React + TypeScript, Tailwind y `src/lib/api.ts`.

## Endpoints de la API

| | Método | Ruta | Para qué |
|---|---|---|---|
| ⏳ | GET | `/api/aliados` | Aliados activos con patrocinio vigente → `Aliado[]` |
| ⏳ | POST | `/api/avisos` | "Quiero ser aliado" (`tipo: 'aliado'`, `contacto`, `mensaje`) |

## Diseño de referencia

- [index.html](../../../../index.html), líneas **252-273** (`data-view="aliados"`).
- [css/styles.css](../../../../css/styles.css): Aliados **394-423** (`.vet-card`, `.sheriff-badge`, `.coupon`, `.slot-card`, `.banner`).
- [js/app.js](../../../../js/app.js): `renderVets()`, líneas **267-281**. El SVG de la insignia está en `ICONS.sheriff`, al inicio del archivo.
- Datos de prueba: [js/data.js](../../../../js/data.js) (`VETS`).

## Notas

- `aliados.tipo` es `veterinaria | negocio`, y de ahí sale el texto de la insignia.
- El banner "Quiero ser aliado" también aparece en Nosotros: hazlo componente compartido en `src/components/`.
