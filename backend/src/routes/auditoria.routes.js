/**
 * @file routes/auditoria.routes.js
 * @description Bitácora de auditoría — solo admin
 * @author Anghel CC
 */
const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { getAuditoria } = require('../controllers/auditoria.controller');

const router = Router();
router.get('/', authMiddleware, requireRole('admin'), getAuditoria);
module.exports = router;
