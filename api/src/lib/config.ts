import 'dotenv/config'; // carga las variables del .env
import { z } from 'zod';

// Mensajes de validación de zod en español (para toda la API)
z.config(z.locales.es());

/**
 * Variables de entorno validadas al arrancar.
 * Si falta algo obligatorio o tiene un formato incorrecto, el servidor no arranca
 * y muestra qué variable revisar (ver .env.example).
 */
const esquema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  // Base de datos
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_USER: z.string().min(1).default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1).default('geopatitas'),

  // CORS: uno o varios orígenes separados por coma
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .transform((valor) =>
      valor
        .split(',')
        .map((origen) => origen.trim())
        .filter(Boolean),
    ),

  // Número de proxies delante de la API (0 en local). Necesario para que el
  // límite de peticiones vea la IP real cuando se publique detrás de un proxy.
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
});

const resultado = esquema.safeParse(process.env);

if (!resultado.success) {
  console.error('❌ Configuración inválida en el archivo .env:');
  for (const problema of resultado.error.issues) {
    console.error(`   - ${problema.path.join('.')}: ${problema.message}`);
  }
  console.error('   Revisa api/.env.example.');
  process.exit(1);
}

export const config = resultado.data;
export const esProduccion = config.NODE_ENV === 'production';
