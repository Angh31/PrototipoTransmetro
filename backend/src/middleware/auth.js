/**
 * @file middleware/auth.js
 * @description Middleware de autenticación JWT
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'transmetro_jwt_secret_2026_anghel';

/**
 * Verifica el token JWT en el header Authorization
 * Uso: router.get('/ruta', authMiddleware, controller)
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      message: 'Token de acceso requerido',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ ok: false, message: 'Token expirado' });
    }
    return res.status(401).json({ ok: false, message: 'Token inválido' });
  }
};

/**
 * Genera un JWT para un usuario autenticado
 * @param {object} payload - Datos a incluir en el token
 * @returns {string} Token firmado
 */
const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
};

module.exports = { authMiddleware, generateToken };
