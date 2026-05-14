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

// Manejo global de errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Evitar bucle: no redirigir si ya estamos en una ruta de auth
    const isAuthRoute = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('transmetro_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
