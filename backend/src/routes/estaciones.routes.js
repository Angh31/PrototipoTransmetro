const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getEstaciones, getEstacionById, getAccesosByEstacion, alertaCapacidad } = require('../controllers/estaciones.controller');
const router = Router();
router.get('/',                      authMiddleware, getEstaciones);
router.get('/:id',                   authMiddleware, getEstacionById);
router.get('/:id/accesos',           authMiddleware, getAccesosByEstacion);
router.post('/:id/alerta-capacidad', authMiddleware, alertaCapacidad);
module.exports = router;
