/**
 * @file controllers/alertas.controller.js
 * @description Gestión de alertas del sistema
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const { pool } = require('../config/db');
const { registrarAuditoria } = require('../utils/auditoria');

// GET /api/alertas
const getAlertas = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.id_alerta, a.tipo, a.nivel, a.mensaje,
             a.resuelta, a.created_at, a.resuelta_at,
             b.placa       AS bus_placa,
             e.nombre      AS estacion_nombre
      FROM alertas a
      LEFT JOIN buses      b ON b.id_bus      = a.id_bus
      LEFT JOIN estaciones e ON e.id_estacion = a.id_estacion
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

// GET /api/alertas/activas
const getAlertasActivas = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.id_alerta, a.tipo, a.nivel, a.mensaje,
             a.created_at,
             b.placa       AS bus_placa,
             e.nombre      AS estacion_nombre
      FROM alertas a
      LEFT JOIN buses      b ON b.id_bus      = a.id_bus
      LEFT JOIN estaciones e ON e.id_estacion = a.id_estacion
      WHERE a.resuelta = FALSE
      ORDER BY
        CASE a.nivel WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 ELSE 4 END,
        a.created_at DESC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

// PUT /api/alertas/:id/cerrar
const cerrarAlerta = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      UPDATE alertas
      SET resuelta = TRUE, resuelta_at = NOW()
      WHERE id_alerta = $1 RETURNING *
    `, [req.params.id]);

    if (!rows.length)
      return res.status(404).json({ ok: false, message: 'Alerta no encontrada' });

    // Notificar resolución por socket
    const io = req.app.get('io');
    io.to('dashboard').emit('alerta:resuelta', { id_alerta: rows[0].id_alerta });

    await registrarAuditoria(req.user?.username, 'ALERTA_RESUELTA', `Alerta #${rows[0].id_alerta} (${rows[0].tipo})`);

    res.json({ ok: true, data: rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getAlertas, getAlertasActivas, cerrarAlerta };
