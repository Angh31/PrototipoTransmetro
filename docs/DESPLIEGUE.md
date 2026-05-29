# Guía de Despliegue — PrototipoTransmetro

> Municipalidad de Guatemala · 2026 · **@author Anghel CC**

---

## A. Desarrollo local (Docker)

Requisitos: Docker Desktop y Git.

```powershell
git clone https://github.com/Angh31/PrototipoTransmetro.git
cd PrototipoTransmetro
copy backend\.env.example backend\.env

docker compose up -d --build
Start-Sleep -Seconds 8

# Esquema + datos (en orden)
foreach ($f in @("001_schema_base","002_schema_operacional","003_schema_personal","004_triggers","005_indexes","006_fix_trigger_flota","007_estaciones_geolocalizacion","008_seguridad_auditoria")) {
  cmd /c "docker exec -i transmetro_db psql -U transmetro_user -d transmetro_db < database/migrations/$f.sql"
}
cmd /c "docker exec -i transmetro_db psql -U transmetro_user -d transmetro_db < database/seeds/seed_transmetro.sql"
```

Servicios locales: Frontend `http://localhost:5173` · API `http://localhost:3000/api` · PostgreSQL `localhost:5432`.

> En desarrollo, el frontend (Vite) y el backend corren por separado con recarga automática. En producción se sirven juntos.

---

## B. Producción en Render.com (recomendado)

El repositorio incluye un **Blueprint** (`render.yaml`) que crea automáticamente la base de datos y el servicio web.

1. Subí el código a GitHub (`git push`).
2. Entrá a **render.com** y registrate con tu cuenta de GitHub.
3. **New + → Blueprint** → seleccioná el repositorio → **Apply**.
4. Render provisiona la base PostgreSQL y el servicio web (Docker). La primera build tarda ~5–10 min.
5. En el **primer arranque**, la base se inicializa sola (esquema + datos) mediante `backend/src/config/init.js` — no hay que correr migraciones a mano.
6. Cuando el servicio esté **"Live"**, abrí la URL (ej. `https://transmetro-xxxx.onrender.com`).

### Arquitectura en producción
Un **solo servicio**: el `Dockerfile` raíz compila el frontend (`vite build`) y el backend (Express) lo sirve como estático, además de exponer la API y los WebSockets en el mismo dominio. Ventaja: un único enlace, sin problemas de CORS.

### Variables de entorno (las configura el Blueprint)
| Variable | Origen |
|----------|--------|
| `NODE_ENV` | `production` |
| `DB_HOST/PORT/NAME/USER/PASS` | inyectadas desde la base de datos de Render |
| `DB_SSL` | `false` (conexión interna) |
| `JWT_SECRET` | generada automáticamente |
| `JWT_EXPIRES_IN` | `8h` |
| `CORS_ORIGIN` | `*` |

---

## C. Disponibilidad 24/7 (evitar el "arranque en frío")

El plan gratis de Render duerme el servicio tras ~15 min de inactividad. Para mantenerlo despierto:

1. Registrate gratis en **uptimerobot.com**.
2. **Add New Monitor** → tipo *HTTP(s)*.
3. URL: `https://TU-APP.onrender.com/api/health` · Intervalo: **5 minutos** → Create.

Esto mantiene la aplicación disponible al instante a cualquier hora, sin costo.

---

## D. Lista de verificación para entrega real

Antes de entregar el sistema a producción real:

- [ ] Cambiar el `JWT_SECRET` por uno propio (Render lo genera, pero verificalo).
- [ ] Cambiar las contraseñas por defecto del sistema.
- [ ] Crear las cuentas reales del personal y desactivar las de prueba.
- [ ] Reemplazar los **datos maestros** (líneas, estaciones, flota, personal) por los oficiales.
- [ ] Eliminar del seed los **datos de ejemplo** de alertas (marcados en `seed_transmetro.sql`).
- [ ] Verificar que exista al menos un administrador activo.

---

*Sistema de Control Integral Transmetro · Municipalidad de Guatemala · 2026 · @author Anghel CC*
