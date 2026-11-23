import { Link } from 'react-router';

/** Pie de página. Réplica de .site-footer (index.html 327-341, styles.css 450-458). */
export function Pie() {
  const enlace =
    'inline-flex min-h-11 items-center text-sm font-semibold text-white no-underline hover:text-white hover:underline';

  return (
    <footer className="border-t-[3px] border-double border-kraft bg-tinta-oscura text-white">
      <div className="mx-auto flex max-w-sitio flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-8 max-sm:px-4">
        <div className="flex flex-col gap-1.5 text-sm text-pie-texto">
          <span className="font-titulo text-[22px] text-white">GeoPatitas</span>
          <span>Santiago Ixcuintla, Nayarit · [correo de contacto] · [teléfono]</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {/* TODO: poner las URL reales de las redes sociales. */}
          <a href="#" aria-label="Facebook de GeoPatitas" className={enlace}>Facebook</a>
          <a href="#" aria-label="Instagram de GeoPatitas" className={enlace}>Instagram</a>
          <a href="#" aria-label="WhatsApp de GeoPatitas" className={enlace}>WhatsApp</a>
          <Link to="/moderacion" className={`${enlace} rounded-[10px] border border-pie-borde px-3.5`}>
            Panel de moderación (equipo)
          </Link>
        </div>
      </div>
    </footer>
  );
}
