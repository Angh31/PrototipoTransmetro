/**
 * @file routes/auth.routes.js
 * @author Anghel CC
 */
const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { login, me } = require('../controllers/auth.controller');
const router = Router();
router.post('/login', login);
router.get('/me', authMiddleware, me);
module.exports = router;
