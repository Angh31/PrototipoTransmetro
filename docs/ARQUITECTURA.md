# Arquitectura del Sistema — PrototipoTransmetro

> Sistema de Control Integral en Tiempo Real para la Red de Transmetro
> Municipalidad de Guatemala · 2026 · **@author Anghel CC**

---

## 1. Visión general

El sistema centraliza la operación de la red Transmetro: gestión de líneas, estaciones, flota, personal, alertas en tiempo real y un panel de control. Resuelve las *islas de información* entre estaciones, automatizando el control de capacidad y la trazabilidad de la operación.

Arquitectura de tres capas desacopladas, comunicadas por una API REST y eventos en tiempo real:

```
   Navegador (React SPA)
        │  HTTPS / WebSocket
        ▼
   Backend (Node.js + Express + Socket.io)
        │  SQL (pg)
        ▼
   Base de datos (PostgreSQL 16)
```

---

## 2. Stack tecnológico

| Capa            | Tecnología                                   |
| --------------- | -------------------------------------------- |
| Frontend        | React 18 + Vite 5, React Router 6, Recharts, Leaflet/react-leaflet, Axios, Socket.io-client |
| Backend         | Node.js 20 + Express 4, Socket.io 4          |
| Base de datos   | PostgreSQL 16                                |
| Autenticación   | JWT + bcrypt                                 |
| Seguridad HTTP  | Helmet, CORS                                 |
| Contenedores    | Docker + docker-compose                      |
| Despliegue      | Render.com (Blueprint `render.yaml`)         |

Todo el stack es **open source**, sin costos de licenciamiento.

---

## 3. Estructura de carpetas

```
PrototipoTransmetro/
├── Dockerfile                # Imagen de producción (backend sirve el frontend)
├── docker-compose.yml        # Entorno de desarrollo local
├── render.yaml               # Blueprint de despliegue en Render
├── README.md
├── docs/                     # Documentación del proyecto
├── backend/
│   └── src/
│       ├── app.js            # Punto de entrada (Express + Socket.io)
│       ├── config/           # db.js (pool), init.js (auto-inicialización)
│       ├── middleware/       # auth (JWT), roles (autorización), errorHandler
│       ├── controllers/      # Lógica de cada recurso
│       ├── routes/           # Definición de endpoints REST
│       ├── sockets/          # Eventos Socket.io (alertas en tiempo real)
│       └── utils/            # password (política), auditoria (bitácora)
├── frontend/
│   └── src/
│       ├── context/          # AuthContext (sesión JWT)
│       ├── services/         # api.js (Axios), socket.js
│       ├── components/       # layout/, ui/ (componentes reutilizables), map/
│       └── pages/            # Vistas: Login, Dashboard, Operación, Líneas,
│                             #   Estaciones, Flota, Pilotos, Alertas, Reportes,
│                             #   Usuarios, Auditoría, Público
└── database/
    ├── migrations/           # Esquema PostgreSQL (8 archivos)
    └── seeds/                # Datos reales + datos de ejemplo
```

---

## 4. Modelo de datos

Entidades principales y relaciones:

- **municipios** — a los que pertenecen líneas y estaciones.
- **lineas** — cada una pertenece a un municipio; tiene distancia y estado.
- **estaciones** — capacidad máxima, municipio y coordenadas (lat/lng).
- **linea_estacion** — relación N:M con orden de visita y distancia entre paradas.
- **accesos** — entradas de cada estación.
- **parqueos** — con o sin carga eléctrica (para buses BYD).
- **buses** — placa, marca, modelo, tipo (eléctrico/combustión), capacidad, línea y parqueo (obligatorio).
- **pilotos** — datos personales, historial educativo y línea asignada.
- **guardias** + **guardia_acceso** — asignación por acceso y turno.
- **operadores** — personal de estación.
- **usuarios** — cuentas de acceso (rol, estado, control de bloqueo por intentos).
- **alertas** — tipo, nivel, mensaje, estación/bus, estado de resolución.
- **auditoria** — bitácora de acciones (quién, qué, cuándo).

---

## 5. Reglas de negocio (en la base de datos)

Implementadas como **triggers PL/pgSQL** para garantizar integridad independientemente de la aplicación:

| # | Regla | Mecanismo |
|---|-------|-----------|
| 1 | Todo bus debe tener un parqueo asignado | `NOT NULL` + trigger |
| 2 | Buses eléctricos (BYD) solo en parqueos con carga eléctrica | trigger |
| 3 | Flota por línea: de 1 a 2 buses por estación | trigger |
| 4 | Todo acceso debe conservar al menos un guardia activo | trigger |
| 5 | Alerta automática al 50% de capacidad de estación (REQ-0005) | lógica + Socket.io |
| 6 | Espera de 5 min si el bus va con < 25% de carga (REQ-0006) | lógica + Socket.io |
| 7 | Jerarquía: la saturación (REQ-0005) anula la espera (REQ-0006) | lógica en backend |

---

## 6. API REST (resumen)

Base: `/api`. Todas las rutas (salvo `/auth/login` y `/publico/*`) requieren JWT.

| Módulo      | Endpoints principales |
|-------------|-----------------------|
| auth        | `POST /auth/login`, `GET /auth/me`, `PUT /auth/password` |
| dashboard   | `GET /dashboard` |
| lineas      | `GET/POST/PUT /lineas[/:id]` |
| estaciones  | `GET/POST/PUT /estaciones[/:id]`, `POST /estaciones/:id/alerta-capacidad` |
| buses       | `GET/POST /buses`, `PUT /buses/:id/{parqueo,linea}` |
| pilotos     | `GET/POST/PUT /pilotos[/:id]` |
| alertas     | `GET /alertas[/activas]`, `PUT /alertas/:id/cerrar` |
| operacion   | `POST /operacion/registro-estacion`, `GET /operacion/ahorro-combustible` |
| municipios  | `GET /municipios` |
| parqueos    | `GET /parqueos` |
| usuarios    | `GET/POST/PUT /usuarios`, `PUT /usuarios/:id/{password,desbloquear}` |
| auditoria   | `GET /auditoria` |
| reportes    | `GET /reportes?rango=hoy|semana|mes` |
| publico     | `GET /publico/red`, `GET /publico/lineas/:id` (sin autenticación) |

---

## 7. Tiempo real (Socket.io)

El backend emite eventos a los clientes conectados:

- `alerta:capacidad` — estación al 50%.
- `alerta:espera` — bus con baja ocupación.
- `alerta:resuelta` — alerta cerrada.

El frontend (Dashboard, Centro de Alertas, vista pública) escucha estos eventos y se actualiza sin recargar la página.

---

## 8. Seguridad

- **Autenticación** con JWT (expira a las 8 h) y contraseñas con **bcrypt**.
- **Autorización por rol** (`requireRole`): admin, supervisor, operador.
- **Política de contraseña**: mínimo 8 caracteres, mayúscula, minúscula y número.
- **Bloqueo de login**: 5 intentos fallidos → bloqueo temporal de 15 min.
- **Salvaguarda de administrador**: siempre debe quedar al menos un admin activo.
- **Auditoría**: registro de acciones sensibles.
- **Cabeceras HTTP** con Helmet.

---

## 9. Despliegue

- **Local**: `docker compose up -d --build` + migraciones + seed (ver `docs/DESPLIEGUE.md`).
- **Producción**: un solo servicio (el backend sirve el frontend compilado). En la nube (Render) la base se inicializa sola en el primer arranque mediante `backend/src/config/init.js`.

Detalle completo en [DESPLIEGUE.md](DESPLIEGUE.md).

---

*Sistema de Control Integral Transmetro · Municipalidad de Guatemala · 2026 · @author Anghel CC*
