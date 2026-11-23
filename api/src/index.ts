import { crearApp } from './app.js';
import { pool, verificarConexion } from './lib/bd.js';
import { config } from './lib/config.js';

// Punto de arranque: crea la app, enciende el servidor y revisa la base.
const app = crearApp();

const servidor = app.listen(config.PORT, () => {
  console.log(`🐾 GeoPatitas API en http://localhost:${config.PORT}/api (${config.NODE_ENV})`);
  console.log(`   CORS permitido para: ${config.CORS_ORIGIN.join(', ')}`);
  void verificarConexion();
});

// Apagado ordenado (Ctrl + C o el hosting deteniendo el proceso)
function apagar(senal: string) {
  console.log(`\n${senal} recibido. Cerrando la API…`);
  servidor.close(() => {
    void pool.end().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGINT', () => apagar('SIGINT'));
process.on('SIGTERM', () => apagar('SIGTERM'));
