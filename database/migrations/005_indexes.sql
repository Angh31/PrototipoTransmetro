-- =============================================================================
-- Migration 005 — Índices para rendimiento
-- @author Anghel CC
-- @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
-- =============================================================================

-- Líneas
CREATE INDEX IF NOT EXISTS idx_lineas_activa     ON lineas(activa);
CREATE INDEX IF NOT EXISTS idx_lineas_municipio  ON lineas(id_municipio);

-- Estaciones
CREATE INDEX IF NOT EXISTS idx_estaciones_activa    ON estaciones(activa);
CREATE INDEX IF NOT EXISTS idx_estaciones_municipio ON estaciones(id_municipio);

-- Línea-Estación
CREATE INDEX IF NOT EXISTS idx_linea_estacion_linea   ON linea_estacion(id_linea);
CREATE INDEX IF NOT EXISTS idx_linea_estacion_estacion ON linea_estacion(id_estacion);
CREATE INDEX IF NOT EXISTS idx_linea_estacion_orden    ON linea_estacion(id_linea, orden_visita);

-- Buses
CREATE INDEX IF NOT EXISTS idx_buses_linea    ON buses(id_linea);
CREATE INDEX IF NOT EXISTS idx_buses_parqueo  ON buses(id_parqueo);
CREATE INDEX IF NOT EXISTS idx_buses_activo   ON buses(activo);
CREATE INDEX IF NOT EXISTS idx_buses_electrico ON buses(es_electrico);

-- Alertas
CREATE INDEX IF NOT EXISTS idx_alertas_resuelta   ON alertas(resuelta);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo       ON alertas(tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_estacion   ON alertas(id_estacion);
CREATE INDEX IF NOT EXISTS idx_alertas_created_at ON alertas(created_at DESC);

-- Pilotos
CREATE INDEX IF NOT EXISTS idx_pilotos_linea  ON pilotos(id_linea);
CREATE INDEX IF NOT EXISTS idx_pilotos_activo ON pilotos(activo);

-- Guardia-Acceso
CREATE INDEX IF NOT EXISTS idx_guardia_acceso_acceso ON guardia_acceso(id_acceso);
CREATE INDEX IF NOT EXISTS idx_guardia_acceso_activo ON guardia_acceso(activo);

-- Usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol      ON usuarios(rol);
