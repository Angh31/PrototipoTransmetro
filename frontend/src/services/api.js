/**
 * @file services/api.js
 * @description Cliente HTTP centralizado con Axios + manejo de JWT
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Adjuntar token JWT en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('transmetro_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manejo global de errores con notificaciones internas (toast)
const toast = (message, kind = 'error') =>
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, kind } }));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url    = error.config?.url || '';
    const status = error.response?.status;
    const msg    = error.response?.data?.message;

    // Estas rutas manejan el error en su propia UI (mensaje inline / panel de resolución)
    const manejaErrorPropio = url.includes('/auth/login') || url.includes('/operacion/registro-estacion');

    if (status === 401 && !url.includes('/auth/')) {
      // Sesión expirada → fuera al login
      localStorage.removeItem('transmetro_token');
      window.location.href = '/login';
    } else if (!manejaErrorPropio) {
      if ([400, 403, 409].includes(status)) {
        toast(msg || 'No se pudo completar la acción', 'error');
      } else if (!error.response) {
        toast('Error de conexión con el servidor', 'error');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
