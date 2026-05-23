/**
 * @file routes/reportes.routes.js
 * @description Reportes y estadísticas — admin y supervisor
 * @author Anghel CC
 */
const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { getReportes } = require('../controllers/reportes.controller');

const router = Router();
router.get('/', authMiddleware, requireRole('admin', 'supervisor'), getReportes);
module.exports = router;
