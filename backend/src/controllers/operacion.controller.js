/**
 * @file controllers/operacion.controller.js
 * @description Lógica de negocio crítica (REQ-0001, REQ-0005, REQ-0006 y Jerarquía)
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const { pool } = require('../config/db');
const { emitirAlertaCapacidad, emitirAlertaEspera } = require('../sockets/alertas.socket');

// POST /api/operacion/registro-estacion
const registrarBusEnEstacion = async (req, res, next) => {
  try {
    const { id_bus, id_estacion, ocupacion_bus, ocupacion_estacion } = req.body;

    if (!id_bus || !id_estacion || ocupacion_bus === undefined || ocupacion_estacion === undefined) {
      return res.status(400).json({ ok: false, message: 'Faltan parámetros requeridos' });
    }

    // 1. Validar Bus y Parqueo (REQ-0001: Validación de Salida)
    const busRes = await pool.query(`SELECT id_bus, placa, capacidad_max, id_parqueo FROM buses WHERE id_bus = $1`, [id_bus]);
    if (!busRes.rows.length) return res.status(404).json({ ok: false, message: 'Bus no encontrado' });
    const bus = busRes.rows[0];

    if (!bus.id_parqueo) {
      return res.status(403).json({ 
        ok: false, 
        accion: 'bloqueado', 
        mensaje: 'REQ-0001: El bus no puede operar sin un parqueo físico asignado.' 
      });
    }

    // 2. Obtener Estación
    const estRes = await pool.query(`SELECT id_estacion, nombre, capacidad_max FROM estaciones WHERE id_estacion = $1`, [id_estacion]);
    if (!estRes.rows.length) return res.status(404).json({ ok: false, message: 'Estación no encontrada' });
    const estacion = estRes.rows[0];

    // Cálculos de porcentaje (tope en 100% para evitar números absurdos por errores de tipeo)
    const pctBus = Math.min((ocupacion_bus / bus.capacidad_max) * 100, 100);
    const pctEstacion = Math.min((ocupacion_estacion / estacion.capacidad_max) * 100, 100);

    const io = req.app.get('io');
    let alertasGeneradas = [];
    let accion = 'despachar';
    let justificacion = 'Tránsito normal. Operación estándar.';

    // Evaluación de Reglas Críticas
    const reglaSaturacion = pctEstacion >= 50; // REQ-0005
    const reglaEficiencia = pctBus < 25;       // REQ-0006

    // Jerarquía de Resolución de Conflictos
    if (reglaSaturacion && reglaEficiencia) {
      // Prioridad a REQ-0005, se anula la espera de REQ-0006
      accion = 'despachar_urgente';
      justificacion = `Jerarquía Aplicada: Estación saturada al ${Math.round(pctEstacion)}%. Se anula el modo eficiencia del bus para liberar la plataforma inmediatamente.`;
      
      const alerta = await pool.query(`
        INSERT INTO alertas (tipo, nivel, mensaje, id_estacion, id_bus)
        VALUES ('capacidad', 'alta', $1, $2, $3) RETURNING *
      `, [ `¡Refuerzo Necesario! Estación ${estacion.nombre} al ${Math.round(pctEstacion)}%`, id_estacion, id_bus ]);
      
      emitirAlertaCapacidad(io, { estacionId: id_estacion, nombre: estacion.nombre, ocupacion: ocupacion_estacion, capacidadMax: estacion.capacidad_max });
      alertasGeneradas.push(alerta.rows[0]);

    } else if (reglaSaturacion) {
      // Solo REQ-0005
      accion = 'despachar';
      justificacion = `Estación con alta demanda (${Math.round(pctEstacion)}% de saturación).`;
      
      const alerta = await pool.query(`
        INSERT INTO alertas (tipo, nivel, mensaje, id_estacion, id_bus)
        VALUES ('capacidad', 'alta', $1, $2, $3) RETURNING *
      `, [ `¡Refuerzo Necesario! Estación ${estacion.nombre} al ${Math.round(pctEstacion)}%`, id_estacion, id_bus ]);
      
      emitirAlertaCapacidad(io, { estacionId: id_estacion, nombre: estacion.nombre, ocupacion: ocupacion_estacion, capacidadMax: estacion.capacidad_max });
      alertasGeneradas.push(alerta.rows[0]);

    } else if (reglaEficiencia) {
      // Solo REQ-0006
      accion = 'esperar';
      justificacion = `Modo Eficiencia activado: Unidad con baja carga (${Math.round(pctBus)}%). Cronómetro de 5 minutos iniciado.`;
      
      const alerta = await pool.query(`
        INSERT INTO alertas (tipo, nivel, mensaje, id_estacion, id_bus)
        VALUES ('espera', 'media', $1, $2, $3) RETURNING *
      `, [ `Bus ${bus.placa} esperando 5 min en ${estacion.nombre} (Carga: ${Math.round(pctBus)}%)`, id_estacion, id_bus ]);
      
      emitirAlertaEspera(io, { busId: id_bus, placa: bus.placa, estacionId: id_estacion, ocupacion: ocupacion_bus, capacidadMax: bus.capacidad_max });
      alertasGeneradas.push(alerta.rows[0]);
    }

    res.json({
      ok: true,
      data: {
        accion,
        justificacion,
        pctBus: Math.round(pctBus),
        pctEstacion: Math.round(pctEstacion),
        alertas: alertasGeneradas
      }
    });

  } catch (err) {
    next(err);
  }
};

// GET /api/operacion/ahorro-combustible
// REQ-0004: Cálculo de distancia digital y ahorro
const getAhorroCombustible = async (req, res, next) => {
  try {
    // Calculamos los km que recorren los buses eléctricos (BYD)
    // Supongamos que cada bus da 5 vueltas diarias a su línea
    const { rows } = await pool.query(`
      SELECT 
        COUNT(b.id_bus) AS buses_electricos,
        SUM(l.distancia_km) AS kms_totales_lineas
      FROM buses b
      JOIN lineas l ON l.id_linea = b.id_linea
      WHERE b.es_electrico = TRUE AND b.activo = TRUE
    `);

    const buses = parseInt(rows[0].buses_electricos) || 0;
    const kms = parseFloat(rows[0].kms_totales_lineas) || 0;
    
    // Distancia diaria estimada (5 vueltas * kms * buses)
    const kmDiarios = buses * kms * 5; 
    
    // Un bus diesel gasta aprox 0.5 galones/km. Ahorro de 0.5 gal * km
    const galonesAhorrados = kmDiarios * 0.5;
    // Emisiones de CO2 evitadas (1 galón diesel = 10.18 kg CO2)
    const co2EvitadoKg = galonesAhorrados * 10.18;

    res.json({
      ok: true,
      data: {
        buses_electricos: buses,
        distancia_diaria_km: kmDiarios.toFixed(2),
        galones_ahorrados_dia: galonesAhorrados.toFixed(2),
        co2_evitado_kg_dia: co2EvitadoKg.toFixed(2)
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { registrarBusEnEstacion, getAhorroCombustible };
