/**
 * @file controllers/municipios.controller.js
 * @author Anghel CC
 * @project PrototipoTransmetro
 */

const { pool } = require('../config/db');

const getMunicipios = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM municipios ORDER BY nombre`);
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

const getMunicipioById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM municipios WHERE id_municipio = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ ok: false, message: 'Municipio no encontrado' });
    res.json({ ok: true, data: rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getMunicipios, getMunicipioById };
