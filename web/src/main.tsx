import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';

// CSS de Leaflet (necesario para que el mapa se vea bien cuando se programe).
import 'leaflet/dist/leaflet.css';
// Tailwind + tokens del tema de GeoPatitas.
import './index.css';

import { router } from './router';

const root = document.getElementById('root');
if (!root) throw new Error('No se encontró el elemento #root en index.html');

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
