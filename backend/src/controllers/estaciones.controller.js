/**
 * @file controllers/estaciones.controller.js
 * @description CRUD de estaciones + alerta de capacidad
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const { pool } = require('../config/db');
const { emitirAlertaCapacidad } = require('../sockets/alertas.socket');

// GET /api/estaciones
const getEstaciones = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.id_estacion, e.nombre, e.capacidad_max, e.activa,
             m.nombre AS municipio,
             COUNT(DISTINCT le.id_linea)  AS total_lineas,
             COUNT(DISTINCT a.id_acceso)  AS total_accesos
      FROM estaciones e
      JOIN municipios m ON m.id_municipio = e.id_municipio
      LEFT JOIN linea_estacion le ON le.id_estacion = e.id_estacion
      LEFT JOIN accesos a ON a.id_estacion = e.id_estacion
      GROUP BY e.id_estacion, m.nombre
      ORDER BY e.nombre
    `);
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

// GET /api/estaciones/:id
const getEstacionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const est = await pool.query(`
      SELECT e.*, m.nombre AS municipio
      FROM estaciones e JOIN municipios m ON m.id_municipio = e.id_municipio
      WHERE e.id_estacion = $1
    `, [id]);

    if (!est.rows.length)
      return res.status(404).json({ ok: false, message: 'Estación no encontrada' });

    const accesos = await pool.query(`
      SELECT a.id_acceso, a.descripcion,
             json_agg(json_build_object(
               'id', g.id_guardia,
               'nombre', g.nombres || ' ' || g.apellidos,
               'turno', ga.turno
             )) FILTER (WHERE g.id_guardia IS NOT NULL) AS guardias
      FROM accesos a
      LEFT JOIN guardia_acceso ga ON ga.id_acceso = a.id_acceso AND ga.activo = TRUE
      LEFT JOIN guardias g ON g.id_guardia = ga.id_guardia
      WHERE a.id_estacion = $1
      GROUP BY a.id_acceso
    `, [id]);

    res.json({ ok: true, data: { ...est.rows[0], accesos: accesos.rows } });
  } catch (err) { next(err); }
};

// GET /api/estaciones/:id/accesos
const getAccesosByEstacion = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.id_acceso, a.descripcion,
             COUNT(ga.id_guardia) FILTER (WHERE ga.activo = TRUE) AS guardias_activos
      FROM accesos a
      LEFT JOIN guardia_acceso ga ON ga.id_acceso = a.id_acceso
      WHERE a.id_estacion = $1
      GROUP BY a.id_acceso
    `, [req.params.id]);
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

// POST /api/estaciones/:id/alerta-capacidad
// Body: { ocupacion_actual }
const alertaCapacidad = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ocupacion_actual } = req.body;

    const est = await pool.query(
      `SELECT id_estacion, nombre, capacidad_max FROM estaciones WHERE id_estacion = $1`, [id]
    );
    if (!est.rows.length)
      return res.status(404).json({ ok: false, message: 'Estación no encontrada' });

    const estacion = est.rows[0];
    const porcentaje = (ocupacion_actual / estacion.capacidad_max) * 100;

    if (porcentaje >= 50) {
      // Registrar alerta en BD
      const alerta = await pool.query(`
        INSERT INTO alertas (tipo, nivel, mensaje, id_estacion)
        VALUES ('capacidad', 'alta', $1, $2) RETURNING *
      `, [
        `Estación ${estacion.nombre} al ${Math.round(porcentaje)}% de capacidad — enviar bus adicional`,
        id
      ]);

      // Emitir por Socket.io
      const io = req.app.get('io');
      emitirAlertaCapacidad(io, {
        estacionId:   id,
        nombre:       estacion.nombre,
        ocupacion:    ocupacion_actual,
        capacidadMax: estacion.capacidad_max,
      });

      return res.status(201).json({ ok: true, alerta_generada: true, data: alerta.rows[0] });
    }

    res.json({ ok: true, alerta_generada: false, message: 'Capacidad dentro del rango normal' });
  } catch (err) { next(err); }
};

module.exports = { getEstaciones, getEstacionById, getAccesosByEstacion, alertaCapacidad };
