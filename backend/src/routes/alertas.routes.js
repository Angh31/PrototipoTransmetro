const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getAlertas, getAlertasActivas, cerrarAlerta } = require('../controllers/alertas.controller');
const router = Router();
router.get('/',           authMiddleware, getAlertas);
router.get('/activas',    authMiddleware, getAlertasActivas);
router.put('/:id/cerrar', authMiddleware, cerrarAlerta);
module.exports = router;
