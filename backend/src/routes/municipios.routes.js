const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getMunicipios, getMunicipioById } = require('../controllers/municipios.controller');
const router = Router();
router.get('/',    authMiddleware, getMunicipios);
router.get('/:id', authMiddleware, getMunicipioById);
module.exports = router;
