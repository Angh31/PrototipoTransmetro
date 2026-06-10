# 🚌 PrototipoTransmetro

> Sistema de Control Integral en Tiempo Real para la Red de Transmetro  
> Municipalidad de Guatemala · Dirección de Movilidad Urbana · 2026

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## ¿Qué es?

Plataforma web centralizada para gestión y monitoreo en tiempo real de la red Transmetro de Ciudad de Guatemala. Resuelve las *islas de información* entre estaciones — conectando 10 rutas activas, ~100 estaciones y 33 buses (incluida la flota eléctrica BYD de la Línea 5) en un solo dashboard de control.

---

## Arquitectura

```
   Navegador (React SPA)
        │  HTTPS / WebSocket
        ▼
   Backend (Node.js + Express + Socket.io)
        │  SQL (pg)
        ▼
   Base de datos (PostgreSQL 16)
```

3 servicios orquestados con Docker Compose — reproducible con un solo comando.

---

## Stack Técnico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite 5 · React Router 6 · Recharts · Leaflet · Axios |
| Backend | Node.js 20 + Express 4 · Socket.io 4 |
| Base de datos | PostgreSQL 16 — 13 tablas + triggers PL/pgSQL |
| Autenticación | JWT + bcrypt |
| Seguridad HTTP | Helmet · CORS |
| Contenedores | Docker + Docker Compose |
| Despliegue | Render.com (Blueprint `render.yaml`) |

---

## Funcionalidades Clave

- **Dashboard en tiempo real** — métricas de flota, estaciones, alertas activas vía Socket.io
- **5 roles de usuario** — admin, supervisor, operador, piloto, guardia — con autorización por endpoint y menú filtrado
- **Reglas de negocio en PostgreSQL** — 4 triggers PL/pgSQL que garantizan integridad independiente del cliente
- **Simulador de Operación** — toma de decisiones automática (despacho urgente, espera, bloqueo) según ocupación
- **Vista pública** — accesible sin login, mapa interactivo, selector ES/EN
- **Auditoría completa** — bitácora de todas las acciones sensibles
- **Despliegue en producción** — un solo servicio en Render, base auto-inicializada

---

## Reglas de Negocio (enforced en BD)

| # | Regla | Mecanismo |
|---|---|---|
| 1 | Todo bus debe tener parqueo asignado | `NOT NULL` + trigger |
| 2 | Buses BYD solo en parqueos con carga eléctrica | Trigger PL/pgSQL |
| 3 | Flota por línea: entre 1 y 2 buses por estación | Trigger PL/pgSQL |
| 4 | Todo acceso debe tener al menos un guardia activo | Trigger PL/pgSQL |
| 5 | Alerta automática al 50% de capacidad (REQ-0005) | Lógica + Socket.io |
| 6 | Espera de 5 min si bus va con < 25% de carga (REQ-0006) | Lógica + Socket.io |
| 7 | Saturación (REQ-0005) anula espera (REQ-0006) | Lógica en backend |

---

## Levantamiento Rápido

**Requisitos:** Docker Desktop + Git. No se necesita instalar Node.js ni PostgreSQL.

```powershell
# 1. Clonar
git clone https://github.com/Angh31/PrototipoTransmetro.git
cd PrototipoTransmetro

# 2. Variables de entorno
copy backend\.env.example backend\.env

# 3. Levantar los 3 servicios
docker compose up -d --build

# 4. Cargar esquema + datos
Start-Sleep -Seconds 8
foreach ($f in @("001_schema_base","002_schema_operacional","003_schema_personal","004_triggers","005_indexes","006_fix_trigger_flota","007_estaciones_geolocalizacion","008_seguridad_auditoria")) {
  cmd /c "docker exec -i transmetro_db psql -U transmetro_user -d transmetro_db < database/migrations/$f.sql"
}
cmd /c "docker exec -i transmetro_db psql -U transmetro_user -d transmetro_db < database/seeds/seed_transmetro.sql"
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Vista pública | http://localhost:5173/publico |
| Backend API | http://localhost:3000/api |
| Health check | http://localhost:3000/api/health |

---

## Roles y Accesos

| Rol | Acceso |
|---|---|
| Administrador | Todo el sistema + Usuarios y Auditoría |
| Supervisor | Flota, Pilotos, Líneas, Operación, Reportes |
| Operador | Dashboard, Operación, Estaciones, Alertas |
| Piloto | Mi Operación — turnos y recorridos |
| Guardia | Accesos — monitoreo por estación |

> Las credenciales de prueba se entregan por separado al evaluador.

---

## Datos Reales Integrados

- **10 líneas** activas incluyendo L5 eléctrica BYD (14 estaciones, 12 km) y L7 (24 km, 30 paradas)
- **6 municipios** del área metropolitana
- **33 buses** — 14 BYD K9 eléctricos + flota Mercedes-Benz
- **6 parqueos**, 1 con carga eléctrica para flota BYD
- **24 estaciones** en zonas 1, 6, 7, 12 y municipios

---

## Documentación

| Documento | Descripción |
|---|---|
| [ARQUITECTURA.md](docs/ARQUITECTURA.md) | Stack, modelo de datos, API, seguridad |
| [DESPLIEGUE.md](docs/DESPLIEGUE.md) | Local (Docker) y producción (Render) |
| [MANUAL_DE_USUARIO.md](docs/MANUAL_DE_USUARIO.md) | Guía de uso por rol |

---

## Despliegue en Producción (Render)

El repo incluye `render.yaml` — Blueprint que provisiona base de datos + servicio web automáticamente. La base se auto-inicializa en el primer arranque sin correr migraciones manualmente.

```
render.com → New Blueprint → seleccionar repo → Apply
```

---

*@author Anghel CC · Sistema de Control Integral Transmetro · Guatemala · 2026*
