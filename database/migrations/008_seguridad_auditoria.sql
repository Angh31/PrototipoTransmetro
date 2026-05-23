-- =============================================================================
-- Migration 008 — Seguridad: bloqueo de login por intentos + auditoría
-- @author Anghel CC
-- @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
-- =============================================================================

-- Control de intentos fallidos de login y bloqueo temporal
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS intentos_fallidos INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bloqueado_hasta   TIMESTAMPTZ;

-- Registro de auditoría: quién hizo qué y cuándo
CREATE TABLE IF NOT EXISTS auditoria (
  id_auditoria SERIAL PRIMARY KEY,
  usuario      VARCHAR(80),
  accion       VARCHAR(100) NOT NULL,
  detalle      TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_created ON auditoria(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion  ON auditoria(accion);
