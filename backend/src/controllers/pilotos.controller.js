/**
 * @file controllers/pilotos.controller.js
 * @description CRUD de pilotos con historial educativo y residencia
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const { pool } = require('../config/db');

// GET /api/pilotos
const getPilotos = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id_piloto, p.nombres, p.apellidos, p.dpi, p.telefono,
             p.correo, p.municipio_reside, p.nivel_educativo, p.activo,
             l.codigo AS linea_codigo, l.nombre AS linea_nombre
      FROM pilotos p
      LEFT JOIN lineas l ON l.id_linea = p.id_linea
      ORDER BY p.apellidos, p.nombres
    `);
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

// GET /api/pilotos/:id
const getPilotoById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, l.codigo AS linea_codigo, l.nombre AS linea_nombre
      FROM pilotos p
      LEFT JOIN lineas l ON l.id_linea = p.id_linea
      WHERE p.id_piloto = $1
    `, [req.params.id]);

    if (!rows.length)
      return res.status(404).json({ ok: false, message: 'Piloto no encontrado' });

    res.json({ ok: true, data: rows[0] });
  } catch (err) { next(err); }
};

// POST /api/pilotos
const createPiloto = async (req, res, next) => {
  try {
    const {
      nombres, apellidos, dpi, fecha_nacimiento, telefono, correo,
      municipio_reside, direccion, nivel_educativo, titulo, institucion, id_linea
    } = req.body;

    if (!nombres || !apellidos || !dpi)
      return res.status(400).json({ ok: false, message: 'nombres, apellidos y dpi son requeridos' });

    const { rows } = await pool.query(`
      INSERT INTO pilotos
        (nombres, apellidos, dpi, fecha_nacimiento, telefono, correo,
         municipio_reside, direccion, nivel_educativo, titulo, institucion, id_linea)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *
    `, [nombres, apellidos, dpi, fecha_nacimiento||null, telefono||null, correo||null,
        municipio_reside||null, direccion||null, nivel_educativo||null,
        titulo||null, institucion||null, id_linea||null]);

    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/pilotos/:id
const updatePiloto = async (req, res, next) => {
  try {
    const {
      telefono, correo, municipio_reside, direccion,
      nivel_educativo, titulo, institucion, id_linea, activo
    } = req.body;

    const { rows } = await pool.query(`
      UPDATE pilotos SET
        telefono        = COALESCE($1,  telefono),
        correo          = COALESCE($2,  correo),
        municipio_reside= COALESCE($3,  municipio_reside),
        direccion       = COALESCE($4,  direccion),
        nivel_educativo = COALESCE($5,  nivel_educativo),
        titulo          = COALESCE($6,  titulo),
        institucion     = COALESCE($7,  institucion),
        id_linea        = COALESCE($8,  id_linea),
        activo          = COALESCE($9,  activo)
      WHERE id_piloto = $10 RETURNING *
    `, [telefono, correo, municipio_reside, direccion,
        nivel_educativo, titulo, institucion, id_linea, activo, req.params.id]);

    if (!rows.length)
      return res.status(404).json({ ok: false, message: 'Piloto no encontrado' });

    res.json({ ok: true, data: rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getPilotos, getPilotoById, createPiloto, updatePiloto };
