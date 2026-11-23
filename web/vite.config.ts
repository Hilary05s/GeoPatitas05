import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Adónde reenvía el proxy las peticiones a /api (solo en desarrollo y en `pnpm preview`).
const API_LOCAL = 'http://localhost:3000';

const proxy = {
  '/api': { target: API_LOCAL, changeOrigin: true },
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // El service worker se actualiza solo cuando hay una versión nueva
      // (ya no hace falta subir CACHE_VERSION a mano como en sw.js).
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'GeoPatitas · Santiago Ixcuintla',
        short_name: 'GeoPatitas',
        description:
          'Reporta perritos en situación de calle y ayuda a organizar su rescate en Santiago Ixcuintla, Nayarit.',
        lang: 'es-MX',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#FBF5EA',
        theme_color: '#3B2A1A',
        categories: ['social', 'lifestyle'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Reportar un perrito', url: '/reportar', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Explorar mapa', url: '/mapa', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        // Rutas de React Router sin conexión → index.html. Nunca para la API.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        // Tipografías de Google Fonts disponibles sin conexión.
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy },
});
