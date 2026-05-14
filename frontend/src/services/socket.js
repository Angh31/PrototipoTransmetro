/**
 * @file services/socket.js
 * @description Cliente Socket.io para alertas en tiempo real
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket = null;

export const conectarSocket = () => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('[SOCKET] Conectado al servidor de alertas');
    socket.emit('join:dashboard');
  });

  socket.on('disconnect', () => {
    console.warn('[SOCKET] Desconectado del servidor');
  });

  return socket;
};

export const desconectarSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
