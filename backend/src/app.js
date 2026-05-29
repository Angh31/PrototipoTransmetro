/**
 * @file app.js
 * @description Punto de entrada — Express + Socket.io
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

require('dotenv').config();

const express    = require('express');
const http       = require('http');
const path       = require('path');
const cors       = require('cors');
const helmet     = require('helmet');
const { Server } = require('socket.io');

const { testConnection }           = require('./config/db');
const { inicializarBD }            = require('./config/init');
const { errorHandler }             = require('./middleware/errorHandler');
const apiRoutes                    = require('./routes/index');
const { registrarSocketsAlertas }  = require('./sockets/alertas.socket');

const ENPRODUCCION = process.env.NODE_ENV === 'production';

// ─── App y servidor HTTP ──────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Inyectar io en las rutas para poder emitir desde controladores
app.set('io', io);

// ─── Middlewares globales ─────────────────────────────────────────────────────
// CSP desactivado para no bloquear el frontend (fuentes, tiles del mapa, estilos inline)
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rutas API ──────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

if (ENPRODUCCION) {
  // En producción, el backend sirve el frontend compilado (un solo servicio)
  const publicDir = path.join(__dirname, '..', 'public');
  app.use(express.static(publicDir));
  // SPA fallback: cualquier ruta que no sea /api devuelve index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(publicDir, 'index.html'));
  });
} else {
  // En desarrollo, la raíz muestra info de la API
  app.get('/', (req, res) => {
    res.json({
      sistema: 'PrototipoTransmetro',
      descripcion: 'Sistema de Control Integral — Transmetro Guatemala',
      autor: 'Anghel CC',
      version: '1.0.0',
      api: '/api',
      health: '/api/health',
    });
  });
}

// ─── Manejador de errores (siempre al final) ──────────────────────────────────
app.use(errorHandler);

// ─── Sockets ──────────────────────────────────────────────────────────────────
registrarSocketsAlertas(io);

// ─── Inicio ───────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3000');

const startServer = async () => {
  await testConnection();
  await inicializarBD(); // crea esquema + datos en el primer arranque (idempotente: se omite si la BD ya está lista)

  server.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════════╗');
    console.log('  ║       PrototipoTransmetro — Backend API           ║');
    console.log('  ║       Sistema de Control Integral Transmetro      ║');
    console.log('  ║       @author Anghel CC                           ║');
    console.log('  ╚══════════════════════════════════════════════════╝');
    console.log(`  API      → http://localhost:${PORT}/api`);
    console.log(`  Health   → http://localhost:${PORT}/api/health`);
    console.log(`  Socket   → ws://localhost:${PORT}`);
    console.log('');
  });
};

startServer();

module.exports = { app, io };
