/**
 * @file controllers/lineas.controller.js
 * @description CRUD de líneas de Transmetro
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const { pool } = require('../config/db');

// GET /api/lineas
const getLineas = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT l.id_linea, l.nombre, l.codigo, l.distancia_km, l.activa,
             m.nombre AS municipio,
             COUNT(DISTINCT le.id_estacion) AS total_estaciones,
             COUNT(DISTINCT b.id_bus)       AS total_buses
      FROM lineas l
      JOIN municipios m ON m.id_municipio = l.id_municipio
      LEFT JOIN linea_estacion le ON le.id_linea = l.id_linea
      LEFT JOIN buses b ON b.id_linea = l.id_linea AND b.activo = TRUE
      GROUP BY l.id_linea, m.nombre
      ORDER BY l.codigo
    `);
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

// GET /api/lineas/:id
const getLineaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const linea = await pool.query(`
      SELECT l.*, m.nombre AS municipio
      FROM lineas l JOIN municipios m ON m.id_municipio = l.id_municipio
      WHERE l.id_linea = $1
    `, [id]);

    if (!linea.rows.length)
      return res.status(404).json({ ok: false, message: 'Línea no encontrada' });

    // Estaciones en orden de visita
    const estaciones = await pool.query(`
      SELECT e.id_estacion, e.nombre, e.capacidad_max,
             le.orden_visita, le.distancia_km
      FROM linea_estacion le
      JOIN estaciones e ON e.id_estacion = le.id_estacion
      WHERE le.id_linea = $1
      ORDER BY le.orden_visita
    `, [id]);

    res.json({ ok: true, data: { ...linea.rows[0], estaciones: estaciones.rows } });
  } catch (err) { next(err); }
};

// GET /api/lineas/:id/buses
const getBusesByLinea = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT b.id_bus, b.placa, b.modelo, b.marca,
             b.es_electrico, b.capacidad_max, b.activo,
             p.nombre AS parqueo
      FROM buses b
      JOIN parqueos p ON p.id_parqueo = b.id_parqueo
      WHERE b.id_linea = $1
      ORDER BY b.placa
    `, [req.params.id]);
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

// POST /api/lineas
const createLinea = async (req, res, next) => {
  try {
    const { nombre, codigo, distancia_km, id_municipio } = req.body;
    if (!nombre || !codigo || !id_municipio)
      return res.status(400).json({ ok: false, message: 'nombre, codigo e id_municipio son requeridos' });

    const { rows } = await pool.query(`
      INSERT INTO lineas (nombre, codigo, distancia_km, id_municipio)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [nombre, codigo, distancia_km || null, id_municipio]);

    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/lineas/:id
const updateLinea = async (req, res, next) => {
  try {
    const { nombre, distancia_km, activa } = req.body;
    const { rows } = await pool.query(`
      UPDATE lineas SET
        nombre       = COALESCE($1, nombre),
        distancia_km = COALESCE($2, distancia_km),
        activa       = COALESCE($3, activa)
      WHERE id_linea = $4 RETURNING *
    `, [nombre, distancia_km, activa, req.params.id]);

    if (!rows.length)
      return res.status(404).json({ ok: false, message: 'Línea no encontrada' });

    res.json({ ok: true, data: rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getLineas, getLineaById, getBusesByLinea, createLinea, updateLinea };
