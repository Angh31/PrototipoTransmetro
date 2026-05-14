/**
 * @file middleware/errorHandler.js
 * @description Manejador global de errores
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);

  // Error de validación de PostgreSQL
  if (err.code === '23503') {
    return res.status(400).json({ ok: false, message: 'Referencia a un registro inexistente' });
  }
  if (err.code === '23505') {
    return res.status(409).json({ ok: false, message: 'Registro duplicado' });
  }
  if (err.code === '23514') {
    return res.status(400).json({ ok: false, message: 'Dato fuera del rango permitido por las reglas de negocio' });
  }
  if (err.code === 'P0001') {
    // Error lanzado por triggers de PostgreSQL
    return res.status(400).json({ ok: false, message: err.message });
  }

  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    ok: false,
    message: err.message || 'Error interno del servidor',
  });
};

module.exports = { errorHandler };
