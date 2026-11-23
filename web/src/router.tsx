import { createBrowserRouter } from 'react-router';

import { Layout } from '@/layout/Layout';
import { NoEncontradaPage } from '@/layout/NoEncontradaPage';

import { InicioPage } from '@/features/inicio/InicioPage';
import { MapaPage } from '@/features/mapa/MapaPage';
import { ReportarPage } from '@/features/reportes/ReportarPage';
import { FichaPage } from '@/features/ficha/FichaPage';
import { AdopcionesPage } from '@/features/adopciones/AdopcionesPage';
import { AliadosPage } from '@/features/aliados/AliadosPage';
import { NosotrosPage } from '@/features/nosotros/NosotrosPage';
import { ModeracionPage } from '@/features/moderacion/ModeracionPage';

/**
 * Rutas de la app. Todas se muestran dentro del <Layout> (encabezado + pie).
 * Para agregar una ruta nueva: crea la página en src/features/<seccion>/ y agrégala aquí.
 */
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <InicioPage /> },
      { path: 'mapa', element: <MapaPage /> },
      { path: 'reportar', element: <ReportarPage /> },
      { path: 'reporte/:id', element: <FichaPage /> },
      { path: 'adopciones', element: <AdopcionesPage /> },
      { path: 'aliados', element: <AliadosPage /> },
      { path: 'nosotros', element: <NosotrosPage /> },
      { path: 'moderacion', element: <ModeracionPage /> },
      { path: '*', element: <NoEncontradaPage /> },
    ],
  },
]);
