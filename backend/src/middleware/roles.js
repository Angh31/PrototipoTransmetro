/**
 * @file middleware/roles.js
 * @description Middleware de autorización por rol
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const requireRole = (...rolesPermitidos) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: 'No autenticado' });
  }
  if (!rolesPermitidos.includes(req.user.rol)) {
    return res.status(403).json({ ok: false, message: 'No tienes permisos para realizar esta acción' });
  }
  next();
};

module.exports = { requireRole };
