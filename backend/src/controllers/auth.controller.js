/**
 * @file controllers/auth.controller.js
 * @description Autenticación JWT — login y perfil
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { generateToken } = require('../middleware/auth');

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ ok: false, message: 'Usuario y contraseña requeridos' });

    const { rows } = await pool.query(
      `SELECT u.id_usuario, u.username, u.password_hash, u.rol, u.activo,
              o.nombres, o.apellidos
       FROM usuarios u
       LEFT JOIN operadores o ON o.id_operador = u.id_operador
       WHERE u.username = $1`,
      [username]
    );

    if (!rows.length) {
      console.warn(`[AUTH] Intento de login fallido — usuario no existe: "${username}"`);
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas' });
    }

    const user = rows[0];

    if (!user.activo)
      return res.status(403).json({ ok: false, message: 'Usuario inactivo' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.warn(`[AUTH] Contraseña incorrecta para usuario: "${username}"`);
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas' });
    }

    const token = generateToken({
      id:       user.id_usuario,
      username: user.username,
      rol:      user.rol,
    });

    console.log(`[AUTH] Login exitoso — ${user.username} (${user.rol})`);

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

module.exports = { login, me };
