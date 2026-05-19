/**
 * @file routes/index.js
 * @description Registro central de todas las rutas de la API
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const { Router } = require('express');

const authRoutes       = require('./auth.routes');
const dashboardRoutes  = require('./dashboard.routes');
const lineasRoutes     = require('./lineas.routes');
const estacionesRoutes = require('./estaciones.routes');
const busesRoutes      = require('./buses.routes');
const pilotosRoutes    = require('./pilotos.routes');
const alertasRoutes    = require('./alertas.routes');
const municipiosRoutes = require('./municipios.routes');
const parqueosRoutes   = require('./parqueos.routes');
const operacionRoutes  = require('./operacion.routes');
const publicoRoutes    = require('./publico.routes');

const router = Router();

// Ruta de salud (sin autenticación)
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'PrototipoTransmetro API',
    author: 'Anghel CC',
    timestamp: new Date().toISOString(),
  });
});

// Módulos de la API
router.use('/auth',        authRoutes);
router.use('/dashboard',   dashboardRoutes);
router.use('/lineas',      lineasRoutes);
router.use('/estaciones',  estacionesRoutes);
router.use('/buses',       busesRoutes);
router.use('/pilotos',     pilotosRoutes);
router.use('/alertas',     alertasRoutes);
router.use('/municipios',  municipiosRoutes);
router.use('/parqueos',    parqueosRoutes);
router.use('/operacion',   operacionRoutes);
router.use('/publico',     publicoRoutes);

module.exports = router;
