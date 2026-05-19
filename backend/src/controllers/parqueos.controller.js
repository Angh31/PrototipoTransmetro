/**
 * @file controllers/parqueos.controller.js
 * @author Anghel CC
 * @project PrototipoTransmetro
 */

const { pool } = require('../config/db');

const getParqueos = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id_parqueo, p.nombre, p.capacidad, p.carga_electrica,
             m.nombre AS municipio,
             COUNT(b.id_bus) AS buses_asignados
      FROM parqueos p
      JOIN municipios m ON m.id_municipio = p.id_municipio
      LEFT JOIN buses b ON b.id_parqueo = p.id_parqueo
      GROUP BY p.id_parqueo, m.nombre
      ORDER BY p.nombre
    `);
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

const getParqueoById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM parqueos WHERE id_parqueo = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ ok: false, message: 'Parqueo no encontrado' });
    res.json({ ok: true, data: rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getParqueos, getParqueoById };
