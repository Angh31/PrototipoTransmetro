/**
 * @file utils/password.js
 * @description Política de contraseñas seguras del sistema
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 *
 * Requisitos: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.
 * (Un símbolo es recomendado pero no obligatorio.)
 */
const validarPassword = (pwd) => {
  if (!pwd || pwd.length < 8)
    return { ok: false, message: 'La contraseña debe tener al menos 8 caracteres.' };
  if (!/[A-Z]/.test(pwd))
    return { ok: false, message: 'La contraseña debe incluir al menos una letra mayúscula.' };
  if (!/[a-z]/.test(pwd))
    return { ok: false, message: 'La contraseña debe incluir al menos una letra minúscula.' };
  if (!/[0-9]/.test(pwd))
    return { ok: false, message: 'La contraseña debe incluir al menos un número.' };
  return { ok: true };
};

module.exports = { validarPassword };
