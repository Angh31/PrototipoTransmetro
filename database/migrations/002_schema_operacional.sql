-- =============================================================================
-- Migration 002 — Schema operacional: parqueos, buses, asignaciones
-- @author Anghel CC
-- @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
-- =============================================================================

-- =============================================================================
-- PARQUEOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS parqueos (
  id_parqueo      SERIAL PRIMARY KEY,
  nombre          VARCHAR(150) NOT NULL,
  capacidad       INT          NOT NULL CHECK (capacidad > 0),
  carga_electrica BOOLEAN      NOT NULL DEFAULT FALSE, -- para buses BYD
  id_municipio    INT          NOT NULL REFERENCES municipios(id_municipio),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- BUSES
-- =============================================================================
CREATE TABLE IF NOT EXISTS buses (
  id_bus          SERIAL PRIMARY KEY,
  placa           VARCHAR(20)  NOT NULL UNIQUE,
  modelo          VARCHAR(100) NOT NULL,
  marca           VARCHAR(100) NOT NULL,
  es_electrico    BOOLEAN      NOT NULL DEFAULT FALSE,  -- TRUE para BYD
  capacidad_max   INT          NOT NULL CHECK (capacidad_max > 0),
  id_linea        INT          REFERENCES lineas(id_linea),       -- puede estar sin línea
  id_parqueo      INT          NOT NULL REFERENCES parqueos(id_parqueo),  -- SIEMPRE requerido
  activo          BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ALERTAS DE CAPACIDAD Y ESPERA
-- =============================================================================
CREATE TABLE IF NOT EXISTS alertas (
  id_alerta     SERIAL PRIMARY KEY,
  tipo          VARCHAR(50)  NOT NULL CHECK (tipo IN ('capacidad', 'espera', 'seguridad', 'operacional')),
  nivel         VARCHAR(20)  NOT NULL CHECK (nivel IN ('baja', 'media', 'alta', 'critica')),
  mensaje       TEXT         NOT NULL,
  id_bus        INT          REFERENCES buses(id_bus),
  id_estacion   INT          REFERENCES estaciones(id_estacion),
  resuelta      BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  resuelta_at   TIMESTAMPTZ
);
