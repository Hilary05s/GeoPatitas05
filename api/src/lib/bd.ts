import mysql, { type PoolConnection } from 'mysql2/promise'; // librería para hablar con MySQL

import { config } from './config.js';

/**
 * Conexiones reutilizables a la base `geopatitas`.
 *
 * - decimalNumbers: DECIMAL (lat_centro, lng_centro, SUM) llega como number.
 * - dateStrings ['DATE']: las columnas DATE llegan como "2026-11-21" y no se
 *   corren un día por la zona horaria. DATETIME sigue llegando como fecha ISO.
 *
 * Regla: SIEMPRE consultas parametrizadas con `?`. Nunca concatenar valores en el SQL.
 */
export const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  decimalNumbers: true,
  dateStrings: ['DATE'],
  connectionLimit: 10,
  charset: 'utf8mb4',
});

/**
 * Ejecuta varias consultas como una sola operación: si algo falla, se deshace todo.
 *   const r = await enTransaccion(async (con) => { await con.query(...); ... return algo; });
 */
export async function enTransaccion<T>(trabajo: (conexion: PoolConnection) => Promise<T>): Promise<T> {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const resultado = await trabajo(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    await conexion.rollback().catch(() => undefined);
    throw error;
  } finally {
    conexion.release();
  }
}

/** Prueba la conexión al arrancar para avisar en consola si MySQL está apagado. */
export async function verificarConexion() {
  try {
    await pool.query('SELECT 1');
    console.log(`✅ Conectado a MySQL (${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME})`);
  } catch (error) {
    const codigo = (error as { code?: string }).code ?? 'desconocido';
    console.warn(`⚠️  No se pudo conectar a MySQL (${codigo}). ¿Está encendido en XAMPP?`);
    console.warn('   La API arranca igual, pero las rutas que usan la base responderán 503.');
  }
}
