/**
 * @file utils/auditoria.js
 * @description Registro de auditoría — guarda quién hizo qué y cuándo
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const { pool } = require('../config/db');

/**
 * Registra una acción en la bitácora de auditoría.
 * Nunca lanza error hacia el flujo principal (la auditoría no debe romper la operación).
 */
const registrarAuditoria = async (usuario, accion, detalle = null) => {
  try {
    await pool.query(
      'INSERT INTO auditoria (usuario, accion, detalle) VALUES ($1, $2, $3)',
      [usuario || 'sistema', accion, detalle]
    );
  } catch (e) {
    console.error('[AUDIT] No se pudo registrar la acción:', e.message);
  }
};

module.exports = { registrarAuditoria };
