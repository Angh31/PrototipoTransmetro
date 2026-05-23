/**
 * @file controllers/auditoria.controller.js
 * @description Lectura de la bitácora de auditoría (solo admin)
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const { pool } = require('../config/db');

// GET /api/auditoria
const getAuditoria = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT id_auditoria, usuario, accion, detalle, created_at
      FROM auditoria
      ORDER BY created_at DESC
      LIMIT 200
    `);
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = { getAuditoria };
