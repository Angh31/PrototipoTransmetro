# =============================================================================
# Dockerfile de PRODUCCIÓN — un solo servicio (backend sirve el frontend)
# @author Anghel CC
# @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
# =============================================================================

# ─── Etapa 1: compilar el frontend (React + Vite) ────────────────────────────
FROM node:20-alpine AS frontend
WORKDIR /fe
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build          # genera /fe/dist

# ─── Etapa 2: backend + frontend compilado ───────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Dependencias del backend (solo producción)
COPY backend/package*.json ./
RUN npm install --omit=dev

# Código del backend
COPY backend/ ./

# Scripts SQL (para la inicialización automática de la BD en el primer arranque)
COPY database/ ./database/

# Frontend compilado servido por Express en /app/public
COPY --from=frontend /fe/dist ./public

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/app.js"]
