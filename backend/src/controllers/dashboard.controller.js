/**
 * @file controllers/dashboard.controller.js
 * @description Métricas generales del sistema en tiempo real
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const { pool } = require('../config/db');

// GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [lineas, buses, estaciones, alertas, flota] = await Promise.all([
      // Total líneas activas
      pool.query(`SELECT COUNT(*) AS total FROM lineas WHERE activa = TRUE`),

      // Buses activos / total
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE activo = TRUE)  AS activos,
          COUNT(*) FILTER (WHERE activo = FALSE) AS inactivos,
          COUNT(*) FILTER (WHERE es_electrico = TRUE AND activo = TRUE) AS electricos,
          COUNT(*) AS total
        FROM buses
      `),

      // Estaciones activas
      pool.query(`SELECT COUNT(*) AS total FROM estaciones WHERE activa = TRUE`),

      // Alertas sin resolver
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE resuelta = FALSE)             AS pendientes,
          COUNT(*) FILTER (WHERE resuelta = FALSE AND nivel = 'alta')   AS alta,
          COUNT(*) FILTER (WHERE resuelta = FALSE AND nivel = 'media')  AS media,
          COUNT(*) FILTER (WHERE resuelta = FALSE AND nivel = 'critica') AS critica
        FROM alertas
      `),

      // Flota por línea
      pool.query(`
        SELECT l.codigo, l.nombre,
               COUNT(b.id_bus) AS buses_asignados,
               COUNT(le.id_estacion) AS total_estaciones
        FROM lineas l
        LEFT JOIN buses b ON b.id_linea = l.id_linea AND b.activo = TRUE
        LEFT JOIN linea_estacion le ON le.id_linea = l.id_linea
        WHERE l.activa = TRUE
        GROUP BY l.id_linea, l.codigo, l.nombre
        ORDER BY l.codigo
      `),
    ]);

    res.json({
      ok: true,
      data: {
        lineas_activas:    parseInt(lineas.rows[0].total),
        estaciones_activas: parseInt(estaciones.rows[0].total),
        buses: {
          total:     parseInt(buses.rows[0].total),
          activos:   parseInt(buses.rows[0].activos),
          inactivos: parseInt(buses.rows[0].inactivos),
          electricos: parseInt(buses.rows[0].electricos),
        },
        alertas: {
          pendientes: parseInt(alertas.rows[0].pendientes),
          alta:       parseInt(alertas.rows[0].alta),
          media:      parseInt(alertas.rows[0].media),
          critica:    parseInt(alertas.rows[0].critica),
        },
        flota_por_linea: flota.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
