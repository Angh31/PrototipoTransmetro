-- =============================================================================
-- Migration 001 — Schema base: municipios, líneas, estaciones
-- @author Anghel CC
-- @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
-- =============================================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de metadatos del sistema
CREATE TABLE IF NOT EXISTS sistema_metadata (
  clave   VARCHAR(100) PRIMARY KEY,
  valor   TEXT NOT NULL
);

INSERT INTO sistema_metadata (clave, valor) VALUES
  ('autor',        'Anghel CC'),
  ('proyecto',     'PrototipoTransmetro'),
  ('descripcion',  'Sistema de Control Integral — Transmetro Guatemala'),
  ('version',      '1.0.0'),
  ('anio',         '2026')
ON CONFLICT (clave) DO NOTHING;

-- =============================================================================
-- MUNICIPIOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS municipios (
  id_municipio  SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  departamento  VARCHAR(100) NOT NULL DEFAULT 'Guatemala',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- LÍNEAS DE TRANSMETRO
-- =============================================================================
CREATE TABLE IF NOT EXISTS lineas (
  id_linea      SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  codigo        VARCHAR(10)  NOT NULL UNIQUE,  -- L1, L5, L7, etc.
  distancia_km  DECIMAL(6,2),
  activa        BOOLEAN      NOT NULL DEFAULT TRUE,
  id_municipio  INT          NOT NULL REFERENCES municipios(id_municipio),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ESTACIONES
-- =============================================================================
CREATE TABLE IF NOT EXISTS estaciones (
  id_estacion   SERIAL PRIMARY KEY,
  nombre        VARCHAR(150) NOT NULL,
  capacidad_max INT          NOT NULL CHECK (capacidad_max > 0),
  activa        BOOLEAN      NOT NULL DEFAULT TRUE,
  id_municipio  INT          NOT NULL REFERENCES municipios(id_municipio),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- LÍNEA ↔ ESTACIÓN (relación con orden de visita y distancia entre estaciones)
-- =============================================================================
CREATE TABLE IF NOT EXISTS linea_estacion (
  id_linea_estacion SERIAL PRIMARY KEY,
  id_linea          INT          NOT NULL REFERENCES lineas(id_linea),
  id_estacion       INT          NOT NULL REFERENCES estaciones(id_estacion),
  orden_visita      INT          NOT NULL,
  distancia_km      DECIMAL(6,2),          -- distancia a la siguiente estación
  UNIQUE (id_linea, id_estacion),
  UNIQUE (id_linea, orden_visita)
);

-- =============================================================================
-- ACCESOS DE ESTACIÓN
-- =============================================================================
CREATE TABLE IF NOT EXISTS accesos (
  id_acceso     SERIAL PRIMARY KEY,
  descripcion   VARCHAR(200) NOT NULL,
  id_estacion   INT          NOT NULL REFERENCES estaciones(id_estacion),
  UNIQUE (descripcion, id_estacion)
);
