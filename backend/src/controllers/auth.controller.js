/**
 * @file controllers/auth.controller.js
 * @description Autenticación JWT — login y perfil
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { generateToken } = require('../middleware/auth');
const { validarPassword } = require('../utils/password');
const { registrarAuditoria } = require('../utils/auditoria');

const MAX_INTENTOS = 5;   // intentos fallidos antes del bloqueo
const BLOQUEO_MIN  = 15;  // minutos de bloqueo temporal

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ ok: false, message: 'Usuario y contraseña requeridos' });

    const { rows } = await pool.query(
      `SELECT u.id_usuario, u.username, u.password_hash, u.rol, u.activo,
              u.intentos_fallidos, u.bloqueado_hasta,
              o.nombres, o.apellidos
       FROM usuarios u
       LEFT JOIN operadores o ON o.id_operador = u.id_operador
       WHERE u.username = $1`,
      [username]
    );

    if (!rows.length) {
      await registrarAuditoria(username, 'LOGIN_FALLIDO', 'Usuario inexistente');
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas' });
    }

    const user = rows[0];

    if (!user.activo)
      return res.status(403).json({ ok: false, message: 'Usuario inactivo. Contactá a un administrador.' });

    // ── Bloqueo temporal por intentos fallidos ────────────────────────────────
    if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
      const min = Math.ceil((new Date(user.bloqueado_hasta) - new Date()) / 60000);
      return res.status(429).json({ ok: false, message: `Cuenta bloqueada por seguridad. Intentá de nuevo en ${min} min o pedí a un administrador que la desbloquee.` });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      const intentos = user.intentos_fallidos + 1;
      if (intentos >= MAX_INTENTOS) {
        const hasta = new Date(Date.now() + BLOQUEO_MIN * 60000);
        await pool.query('UPDATE usuarios SET intentos_fallidos = $1, bloqueado_hasta = $2 WHERE id_usuario = $3', [intentos, hasta, user.id_usuario]);
        await registrarAuditoria(username, 'CUENTA_BLOQUEADA', `Bloqueo automático tras ${intentos} intentos fallidos`);
        return res.status(429).json({ ok: false, message: `Cuenta bloqueada por ${BLOQUEO_MIN} minutos tras ${MAX_INTENTOS} intentos fallidos.` });
      }
      await pool.query('UPDATE usuarios SET intentos_fallidos = $1 WHERE id_usuario = $2', [intentos, user.id_usuario]);
      const restantes = MAX_INTENTOS - intentos;
      return res.status(401).json({ ok: false, message: `Credenciales incorrectas. Te queda(n) ${restantes} intento(s) antes del bloqueo.` });
    }

    // ── Éxito → reiniciar contador de intentos ────────────────────────────────
    await pool.query('UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id_usuario = $1', [user.id_usuario]);

    const token = generateToken({
      id:       user.id_usuario,
      username: user.username,
      rol:      user.rol,
    });

    await registrarAuditoria(user.username, 'LOGIN_EXITOSO', `Rol: ${user.rol}`);

    res.json({
      ok: true,
      token,
      user: {
        id:       user.id_usuario,
        username: user.username,
        rol:      user.rol,
        nombre:   user.nombres ? `${user.nombres} ${user.apellidos}` : user.username,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const me = (req, res) => {
  res.json({ ok: true, user: req.user });
};

// PUT /api/auth/password — el usuario cambia su propia contraseña
const cambiarMiPassword = async (req, res, next) => {
  try {
    const { actual, nueva } = req.body;
    if (!actual || !nueva)
      return res.status(400).json({ ok: false, message: 'Contraseña actual y nueva son requeridas' });
    const pol = validarPassword(nueva);
    if (!pol.ok)
      return res.status(400).json({ ok: false, message: pol.message });

    const { rows } = await pool.query('SELECT password_hash FROM usuarios WHERE id_usuario = $1', [req.user.id]);
    if (!rows.length)
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });

    const valido = await bcrypt.compare(actual, rows[0].password_hash);
    if (!valido)
      return res.status(401).json({ ok: false, message: 'La contraseña actual es incorrecta' });

    const hash = bcrypt.hashSync(nueva, 10);
    await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2', [hash, req.user.id]);
    await registrarAuditoria(req.user.username, 'PASSWORD_CAMBIO_PROPIO', 'El usuario cambió su propia contraseña');
    res.json({ ok: true, message: 'Contraseña actualizada correctamente' });
  } catch (err) { next(err); }
};

module.exports = { login, me, cambiarMiPassword };
