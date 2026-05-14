const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getDashboard } = require('../controllers/dashboard.controller');
const router = Router();
router.get('/', authMiddleware, getDashboard);
module.exports = router;
