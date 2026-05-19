/**
 * @file routes/publico.routes.js
 * @description Rutas públicas — sin autenticación
 * @author Anghel CC
 */
const { Router } = require('express');
const { getRedPublica, getLineaPublica } = require('../controllers/publico.controller');

const router = Router();

router.get('/red',         getRedPublica);
router.get('/lineas/:id',  getLineaPublica);

module.exports = router;
