/**
 * @file app.js
 * @description Punto de entrada — Express + Socket.io
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

require('dotenv').config();

const express    = require('express');
const http       = require('http');
const cors       = require('cors');
const helmet     = require('helmet');
const { Server } = require('socket.io');

const { testConnection }           = require('./config/db');
const { errorHandler }             = require('./middleware/errorHandler');
const apiRoutes                    = require('./routes/index');
const { registrarSocketsAlertas }  = require('./sockets/alertas.socket');

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
app.use(helmet({ crossOriginResourcePolicy: false })); // cabeceras de seguridad HTTP
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// Ruta raíz
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

// ─── Manejador de errores (siempre al final) ──────────────────────────────────
app.use(errorHandler);

// ─── Sockets ──────────────────────────────────────────────────────────────────
registrarSocketsAlertas(io);

// ─── Inicio ───────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3000');

const startServer = async () => {
  await testConnection();

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
