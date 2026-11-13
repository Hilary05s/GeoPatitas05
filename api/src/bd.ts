import 'dotenv/config';             // carga las variables del .env
import mysql from 'mysql2/promise'; // librería para hablar con MySQL

// Conexiones reutilizables a la base geopatitas
export const pool = mysql.createPool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'geopatitas',
    decimalNumbers: true,
});


