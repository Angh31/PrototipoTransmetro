/**
 * @file config/db.js
 * @description Conexión al pool de PostgreSQL
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'transmetro_db',
  user:     process.env.DB_USER     || 'transmetro_user',
  password: process.env.DB_PASS     || 'transmetro_pass_2026',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('[DB] Nueva conexión al pool de PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB] Error inesperado en cliente inactivo:', err.message);
});

/**
 * Verifica la conexión a la base de datos al iniciar
 */
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() AS now');
    console.log(`[DB] Conexión exitosa — ${result.rows[0].now}`);
    client.release();
  } catch (err) {
    console.error('[DB] No se pudo conectar a PostgreSQL:', err.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
