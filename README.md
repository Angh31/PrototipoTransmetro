# PrototipoTransmetro

> Sistema de Control Integral en Tiempo Real para la Red de Transmetro
> Municipalidad de Guatemala · Dirección de Movilidad Urbana

**@author** Anghel CC
**Año** 2026

---

## Contexto del proyecto

El Sistema de Control Integral Transmetro es una plataforma web centralizada para la gestión y monitoreo en tiempo real de la red de transporte público Transmetro de la Ciudad de Guatemala. Resuelve la falta de conectividad entre las estaciones (las actuales *islas de información*) y automatiza el control de capacidad, alertas, flota, pilotos y personal de seguridad.

Cubre 10 rutas activas, ~100 estaciones, ~33 buses (incluyendo la flota eléctrica BYD de la Línea 5), gestión de personal, alertas en tiempo real y un dashboard centralizado.

---

## Documentación

| Documento | Descripción |
| --------- | ----------- |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Arquitectura técnica: stack, modelo de datos, reglas de negocio, API, seguridad |
| [docs/MANUAL_DE_USUARIO.md](docs/MANUAL_DE_USUARIO.md) | Guía de uso por rol y por módulo |
| [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md) | Despliegue local (Docker) y en producción (Render) |
| docs/Plan_de_Pruebas_Transmetro.docx | Plan y casos de prueba del prototipo |

---

## Stack tecnológico

| Capa              | Tecnología                                |
| ----------------- | ----------------------------------------- |
| Backend API       | Node.js 20 LTS + Express 4                |
| Base de datos     | PostgreSQL 16                             |
| Frontend          | React 18 + Vite 5                         |
| Tiempo real       | Socket.io 4                               |
| Autenticación     | JWT + bcrypt                              |
| Contenedores      | Docker + docker-compose                   |
| Visualización     | Recharts                                  |
| Cliente HTTP      | Axios                                     |
| Ruteo SPA         | React Router v6                           |

Todo el stack es **open source**, sin licencias propietarias.

---

## Estructura del proyecto

```
PrototipoTransmetro/
├── backend/                  # API REST + Socket.io
│   ├── Dockerfile
│   ├── nodemon.json
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── app.js            # Bootstrap Express + Socket.io
│       ├── config/db.js      # Pool PostgreSQL
│       ├── middleware/       # auth (JWT), roles, errorHandler
│       ├── routes/           # 11 módulos REST
│       ├── controllers/      # Lógica de cada recurso
│       └── sockets/          # Emisión de alertas en tiempo real
│
├── frontend/                 # Dashboard React (Vite)
│   ├── Dockerfile
│   ├── vite.config.js
│   ├── package.json
│   ├── public/
│   │   └── logo-transmetro.png
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css         # Design system "Centro de Mando"
│       ├── context/          # AuthContext (JWT)
│       ├── services/         # api.js (axios), socket.js
│       ├── components/
│       │   ├── layout/Layout.jsx     # Sidebar + topbar
│       │   └── ui/index.jsx          # PageHeader, StatCard, Btn, Toast, ...
│       └── pages/            # Login, Dashboard, Operación, Líneas,
│                             # Estaciones, Flota, Pilotos, Alertas, Público
│
├── database/
│   ├── migrations/           # 6 archivos SQL (esquema + triggers + índices)
│   └── seeds/                # Datos reales de Transmetro Guatemala
│
├── diagramaUML/              # Diagramas PlantUML de soporte
└── docker-compose.yml        # Orquestación de los 3 servicios
```

---

## Requisitos previos

| Herramienta      | Versión mínima |
| ---------------- | -------------- |
| Docker Desktop   | 24.x           |
| Git              | 2.40+          |
| Navegador web    | Chrome / Edge / Firefox actualizado |

No requiere instalar Node.js ni PostgreSQL localmente — todo corre en contenedores.

---

## Levantamiento rápido (Windows / PowerShell)

```powershell
# 1. Clonar el repositorio
git clone https://github.com/Angh31/PrototipoTransmetro.git
cd PrototipoTransmetro

# 2. Copiar variables de entorno del backend
copy backend\.env.example backend\.env

# 3. Construir y levantar los 3 servicios (db, backend, frontend)
docker compose up -d --build

# 4. Esperar a que PostgreSQL esté listo (~10 s) y cargar el esquema + datos
Start-Sleep -Seconds 8
foreach ($f in @("001_schema_base","002_schema_operacional","003_schema_personal","004_triggers","005_indexes","006_fix_trigger_flota")) {
  cmd /c "docker exec -i transmetro_db psql -U transmetro_user -d transmetro_db < database/migrations/$f.sql"
}
cmd /c "docker exec -i transmetro_db psql -U transmetro_user -d transmetro_db < database/seeds/seed_transmetro.sql"
```

> En Linux / macOS reemplazá `cmd /c "... < archivo.sql"` por la redirección directa del shell.

---

## Servicios y URLs

| Servicio          | URL                                    |
| ----------------- | -------------------------------------- |
| Frontend          | http://localhost:5173                  |
| Vista pública     | http://localhost:5173/publico          |
| Backend API       | http://localhost:3000/api              |
| Health-check API  | http://localhost:3000/api/health       |
| PostgreSQL        | `localhost:5432` (user `transmetro_user`) |

---

## Usuarios de prueba

Las credenciales de acceso se entregan por separado al evaluador (no se publican en el repositorio por seguridad). El sistema incluye tres tipos de cuenta:

| Rol         | Acceso                                                              |
| ----------- | ------------------------------------------------------------------ |
| Administrador | Total — todos los módulos, incluidos Usuarios y Auditoría        |
| Supervisor  | Operación, Flota, Pilotos, Líneas y Reportes                       |
| Operador    | Dashboard, Operación, Estaciones, Alertas, Cámaras y Tarjeta       |

Los nombres de usuario siguen la convención `nombre.apellido` (sin tildes). La vista `/publico` no requiere autenticación.

---

## Módulos del sistema

| Módulo            | Endpoints                                                              |
| ----------------- | ---------------------------------------------------------------------- |
| Autenticación     | `POST /api/auth/login` · `GET /api/auth/me`                            |
| Dashboard         | `GET /api/dashboard` (métricas en tiempo real)                         |
| Líneas            | CRUD: `GET / POST / PUT /api/lineas[/:id]`                             |
| Estaciones        | CRUD: `GET / POST / PUT /api/estaciones[/:id]` + alerta de capacidad   |
| Flota (buses)     | CRUD: `GET / POST /api/buses` · `PUT /api/buses/:id/{parqueo, linea}`  |
| Pilotos           | CRUD: `GET / POST / PUT /api/pilotos[/:id]` (acceso restringido)       |
| Alertas           | `GET /api/alertas[/activas]` · `PUT /api/alertas/:id/cerrar`           |
| Operación         | `POST /api/operacion/registro-estacion` · `GET /api/operacion/ahorro-combustible` |
| Municipios        | `GET /api/municipios`                                                  |
| Parqueos          | `GET /api/parqueos`                                                    |
| Público           | `GET /api/publico/red` · `GET /api/publico/lineas/:id` (sin auth)      |

---

## Reglas de negocio (enforced en PostgreSQL)

| # | Regla                                                                 | Mecanismo            |
| - | --------------------------------------------------------------------- | -------------------- |
| 1 | Todo bus debe tener parqueo asignado, nunca puede quedar sin él       | `NOT NULL` + trigger |
| 2 | Buses BYD (eléctricos) solo en parqueos con carga eléctrica           | Trigger PL/pgSQL     |
| 3 | Flota por línea: entre `n` y `2n` buses (donde `n` = nº estaciones)   | Trigger PL/pgSQL     |
| 4 | Todo acceso debe tener al menos un guardia activo                     | Trigger PL/pgSQL     |
| 5 | Alerta automática al alcanzar 50% de capacidad en estación            | Lógica + Socket.io   |
| 6 | Espera obligatoria de 5 min si la ocupación del bus es <25%           | Lógica + Socket.io   |
| 7 | Jerarquía REQ-0005 sobre REQ-0006 (saturación anula a eficiencia)     | Lógica en backend    |

---

## Roles y permisos (autorización)

| Acción                                | admin | supervisor | operador | piloto | guardia |
| ------------------------------------- | :---: | :--------: | :------: | :----: | :-----: |
| Ver dashboard, líneas, estaciones, flota, alertas | ✓ | ✓ | ✓ | parcial | parcial |
| Ver pilotos (datos sensibles)         |   ✓   |     ✓      |          |        |         |
| Crear / editar líneas                 |   ✓   |     ✓      |          |        |         |
| Crear / editar estaciones             |   ✓   |     ✓      |          |        |         |
| Crear / editar buses                  |   ✓   |     ✓      |          |        |         |
| Crear / editar pilotos                |   ✓   |     ✓      |          |        |         |
| Operación (registro en estación)      |   ✓   |     ✓      |     ✓    |        |         |
| Resolver alertas                      |   ✓   |     ✓      |     ✓    |        |    ✓    |
| Mi Operación (consulta de rutas / recorridos) |       |            |          |   ✓    |         |
| Control de accesos por estación       |       |            |          |        |    ✓    |

El backend valida cada permiso con `requireRole(...)`; el frontend filtra el menú lateral y muestra un toast si un acceso es rechazado por permisos.

---

## Datos reales integrados

El seed (`database/seeds/seed_transmetro.sql`) carga datos reales de la red:

- **6 municipios** del área metropolitana (Guatemala, Mixco, Villa Nueva, San Miguel Petapa, Chinautla, Amatitlán).
- **10 líneas**: L1, L2, **L5 eléctrica BYD (14 estaciones, 12 km)**, L6 Parque Colón, **L7 (24 km, 30 paradas)**, L12 Centra Sur, L13 Hangares/Plaza España, L18 Mixco, TuBus 1 y 2.
- **24 estaciones** distribuidas en zonas 1, 6, 7, 12 y municipios.
- **33 buses**: 14 BYD K9 (Línea 5), Mercedes-Benz Sprinter en el resto, más 2 unidades de reserva.
- **6 parqueos**, uno con carga eléctrica para la flota BYD.
- **6 pilotos**, **10 guardias** con asignación por turno, **6 operadores de estación**.

---

## Mantenimiento

**Reconstruir un servicio tras cambios de código:**

```powershell
docker compose up -d --build backend     # solo backend
docker compose up -d --build frontend    # solo frontend
```

**Resetear la base de datos a estado limpio:**

```powershell
docker compose down -v
docker compose up -d --build
# Volver a correr migraciones + seed (ver "Levantamiento rápido", paso 4)
```

**Hot-reload en desarrollo:**
- Frontend (Vite): habilitado mediante `server.watch.usePolling: true`.
- Backend (nodemon): habilitado mediante `nodemon.json` con `legacyWatch: true`.
- Ambos detectan cambios dentro de Docker en Windows sin necesidad de rebuild.

**Variables de entorno** (`backend/.env`): puerto, credenciales de BD, secret JWT, CORS origin. Ver `backend/.env.example`.

---

## Pruebas funcionales sugeridas

1. **Login y roles**: ingresar como administrador, ver todo. Cerrar sesión, ingresar como operador — el menú no muestra Flota ni Pilotos ni Líneas. Intentar acceder a `/pilotos` por URL: el sistema rechaza y muestra un toast.
2. **Trigger BYD**: crear un bus con la marca BYD marcando "Es eléctrico", asignarlo a un parqueo sin carga eléctrica — el sistema lo rechaza.
3. **Simulador de Operación**: registrar un evento con ocupación de estación ≥ 50% de capacidad — se genera una alerta de saturación y aparece en tiempo real en el Centro de Alertas (Socket.io).
4. **Eficiencia 25%**: registrar un bus con menos del 25% de carga — la respuesta indica espera de 5 minutos.
5. **Jerarquía REQ-0005 > REQ-0006**: registrar un bus con baja carga llegando a una estación saturada — se prioriza el despacho urgente.
6. **Vista pública**: ir a `/publico` sin login y consultar líneas, estaciones y avisos.

---

## Atribución

Todos los archivos del repositorio (código fuente, migraciones SQL, documentación, Docker) incluyen la atribución `@author Anghel CC` en su encabezado, y la tabla `sistema_metadata` registra el autor a nivel de base de datos.

---

*Sistema de Control Integral Transmetro · Municipalidad de Guatemala · 2026 · @author Anghel CC*
