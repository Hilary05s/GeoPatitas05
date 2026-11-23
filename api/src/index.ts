import { pool } from './bd.js';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());      // permite que el frontend le pida datos a la API     
const PORT = 3000;              // puerto donde escuchará

// Ruta: cuando alguien entre a /api, responde con un JSON
app.get('/api', (req, res) => {
    res.json({ mensaje: 'GeoPatitas API funcionando' });
});

app.get('/api/zonas', async (req, res) => {
    const [filas] = await pool.query('SELECT * FROM zonas');
    res.json(filas);
});


// Enciende el servidor y lo deja escuchando peticiones
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});