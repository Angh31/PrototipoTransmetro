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

// Manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes('/auth/');
    const status      = error.response?.status;
    const msg         = error.response?.data?.message;

    if (status === 401 && !isAuthRoute) {
      // Sesión expirada → fuera al login
      localStorage.removeItem('transmetro_token');
      window.location.href = '/login';
    } else if (status === 403) {
      // Sin permisos → toast claro al usuario
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: {
          message: msg || 'No tienes permisos para realizar esta acción',
          kind:    'error',
        },
      }));
    }
    return Promise.reject(error);
  }
);

export default api;
