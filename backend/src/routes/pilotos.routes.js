const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getPilotos, getPilotoById, createPiloto, updatePiloto } = require('../controllers/pilotos.controller');
const router = Router();
router.get('/',     authMiddleware, getPilotos);
router.get('/:id',  authMiddleware, getPilotoById);
router.post('/',    authMiddleware, createPiloto);
router.put('/:id',  authMiddleware, updatePiloto);
module.exports = router;
