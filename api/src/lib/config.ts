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

  // Anti-spam: la IP de quien reporta se guarda como hash con esta sal secreta
  IP_HASH_SALT: z.string().min(16, 'Debe tener al menos 16 caracteres (ver .env.example)'),
  // Máximo de reportes por IP en 24 horas (se cuenta en la base de datos)
  MAX_REPORTES_POR_IP_DIA: z.coerce.number().int().min(1).default(10),

  // Fotos (opcional): sin las tres credenciales, los reportes se crean sin foto
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().min(1).default('geopatitas'),
}).superRefine((valores, ctx) => {
  // Cloudinary: o las tres credenciales o ninguna (evita configuraciones a medias)
  const claves = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'] as const;
  const llenas = claves.filter((clave) => valores[clave]);
  if (llenas.length > 0 && llenas.length < claves.length) {
    for (const clave of claves.filter((c) => !valores[c])) {
      ctx.addIssue({ code: 'custom', path: [clave], message: 'Falta: llena las tres variables de Cloudinary o deja las tres vacías' });
    }
  }
});

// Las variables vacías del .env (CLOUDINARY_API_KEY=) cuentan como no definidas
const entorno = Object.fromEntries(Object.entries(process.env).filter(([, valor]) => valor !== ''));
const resultado = esquema.safeParse(entorno);

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
