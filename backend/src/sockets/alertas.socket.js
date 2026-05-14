/**
 * @file sockets/alertas.socket.js
 * @description Manejador de eventos Socket.io para alertas en tiempo real
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 *
 * Eventos emitidos:
 *   alerta:capacidad  → cuando estación supera el 50% de capacidad
 *   alerta:espera     → cuando bus no llena el 25% de capacidad
 *   alerta:resuelta   → cuando una alerta es cerrada
 */

/**
 * @param {import('socket.io').Server} io
 */
const registrarSocketsAlertas = (io) => {
  io.on('connection', (socket) => {
    console.log(`[SOCKET] Cliente conectado: ${socket.id}`);

    // El cliente se suscribe al monitoreo de una estación específica
    socket.on('join:estacion', (estacionId) => {
      socket.join(`estacion:${estacionId}`);
      console.log(`[SOCKET] ${socket.id} → sala estacion:${estacionId}`);
    });

    // El cliente se suscribe al monitoreo de una línea
    socket.on('join:linea', (lineaId) => {
      socket.join(`linea:${lineaId}`);
      console.log(`[SOCKET] ${socket.id} → sala linea:${lineaId}`);
    });

    // Dashboard central: recibe todas las alertas
    socket.on('join:dashboard', () => {
      socket.join('dashboard');
      console.log(`[SOCKET] ${socket.id} → sala dashboard`);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Cliente desconectado: ${socket.id}`);
    });
  });
};

/**
 * Emite alerta de capacidad al 50%
 * @param {import('socket.io').Server} io
 * @param {object} data - { estacionId, nombre, ocupacion, capacidadMax }
 */
const emitirAlertaCapacidad = (io, data) => {
  const payload = {
    tipo: 'capacidad',
    nivel: 'alta',
    mensaje: `Estación ${data.nombre} al ${Math.round((data.ocupacion / data.capacidadMax) * 100)}% de capacidad — enviar bus adicional`,
    ...data,
    timestamp: new Date().toISOString(),
  };
  io.to('dashboard').emit('alerta:capacidad', payload);
  io.to(`estacion:${data.estacionId}`).emit('alerta:capacidad', payload);
};

/**
 * Emite alerta de bus con baja ocupación (< 25%)
 * @param {import('socket.io').Server} io
 * @param {object} data - { busId, placa, estacionId, ocupacion, capacidadMax }
 */
const emitirAlertaEspera = (io, data) => {
  const payload = {
    tipo: 'espera',
    nivel: 'media',
    mensaje: `Bus ${data.placa} con ${Math.round((data.ocupacion / data.capacidadMax) * 100)}% de ocupación — esperar 5 minutos adicionales`,
    ...data,
    timestamp: new Date().toISOString(),
  };
  io.to('dashboard').emit('alerta:espera', payload);
  io.to(`linea:${data.lineaId}`).emit('alerta:espera', payload);
};

module.exports = { registrarSocketsAlertas, emitirAlertaCapacidad, emitirAlertaEspera };
