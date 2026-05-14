# PrototipoTransmetro

> Sistema de Control Integral en Tiempo Real para la Red de Transmetro — Municipalidad de Guatemala

**@author** Anghel CC  
**Registro:** No. 15847-2018  
**Año:** 2026

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend API | Node.js 20 LTS + Express |
| Base de datos | PostgreSQL 16 (Docker) |
| Frontend | React 18 + Vite |
| Tiempo real | Socket.io |
| Autenticación | JWT |
| Contenedores | Docker + docker-compose |

---

## Estructura del Proyecto

```
PrototipoTransmetro/
├── backend/                  # API REST + Socket.io
│   └── src/
│       ├── config/           # Conexión a BD, variables
│       ├── controllers/      # Lógica de cada recurso
│       ├── middleware/        # JWT, errores, validación
│       ├── routes/           # Endpoints REST
│       ├── services/         # Lógica de negocio
│       └── sockets/          # Eventos Socket.io
├── frontend/                 # Dashboard React
│   └── src/
│       ├── components/       # Componentes reutilizables
│       ├── pages/            # Vistas principales
│       ├── services/         # Llamadas a la API
│       ├── hooks/            # Custom hooks
│       └── context/          # Estado global
├── database/
│   ├── migrations/           # Esquema PostgreSQL (5 archivos)
│   └── seeds/                # Datos reales de Transmetro
└── docker-compose.yml        # Orquestación de servicios
```

---

## Levantamiento Rápido

```bash
# 1. Clonar y configurar variables de entorno
cp backend/.env.example backend/.env

# 2. Levantar todos los servicios
docker compose up -d

# 3. Ejecutar migraciones
docker exec -i transmetro_db psql -U transmetro_user -d transmetro_db < database/migrations/001_schema_base.sql
docker exec -i transmetro_db psql -U transmetro_user -d transmetro_db < database/migrations/002_schema_operacional.sql
docker exec -i transmetro_db psql -U transmetro_user -d transmetro_db < database/migrations/003_schema_personal.sql
docker exec -i transmetro_db psql -U transmetro_user -d transmetro_db < database/migrations/004_triggers.sql
docker exec -i transmetro_db psql -U transmetro_user -d transmetro_db < database/migrations/005_indexes.sql

# 4. Cargar datos reales
docker exec -i transmetro_db psql -U transmetro_user -d transmetro_db < database/seeds/seed_transmetro.sql
```

---

## Servicios

| Servicio | URL |
|---------|-----|
| Backend API | http://localhost:3000 |
| Frontend | http://localhost:5173 |
| PostgreSQL | localhost:5432 |

---

## Rutas de la API

| Método | Endpoint | Descripción |
|--------|---------|-------------|
| POST | /api/auth/login | Autenticación |
| GET | /api/lineas | Todas las líneas |
| GET | /api/estaciones | Todas las estaciones |
| GET | /api/buses | Flota de buses |
| GET | /api/pilotos | Personal |
| GET | /api/alertas | Alertas activas |
| GET | /api/dashboard | Métricas generales |

---

## Reglas de Negocio (implementadas en BD)

- Flota por línea: mínimo = nº estaciones, máximo = 2× estaciones
- Todo bus debe tener parqueo asignado (nunca puede quedar sin él)
- Buses BYD (eléctricos, Línea 5) → solo parqueos con carga eléctrica
- Todo acceso debe tener al menos un guardia activo
- Alerta automática cuando estación alcanza 50% de capacidad
- Bus espera 5 min adicionales si ocupa menos del 25% de capacidad

---

*Consultor TI Especializado · Sistema Transmetro · Guatemala · 2026*
