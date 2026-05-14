-- =============================================================================
-- Migration 003 — Schema personal: pilotos, guardias, operadores, usuarios
-- @author Anghel CC
-- @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
-- =============================================================================

-- =============================================================================
-- PILOTOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS pilotos (
  id_piloto         SERIAL PRIMARY KEY,
  nombres           VARCHAR(100) NOT NULL,
  apellidos         VARCHAR(100) NOT NULL,
  dpi               VARCHAR(20)  NOT NULL UNIQUE,
  fecha_nacimiento  DATE,
  telefono          VARCHAR(20),
  correo            VARCHAR(150),
  -- Residencia
  municipio_reside  VARCHAR(100),
  direccion         TEXT,
  -- Historial educativo
  nivel_educativo   VARCHAR(50)  CHECK (nivel_educativo IN ('primaria','basico','diversificado','universitario')),
  titulo            VARCHAR(200),
  institucion       VARCHAR(200),
  -- Relación laboral
  id_linea          INT          REFERENCES lineas(id_linea),
  activo            BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- GUARDIAS DE SEGURIDAD
-- =============================================================================
CREATE TABLE IF NOT EXISTS guardias (
  id_guardia  SERIAL PRIMARY KEY,
  nombres     VARCHAR(100) NOT NULL,
  apellidos   VARCHAR(100) NOT NULL,
  dpi         VARCHAR(20)  NOT NULL UNIQUE,
  telefono    VARCHAR(20),
  activo      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Asignación de guardia a acceso de estación (mínimo 1 por acceso)
CREATE TABLE IF NOT EXISTS guardia_acceso (
  id_guardia_acceso SERIAL PRIMARY KEY,
  id_guardia        INT  NOT NULL REFERENCES guardias(id_guardia),
  id_acceso         INT  NOT NULL REFERENCES accesos(id_acceso),
  turno             VARCHAR(20) CHECK (turno IN ('mañana','tarde','noche')),
  activo            BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (id_guardia, id_acceso, turno)
);

-- =============================================================================
-- OPERADORES DE ESTACIÓN
-- =============================================================================
CREATE TABLE IF NOT EXISTS operadores (
  id_operador SERIAL PRIMARY KEY,
  nombres     VARCHAR(100) NOT NULL,
  apellidos   VARCHAR(100) NOT NULL,
  dpi         VARCHAR(20)  NOT NULL UNIQUE,
  correo      VARCHAR(150),
  id_estacion INT          REFERENCES estaciones(id_estacion),
  activo      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- USUARIOS DEL SISTEMA (para autenticación)
-- =============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario  SERIAL PRIMARY KEY,
  username    VARCHAR(80)  NOT NULL UNIQUE,
  password_hash TEXT       NOT NULL,
  rol         VARCHAR(30)  NOT NULL CHECK (rol IN ('admin','supervisor','operador')),
  id_operador INT          REFERENCES operadores(id_operador),
  activo      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
