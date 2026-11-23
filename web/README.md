# GeoPatitas · Frontend (`web/`)

PWA en React + Vite + TypeScript + Tailwind para reportar perritos en situación de calle en Santiago Ixcuintla, Nayarit.

Este es el **proyecto base**: rutas, layout, tema, PWA, cliente de la API y tipos. Cada sección es un placeholder que programa su responsable.

```bash
pnpm install
cp .env.example .env
pnpm dev        # http://localhost:5173
```

## Documentación

| Documento | Contenido |
|---|---|
| [docs/COMO-EMPEZAR.md](docs/COMO-EMPEZAR.md) | Instalar y correr el frontend, la API y MySQL |
| [docs/STACK.md](docs/STACK.md) | Cada tecnología y por qué se eligió |
| [docs/API.md](docs/API.md) | Endpoints que existen ✅ y los que faltan ⏳ |
| [docs/MAPA.md](docs/MAPA.md) | Propuesta de uso de Leaflet + OpenStreetMap |
| [docs/REGLAS.md](docs/REGLAS.md) | Privacidad, diseño, ramas y Pull Requests, `.env` |

## Secciones

| Ruta | Carpeta | Responsable |
|---|---|---|
| `/` | [src/features/inicio](src/features/inicio/README.md) | [por asignar] |
| `/mapa` | [src/features/mapa](src/features/mapa/README.md) | [por asignar] |
| `/reportar` | [src/features/reportes](src/features/reportes/README.md) | [por asignar] |
| `/reporte/:id` | [src/features/ficha](src/features/ficha/README.md) | [por asignar] |
| `/adopciones` | [src/features/adopciones](src/features/adopciones/README.md) | [por asignar] |
| `/aliados` | [src/features/aliados](src/features/aliados/README.md) | [por asignar] |
| `/nosotros` | [src/features/nosotros](src/features/nosotros/README.md) | [por asignar] |
| `/moderacion` | [src/features/moderacion](src/features/moderacion/README.md) | [por asignar] |

El diseño de referencia es el sitio de la raíz del repositorio (`../index.html`, `../css/styles.css`), que no se modifica.
