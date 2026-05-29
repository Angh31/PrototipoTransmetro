/**
 * @file config/init.js
 * @description Inicialización automática de la base de datos en el primer arranque.
 *              Solo se ejecuta si la BD aún no tiene el esquema (despliegue nuevo).
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

// La carpeta database/ se copia dentro de la imagen de producción (ver Dockerfile raíz)
const BASE = path.join(__dirname, '..', '..', 'database');

const ARCHIVOS = [
  'migrations/001_schema_base.sql',
  'migrations/002_schema_operacional.sql',
  'migrations/003_schema_personal.sql',
  'migrations/004_triggers.sql',
  'migrations/005_indexes.sql',
  'migrations/006_fix_trigger_flota.sql',
  'migrations/007_estaciones_geolocalizacion.sql',
  'migrations/008_seguridad_auditoria.sql',
  'migrations/009_roles_piloto_guardia.sql',
  'seeds/seed_transmetro.sql',
  'migrations/010_estaciones_oficiales.sql',
];

/**
 * Inicializa la BD si está vacía. No hace nada si ya existe el esquema.
 */
const inicializarBD = async () => {
  try {
    const existe = await pool.query("SELECT to_regclass('public.usuarios') AS t");
    if (existe.rows[0].t) {
      console.log('[INIT] La base de datos ya está inicializada.');
      return;
    }
    if (!fs.existsSync(BASE)) {
      console.warn('[INIT] No se encontró la carpeta database/. Se omite la inicialización automática.');
      return;
    }
    console.log('[INIT] Base de datos vacía — aplicando esquema y datos...');
    for (const archivo of ARCHIVOS) {
      const ruta = path.join(BASE, archivo);
      if (!fs.existsSync(ruta)) { console.warn(`[INIT] (omitido, no existe) ${archivo}`); continue; }
      const sql = fs.readFileSync(ruta, 'utf8');
      await pool.query(sql);
      console.log(`[INIT] aplicado → ${archivo}`);
    }
    console.log('[INIT] Base de datos lista.');
  } catch (err) {
    console.error('[INIT] Error inicializando la base de datos:', err.message);
  }
};

module.exports = { inicializarBD };
