/**
 * @file routes/auth.routes.js
 * @author Anghel CC
 */
const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { login, me, cambiarMiPassword } = require('../controllers/auth.controller');
const router = Router();
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.put('/password', authMiddleware, cambiarMiPassword);
module.exports = router;
