/**
 * @file routes/usuarios.routes.js
 * @description Gestión de accesos — restringido a rol admin
 * @author Anghel CC
 */
const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { getUsuarios, crearUsuario, actualizarUsuario, resetPassword, desbloquearUsuario } = require('../controllers/usuarios.controller');

const router = Router();

router.get('/',                authMiddleware, requireRole('admin'), getUsuarios);
router.post('/',               authMiddleware, requireRole('admin'), crearUsuario);
router.put('/:id',             authMiddleware, requireRole('admin'), actualizarUsuario);
router.put('/:id/password',    authMiddleware, requireRole('admin'), resetPassword);
router.put('/:id/desbloquear', authMiddleware, requireRole('admin'), desbloquearUsuario);

module.exports = router;
