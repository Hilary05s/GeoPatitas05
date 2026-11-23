/**
 * Crea un moderador desde la terminal:   pnpm crear-moderador
 *
 * Pide nombre, correo, contraseña (oculta, dos veces) y rol. La contraseña se guarda
 * como hash bcrypt: nunca se escribe en el código ni se muestra en pantalla.
 * Si no hay ningún moderador activo, el rol sugerido es "admin".
 *
 * También acepta las respuestas por tubería (una por línea, en el mismo orden),
 * útil para automatizar:  Get-Content respuestas.txt | pnpm crear-moderador
 */
import { createInterface } from 'node:readline';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { z } from 'zod';

import { BYTES_MAXIMOS_PASSWORD, hashearPassword } from '../lib/auth.js';
import { pool } from '../lib/bd.js';

// ---------- Lectura de respuestas ----------

const esTerminal = Boolean(process.stdin.isTTY);
let lineasPorTuberia: string[] | null = null;

async function leerTuberia() {
  const rl = createInterface({ input: process.stdin, terminal: false });
  const lineas: string[] = [];
  for await (const linea of rl) lineas.push(linea);
  return lineas;
}

/** Lee una línea de la terminal. Si `oculta`, muestra * en lugar de las letras. */
function leerLineaTerminal(oculta: boolean): Promise<string> {
  return new Promise((resolve) => {
    const entrada = process.stdin;
    entrada.setRawMode(true);
    entrada.resume();
    entrada.setEncoding('utf8');
    let valor = '';

    const alTeclear = (teclas: string) => {
      for (const tecla of teclas) {
        if (tecla === '\r' || tecla === '\n') {
          entrada.off('data', alTeclear);
          entrada.setRawMode(false);
          entrada.pause();
          process.stdout.write('\n');
          resolve(valor);
          return;
        }
        if (tecla === '\u0003') {
          // Ctrl + C
          process.stdout.write('\nCancelado.\n');
          process.exit(130);
        }
        if (tecla === '\u007f' || tecla === '\b') {
          if (valor.length > 0) {
            valor = valor.slice(0, -1);
            process.stdout.write('\b \b');
          }
          continue;
        }
        if (tecla >= ' ') {
          valor += tecla;
          process.stdout.write(oculta ? '*' : tecla);
        }
      }
    };
    entrada.on('data', alTeclear);
  });
}

async function preguntar(texto: string, { oculta = false } = {}) {
  process.stdout.write(texto);
  if (esTerminal) return (await leerLineaTerminal(oculta)).trim();

  lineasPorTuberia ??= await leerTuberia();
  const respuesta = lineasPorTuberia.shift() ?? '';
  process.stdout.write(oculta ? '********\n' : `${respuesta}\n`);
  return respuesta.trim();
}

/** Repite la pregunta hasta que la respuesta sea válida (en tubería, falla a la primera). */
async function preguntarValido<T>(texto: string, esquema: z.ZodType<T>, opciones = {}): Promise<T> {
  for (;;) {
    const resultado = esquema.safeParse(await preguntar(texto, opciones));
    if (resultado.success) return resultado.data;
    console.log(`   ✖ ${resultado.error.issues[0]?.message ?? 'Valor inválido'}`);
    if (!esTerminal) throw new Error('Respuesta inválida');
  }
}

// ---------- Validaciones ----------

const esquemaNombre = z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres');
const esquemaCorreo = z.string().toLowerCase().max(150).pipe(z.email('Correo inválido'));
const esquemaPassword = z
  .string()
  .min(10, 'Mínimo 10 caracteres')
  .refine((p) => Buffer.byteLength(p, 'utf8') <= BYTES_MAXIMOS_PASSWORD, `Máximo ${BYTES_MAXIMOS_PASSWORD} bytes`)
  .refine((p) => /[a-zA-Z]/.test(p) && /\d/.test(p), 'Debe tener letras y números');

// ---------- Programa ----------

async function main() {
  console.log('\n🐾 GeoPatitas · Crear moderador\n');

  const [[activos]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS n FROM moderadores WHERE activo = 1');
  const rolSugerido = Number(activos?.n ?? 0) === 0 ? 'admin' : 'moderador';

  const nombre = await preguntarValido('Nombre: ', esquemaNombre);
  const correo = await preguntarValido('Correo: ', esquemaCorreo);

  const [existentes] = await pool.query<RowDataPacket[]>('SELECT id FROM moderadores WHERE correo = ?', [correo]);
  if (existentes[0]) throw new Error(`Ya existe un moderador con el correo ${correo}`);

  let password: string;
  for (;;) {
    password = await preguntarValido('Contraseña (mín. 10, letras y números): ', esquemaPassword, { oculta: true });
    const confirmacion = await preguntar('Repite la contraseña: ', { oculta: true });
    if (password === confirmacion) break;
    console.log('   ✖ Las contraseñas no coinciden');
    if (!esTerminal) throw new Error('Las contraseñas no coinciden');
  }

  const rol = await preguntarValido(
    `Rol (admin/moderador) [${rolSugerido}]: `,
    z.preprocess((v) => (v === '' ? rolSugerido : v), z.enum(['admin', 'moderador'], 'Escribe admin o moderador')),
  );

  const passwordHash = await hashearPassword(password);
  const [resultado] = await pool.query<ResultSetHeader>(
    'INSERT INTO moderadores (nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?)',
    [nombre, correo, passwordHash, rol],
  );

  console.log(`\n✅ Moderador creado: #${resultado.insertId} · ${nombre} · ${correo} · ${rol}`);
  console.log('   Ya puede iniciar sesión con POST /api/auth/login.\n');
}

main()
  .catch((error: unknown) => {
    const codigo = (error as { code?: string }).code;
    if (codigo === 'ECONNREFUSED') {
      console.error('\n❌ No se pudo conectar a MySQL. ¿Está encendido en XAMPP?');
    } else {
      console.error(`\n❌ ${(error as Error).message}`);
    }
    process.exitCode = 1;
  })
  .finally(() => pool.end());
