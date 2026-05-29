-- =============================================================================
-- Migration 009 — Roles adicionales: piloto y guardia
-- @author Anghel CC
-- @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
--
-- Amplía los roles de cuenta para cubrir los 6 actores de la documentación:
-- admin, supervisor, operador, piloto, guardia (+ pasajero = vista pública).
-- =============================================================================

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN ('admin', 'supervisor', 'operador', 'piloto', 'guardia'));
