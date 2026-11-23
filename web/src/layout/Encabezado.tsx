import { Link, NavLink } from 'react-router';

import { IconoHuella } from './IconoHuella';

/** Enlaces del menú principal, en el mismo orden que el diseño actual. */
const ENLACES = [
  { to: '/', texto: 'Inicio', end: true },
  { to: '/mapa', texto: 'Explorar mapa' },
  { to: '/reportar', texto: 'Reportar' },
  { to: '/adopciones', texto: 'Adopciones' },
  { to: '/aliados', texto: 'Veterinarias aliadas' },
  { to: '/nosotros', texto: 'Nosotros' },
];

/**
 * Encabezado fijo. Réplica de .site-header (index.html 27-44, styles.css 128-146).
 * z-[1100]: queda por encima de los controles de Leaflet (que usan z-index 1000).
 */
export function Encabezado() {
  return (
    <header className="sticky top-0 z-[1100] border-b border-borde-suave bg-white">
      <div className="mx-auto flex max-w-sitio flex-wrap items-center gap-x-6 gap-y-2 px-6 py-2.5 max-sm:px-4">
        <Link to="/" aria-label="GeoPatitas, ir a inicio" className="flex items-center gap-2.5 p-1 no-underline">
          <span className="flex size-10 items-center justify-center rounded-[10px] bg-marca text-white">
            <IconoHuella />
          </span>
          <span className="font-titulo text-2xl text-marca">GeoPatitas</span>
        </Link>

        <nav aria-label="Principal" className="flex flex-auto flex-wrap justify-center gap-0.5">
          {ENLACES.map((enlace) => (
            <NavLink
              key={enlace.to}
              to={enlace.to}
              end={enlace.end ?? false}
              className="inline-flex min-h-11 items-center border-b-[3px] border-transparent px-2.5 pt-2.5 pb-[7px] font-medium text-nav no-underline hover:text-tinta aria-[current=page]:border-nav-activo aria-[current=page]:font-bold aria-[current=page]:text-tinta"
            >
              {enlace.texto}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/reportar"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-boton border-2 border-transparent bg-accion px-5 py-2.5 text-[15px] font-bold text-accion-texto no-underline transition hover:bg-accion-hover hover:text-accion-texto active:translate-y-px max-sm:hidden"
        >
          Reportar un perrito
        </Link>
      </div>
    </header>
  );
}
