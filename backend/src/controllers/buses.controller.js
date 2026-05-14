/**
 * @file controllers/buses.controller.js
 * @description CRUD de flota de buses
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const { pool } = require('../config/db');
const { emitirAlertaEspera } = require('../sockets/alertas.socket');

// GET /api/buses
const getBuses = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT b.id_bus, b.placa, b.modelo, b.marca, b.es_electrico,
             b.capacidad_max, b.activo,
             l.codigo  AS linea_codigo,
             l.nombre  AS linea_nombre,
             p.nombre  AS parqueo
      FROM buses b
      LEFT JOIN lineas   l ON l.id_linea   = b.id_linea
      JOIN      parqueos p ON p.id_parqueo = b.id_parqueo
      ORDER BY b.placa
    `);
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

// GET /api/buses/:id
const getBusById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT b.*,
             l.codigo AS linea_codigo, l.nombre AS linea_nombre,
             p.nombre AS parqueo, p.carga_electrica
      FROM buses b
      LEFT JOIN lineas   l ON l.id_linea   = b.id_linea
      JOIN      parqueos p ON p.id_parqueo = b.id_parqueo
      WHERE b.id_bus = $1
    `, [req.params.id]);

    if (!rows.length)
      return res.status(404).json({ ok: false, message: 'Bus no encontrado' });

    res.json({ ok: true, data: rows[0] });
  } catch (err) { next(err); }
};

// POST /api/buses
const createBus = async (req, res, next) => {
  try {
    const { placa, modelo, marca, es_electrico, capacidad_max, id_linea, id_parqueo } = req.body;
    if (!placa || !modelo || !marca || !capacidad_max || !id_parqueo)
      return res.status(400).json({ ok: false, message: 'placa, modelo, marca, capacidad_max e id_parqueo son requeridos' });

    const { rows } = await pool.query(`
      INSERT INTO buses (placa, modelo, marca, es_electrico, capacidad_max, id_linea, id_parqueo)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [placa, modelo, marca, es_electrico || false, capacidad_max, id_linea || null, id_parqueo]);

    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/buses/:id/parqueo — cambiar parqueo
const cambiarParqueo = async (req, res, next) => {
  try {
    const { id_parqueo } = req.body;
    if (!id_parqueo)
      return res.status(400).json({ ok: false, message: 'id_parqueo requerido' });

    const { rows } = await pool.query(`
      UPDATE buses SET id_parqueo = $1 WHERE id_bus = $2 RETURNING *
    `, [id_parqueo, req.params.id]);

    if (!rows.length)
      return res.status(404).json({ ok: false, message: 'Bus no encontrado' });

    res.json({ ok: true, data: rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/buses/:id/linea — asignar o desasignar línea
const cambiarLinea = async (req, res, next) => {
  try {
    const { id_linea } = req.body; // null = desasignar
    const { rows } = await pool.query(`
      UPDATE buses SET id_linea = $1 WHERE id_bus = $2 RETURNING *
    `, [id_linea || null, req.params.id]);

    if (!rows.length)
      return res.status(404).json({ ok: false, message: 'Bus no encontrado' });

    res.json({ ok: true, data: rows[0] });
  } catch (err) { next(err); }
};

// POST /api/buses/:id/alerta-espera
// Body: { ocupacion_actual, id_estacion }
const alertaEspera = async (req, res, next) => {
  try {
    const { ocupacion_actual, id_estacion } = req.body;
    const bus = await pool.query(
      `SELECT id_bus, placa, capacidad_max, id_linea FROM buses WHERE id_bus = $1`, [req.params.id]
    );
    if (!bus.rows.length)
      return res.status(404).json({ ok: false, message: 'Bus no encontrado' });

    const b = bus.rows[0];
    const porcentaje = (ocupacion_actual / b.capacidad_max) * 100;

    if (porcentaje < 25) {
      const alerta = await pool.query(`
        INSERT INTO alertas (tipo, nivel, mensaje, id_bus, id_estacion)
        VALUES ('espera', 'media', $1, $2, $3) RETURNING *
      `, [
        `Bus ${b.placa} con ${Math.round(porcentaje)}% de ocupación — esperar 5 minutos adicionales`,
        b.id_bus, id_estacion || null
      ]);

      const io = req.app.get('io');
      emitirAlertaEspera(io, {
        busId: b.id_bus, placa: b.placa,
        lineaId: b.id_linea, estacionId: id_estacion,
        ocupacion: ocupacion_actual, capacidadMax: b.capacidad_max,
      });

      return res.status(201).json({ ok: true, espera_activada: true, data: alerta.rows[0] });
    }

    res.json({ ok: true, espera_activada: false, message: 'Ocupación suficiente, no requiere espera' });
  } catch (err) { next(err); }
};

module.exports = { getBuses, getBusById, createBus, cambiarParqueo, cambiarLinea, alertaEspera };
