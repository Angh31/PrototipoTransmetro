/**
 * @file controllers/publico.controller.js
 * @description Endpoints públicos para pasajeros (sin autenticación)
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const { pool } = require('../config/db');

// GET /api/publico/red
// Información general de la red para consulta pública
const getRedPublica = async (req, res, next) => {
  try {
    const [lineasRes, estacionesRes, metricasRes, alertasRes, recorridosRes] = await Promise.all([
      pool.query(`
        SELECT l.id_linea, l.codigo, l.nombre, l.distancia_km,
               m.nombre AS municipio,
               COUNT(DISTINCT le.id_estacion) AS total_estaciones,
               COUNT(DISTINCT b.id_bus) FILTER (WHERE b.activo = TRUE) AS total_buses
        FROM lineas l
        JOIN municipios m ON m.id_municipio = l.id_municipio
        LEFT JOIN linea_estacion le ON le.id_linea = l.id_linea
        LEFT JOIN buses b ON b.id_linea = l.id_linea
        WHERE l.activa = TRUE
        GROUP BY l.id_linea, m.nombre
        ORDER BY l.codigo
      `),
      pool.query(`
        SELECT e.id_estacion, e.nombre, e.capacidad_max,
               e.lat, e.lng,
               m.nombre AS municipio,
               COUNT(DISTINCT le.id_linea) AS total_lineas
        FROM estaciones e
        JOIN municipios m ON m.id_municipio = e.id_municipio
        LEFT JOIN linea_estacion le ON le.id_estacion = e.id_estacion
        WHERE e.activa = TRUE
        GROUP BY e.id_estacion, m.nombre
        ORDER BY e.nombre
      `),
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM lineas      WHERE activa = TRUE) AS lineas,
          (SELECT COUNT(*) FROM estaciones  WHERE activa = TRUE) AS estaciones,
          (SELECT COUNT(*) FROM buses       WHERE activo = TRUE) AS buses_en_servicio,
          (SELECT COUNT(*) FROM alertas     WHERE resuelta = FALSE) AS alertas_activas
      `),
      pool.query(`
        SELECT a.id_alerta, a.tipo, a.nivel, a.mensaje, a.created_at,
               e.nombre AS estacion_nombre
        FROM alertas a
        LEFT JOIN estaciones e ON e.id_estacion = a.id_estacion
        WHERE a.resuelta = FALSE
        ORDER BY a.created_at DESC
        LIMIT 20
      `),
      // Recorridos por línea (para dibujar las polilíneas del mapa)
      pool.query(`
        SELECT le.id_linea, l.codigo, le.orden_visita,
               e.lat, e.lng, e.nombre
        FROM linea_estacion le
        JOIN estaciones e ON e.id_estacion = le.id_estacion
        JOIN lineas     l ON l.id_linea    = le.id_linea
        WHERE e.lat IS NOT NULL AND e.lng IS NOT NULL AND l.activa = TRUE
        ORDER BY le.id_linea, le.orden_visita
      `),
    ]);

    // Agrupar recorridos por línea
    const recorridos = [];
    const indice = new Map();
    for (const r of recorridosRes.rows) {
      if (!indice.has(r.id_linea)) {
        const entry = { id_linea: r.id_linea, codigo: r.codigo, puntos: [] };
        indice.set(r.id_linea, entry);
        recorridos.push(entry);
      }
      indice.get(r.id_linea).puntos.push({
        nombre: r.nombre,
        lat:    r.lat,
        lng:    r.lng,
        orden:  r.orden_visita,
      });
    }

    res.json({
      ok: true,
      data: {
        lineas:     lineasRes.rows,
        estaciones: estacionesRes.rows,
        metricas:   metricasRes.rows[0],
        alertas:    alertasRes.rows,
        recorridos,
      },
    });
  } catch (err) { next(err); }
};

// GET /api/publico/lineas/:id
// Detalle público de una línea con sus estaciones en orden
const getLineaPublica = async (req, res, next) => {
  try {
    const { id } = req.params;
    const linea = await pool.query(`
      SELECT l.id_linea, l.codigo, l.nombre, l.distancia_km,
             m.nombre AS municipio
      FROM lineas l JOIN municipios m ON m.id_municipio = l.id_municipio
      WHERE l.id_linea = $1 AND l.activa = TRUE
    `, [id]);

    if (!linea.rows.length)
      return res.status(404).json({ ok: false, message: 'Línea no disponible' });

    const estaciones = await pool.query(`
      SELECT e.id_estacion, e.nombre, e.capacidad_max,
             le.orden_visita, le.distancia_km
      FROM linea_estacion le
      JOIN estaciones e ON e.id_estacion = le.id_estacion
      WHERE le.id_linea = $1
      ORDER BY le.orden_visita
    `, [id]);

    const buses = await pool.query(
      `SELECT COUNT(*) AS total FROM buses WHERE id_linea = $1 AND activo = TRUE`, [id]
    );

    res.json({
      ok: true,
      data: {
        ...linea.rows[0],
        estaciones:  estaciones.rows,
        total_buses: parseInt(buses.rows[0].total),
      },
    });
  } catch (err) { next(err); }
};

module.exports = { getRedPublica, getLineaPublica };
