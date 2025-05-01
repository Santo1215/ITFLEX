// db.js
const { Pool } = require('pg');
require('dotenv').config(); // Cargar variables de entorno

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;

// Conexión a la base de datos PostgreSQL (Prueba de conexión)
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error al conectar a PostgreSQL:', err);
    } else {
        console.log('✅ Conexión exitosa. Fecha y hora actual desde PostgreSQL:', res.rows[0]);
    }
    pool.end(); // cerrar conexión después de la prueba
});