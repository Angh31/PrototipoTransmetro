const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getParqueos, getParqueoById } = require('../controllers/parqueos.controller');
const router = Router();
router.get('/',    authMiddleware, getParqueos);
router.get('/:id', authMiddleware, getParqueoById);
module.exports = router;
