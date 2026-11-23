import { Link } from 'react-router';

/** Página 404 para rutas que no existen. */
export function NoEncontradaPage() {
  return (
    <section className="mx-auto flex max-w-sitio flex-col gap-3 px-6 py-12 max-sm:px-4">
      <h1 className="font-titulo text-[clamp(30px,4vw,40px)] leading-tight text-tinta">Página no encontrada</h1>
      <p className="text-gris-2">Esta dirección no existe.</p>
      <Link to="/" className="font-bold">← Volver al inicio</Link>
    </section>
  );
}
