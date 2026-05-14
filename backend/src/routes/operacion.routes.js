const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { registrarBusEnEstacion, getAhorroCombustible } = require('../controllers/operacion.controller');

const router = Router();

router.post('/registro-estacion', authMiddleware, registrarBusEnEstacion);
router.get('/ahorro-combustible', authMiddleware, getAhorroCombustible);

module.exports = router;
