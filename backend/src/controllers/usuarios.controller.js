/**
 * @file controllers/usuarios.controller.js
 * @description Gestión de cuentas de acceso al sistema (solo admin)
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { validarPassword } = require('../utils/password');
const { registrarAuditoria } = require('../utils/auditoria');

// GET /api/usuarios
const getUsuarios = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id_usuario, u.username, u.rol, u.activo, u.created_at,
             u.bloqueado_hasta,
             o.nombres, o.apellidos
      FROM usuarios u
      LEFT JOIN operadores o ON o.id_operador = u.id_operador
      ORDER BY u.username
    `);
    res.json({ ok: true, data: rows });
  } catch (err) { next(err); }
};

// POST /api/usuarios
const crearUsuario = async (req, res, next) => {
  try {
    const { username, password, rol } = req.body;
    if (!username || !password || !rol)
      return res.status(400).json({ ok: false, message: 'username, password y rol son requeridos' });
    const pol = validarPassword(password);
    if (!pol.ok)
      return res.status(400).json({ ok: false, message: pol.message });
    if (!['admin', 'supervisor', 'operador'].includes(rol))
      return res.status(400).json({ ok: false, message: 'Rol inválido' });

    const hash = bcrypt.hashSync(password, 10);
    const { rows } = await pool.query(`
      INSERT INTO usuarios (username, password_hash, rol)
      VALUES ($1, $2, $3)
      RETURNING id_usuario, username, rol, activo, created_at
    `, [username, hash, rol]);

    await registrarAuditoria(req.user.username, 'USUARIO_CREADO', `Creó la cuenta "${username}" con rol ${rol}`);
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/usuarios/:id  (rol y estado activo)
const actualizarUsuario = async (req, res, next) => {
  try {
    const { rol, activo } = req.body;
    const id = parseInt(req.params.id);
    if (rol && !['admin', 'supervisor', 'operador'].includes(rol))
      return res.status(400).json({ ok: false, message: 'Rol inválido' });

    // Estado actual del usuario objetivo
    const actual = await pool.query('SELECT id_usuario, rol, activo FROM usuarios WHERE id_usuario = $1', [id]);
    if (!actual.rows.length)
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    const u = actual.rows[0];

    // ── Salvaguarda: el sistema nunca puede quedar sin administrador ──────────
    const desactivando = activo === false && u.activo === true;
    const degradando   = rol && rol !== 'admin' && u.rol === 'admin';
    if (u.rol === 'admin' && (desactivando || degradando)) {
      // 1) Un admin no puede desactivar/degradar su propia cuenta
      if (id === req.user.id) {
        return res.status(409).json({ ok: false, message: 'No puedes desactivar ni cambiar el rol de tu propia cuenta de administrador.' });
      }
      // 2) Siempre debe quedar al menos un admin activo
      const { rows: cnt } = await pool.query("SELECT COUNT(*) AS n FROM usuarios WHERE rol = 'admin' AND activo = TRUE");
      if (parseInt(cnt[0].n) <= 1) {
        return res.status(409).json({ ok: false, message: 'Debe existir al menos un administrador activo en el sistema. Asigná el rol admin a otra cuenta antes de hacer este cambio.' });
      }
    }

    const { rows } = await pool.query(`
      UPDATE usuarios SET
        rol    = COALESCE($1, rol),
        activo = COALESCE($2, activo)
      WHERE id_usuario = $3
      RETURNING id_usuario, username, rol, activo, created_at
    `, [rol || null, activo, id]);

    const cambios = [];
    if (rol) cambios.push(`rol→${rol}`);
    if (activo !== undefined) cambios.push(activo ? 'reactivado' : 'desactivado');
    await registrarAuditoria(req.user.username, 'USUARIO_ACTUALIZADO', `Cuenta "${rows[0].username}": ${cambios.join(', ')}`);

    res.json({ ok: true, data: rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/usuarios/:id/password  (restablecer contraseña)
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const pol = validarPassword(password);
    if (!pol.ok)
      return res.status(400).json({ ok: false, message: pol.message });

    const hash = bcrypt.hashSync(password, 10);
    const { rows } = await pool.query(`
      UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2
      RETURNING id_usuario, username
    `, [hash, req.params.id]);

    if (!rows.length)
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });

    // Restablecer contraseña también desbloquea la cuenta
    await pool.query('UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id_usuario = $1', [req.params.id]);
    await registrarAuditoria(req.user.username, 'PASSWORD_RESET', `Restableció la contraseña de "${rows[0].username}"`);

    res.json({ ok: true, message: `Contraseña restablecida para ${rows[0].username}`, data: rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/usuarios/:id/desbloquear  (quitar bloqueo por intentos fallidos)
const desbloquearUsuario = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL
      WHERE id_usuario = $1
      RETURNING id_usuario, username
    `, [req.params.id]);

    if (!rows.length)
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });

    await registrarAuditoria(req.user.username, 'CUENTA_DESBLOQUEADA', `Desbloqueó la cuenta "${rows[0].username}"`);
    res.json({ ok: true, message: `Cuenta "${rows[0].username}" desbloqueada`, data: rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getUsuarios, crearUsuario, actualizarUsuario, resetPassword, desbloquearUsuario };
