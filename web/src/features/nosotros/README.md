# Sección: Nosotros

**Ruta:** `/nosotros` · **Archivo:** `NosotrosPage.tsx` · **Responsable:** [por asignar]

## Qué hace (según el diseño actual)

- **Hero:** "Tecnología al servicio de las patitas", con texto y foto de rescate.
- Tres tarjetas: **Misión**, **Visión** y **Objetivo** (textos por definir).
- **Nuestro equipo:** tarjetas con foto, nombre y rol de cada integrante.
- **Banner** "Organizaciones, veterinarias y aliados" con el botón "Quiero ser aliado" (lleva a `/aliados`).

## Tecnologías

React + TypeScript, Tailwind y React Router (`<Link>`). Es contenido **estático**: no necesita API.

## Endpoints de la API

| | Método | Ruta | Para qué |
|---|---|---|---|
| — | — | — | No usa la API. Los textos y el equipo van en el código (por ejemplo, en un `equipo.ts` dentro de esta carpeta). |

## Diseño de referencia

- [index.html](../../../../index.html), líneas **275-302** (`data-view="nosotros"`).
- [css/styles.css](../../../../css/styles.css): hero **172-176**, Nosotros **425-432** (`.team-card`), banner **418-423**.
- [js/app.js](../../../../js/app.js): `renderTeam()`, líneas **283-287**.
- Equipo: [js/data.js](../../../../js/data.js) (`TEAM`).

## Notas

- Pide al equipo los textos de misión, visión y objetivo, y las fotos (con permiso de cada persona).
