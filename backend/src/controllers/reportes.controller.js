/**
 * @file controllers/reportes.controller.js
 * @description Reportes y estadísticas agregadas por rango de fecha
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const { pool } = require('../config/db');

const RANGOS = { hoy: 1, semana: 7, mes: 30 };

// GET /api/reportes?rango=semana
const getReportes = async (req, res, next) => {
  try {
    const dias = RANGOS[req.query.rango] || 7; // entero seguro (whitelist)
    const intervalo = `${dias} days`;

    const [resumen, porDia, porTipo, porEstacion, flota] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)                              AS total,
          COUNT(*) FILTER (WHERE resuelta)      AS resueltas,
          COUNT(*) FILTER (WHERE NOT resuelta)  AS activas,
          COUNT(*) FILTER (WHERE nivel IN ('alta','critica')) AS criticas
        FROM alertas
        WHERE created_at >= NOW() - $1::interval
      `, [intervalo]),

      pool.query(`
        SELECT to_char(date_trunc('day', created_at), 'DD/MM') AS dia,
               COUNT(*) AS total
        FROM alertas
        WHERE created_at >= NOW() - $1::interval
        GROUP BY date_trunc('day', created_at)
        ORDER BY date_trunc('day', created_at)
      `, [intervalo]),

      pool.query(`
        SELECT tipo, COUNT(*) AS total
        FROM alertas
        WHERE created_at >= NOW() - $1::interval
        GROUP BY tipo
        ORDER BY total DESC
      `, [intervalo]),

      pool.query(`
        SELECT e.nombre, COUNT(*) AS total
        FROM alertas a
        JOIN estaciones e ON e.id_estacion = a.id_estacion
        WHERE a.created_at >= NOW() - $1::interval
        GROUP BY e.nombre
        ORDER BY total DESC
        LIMIT 8
      `, [intervalo]),

      pool.query(`
        SELECT l.codigo, l.nombre,
               COUNT(b.id_bus) FILTER (WHERE b.activo = TRUE) AS buses
        FROM lineas l
        LEFT JOIN buses b ON b.id_linea = l.id_linea
        WHERE l.activa = TRUE
        GROUP BY l.id_linea, l.codigo, l.nombre
        HAVING COUNT(b.id_bus) FILTER (WHERE b.activo = TRUE) > 0
        ORDER BY buses DESC
      `),
    ]);

    res.json({
      ok: true,
      data: {
        rango:        req.query.rango || 'semana',
        dias,
        resumen:      resumen.rows[0],
        por_dia:      porDia.rows,
        por_tipo:     porTipo.rows,
        por_estacion: porEstacion.rows,
        flota:        flota.rows,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { getReportes };
