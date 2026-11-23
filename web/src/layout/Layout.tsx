import { Outlet, ScrollRestoration } from 'react-router';

import { Encabezado } from './Encabezado';
import { Pie } from './Pie';

/**
 * Marco compartido de todas las páginas: encabezado, contenido y pie.
 * Réplica de index.html (líneas 25-46 y 327-341) y css/styles.css.
 */
export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="absolute -top-16 left-3 z-[1200] rounded-lg bg-tinta px-3.5 py-2.5 text-white focus:top-3"
      >
        Saltar al contenido
      </a>

      <Encabezado />

      <main id="main" tabIndex={-1} className="w-full flex-1 outline-none">
        <Outlet />
      </main>

      <Pie />

      {/* Al cambiar de página, regresa al inicio del scroll. */}
      <ScrollRestoration />
    </div>
  );
}
