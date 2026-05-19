-- =============================================================================
-- Migration 007 — Geolocalización de estaciones (lat / lng)
-- @author Anghel CC
-- @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
--
-- Agrega coordenadas reales aproximadas a las estaciones de la red Transmetro
-- de la Ciudad de Guatemala. Permite renderizar un mapa interactivo con
-- Leaflet/OpenStreetMap en el frontend.
-- =============================================================================

ALTER TABLE estaciones
  ADD COLUMN IF NOT EXISTS lat DECIMAL(9, 6),
  ADD COLUMN IF NOT EXISTS lng DECIMAL(9, 6);

-- Coordenadas aproximadas reales (Ciudad de Guatemala y municipios)
UPDATE estaciones SET lat = 14.652000, lng = -90.505000 WHERE nombre = 'Centra Norte L5';
UPDATE estaciones SET lat = 14.644000, lng = -90.508000 WHERE nombre = 'La Reformita';
UPDATE estaciones SET lat = 14.638000, lng = -90.510000 WHERE nombre = 'Escuela Politécnica';
UPDATE estaciones SET lat = 14.632000, lng = -90.513000 WHERE nombre = 'El Gallito';
UPDATE estaciones SET lat = 14.639600, lng = -90.513200 WHERE nombre = 'Parque Colón';
UPDATE estaciones SET lat = 14.617100, lng = -90.529000 WHERE nombre = 'La Terminal';
UPDATE estaciones SET lat = 14.642000, lng = -90.513500 WHERE nombre = 'Mercado Central';
UPDATE estaciones SET lat = 14.641000, lng = -90.513000 WHERE nombre = 'Plaza Mayor';
UPDATE estaciones SET lat = 14.642500, lng = -90.512800 WHERE nombre = 'Sexta Avenida';
UPDATE estaciones SET lat = 14.630800, lng = -90.516300 WHERE nombre = 'Estadio Mateo Flores';
UPDATE estaciones SET lat = 14.587600, lng = -90.551000 WHERE nombre = 'Ciudad Universitaria';
UPDATE estaciones SET lat = 14.584000, lng = -90.550000 WHERE nombre = 'USAC Sur';
UPDATE estaciones SET lat = 14.601000, lng = -90.530000 WHERE nombre = 'Vista Hermosa';
UPDATE estaciones SET lat = 14.549900, lng = -90.553200 WHERE nombre = 'Centra Sur L5';
UPDATE estaciones SET lat = 14.630600, lng = -90.601400 WHERE nombre = 'Mixco Central';
UPDATE estaciones SET lat = 14.650000, lng = -90.610000 WHERE nombre = 'Colonia Primero de Julio';
UPDATE estaciones SET lat = 14.662000, lng = -90.620000 WHERE nombre = 'El Naranjo';
UPDATE estaciones SET lat = 14.642000, lng = -90.619000 WHERE nombre = 'San Cristóbal';
UPDATE estaciones SET lat = 14.580000, lng = -90.526300 WHERE nombre = 'Hangares';
UPDATE estaciones SET lat = 14.610100, lng = -90.519800 WHERE nombre = 'Plaza España';
UPDATE estaciones SET lat = 14.552000, lng = -90.554000 WHERE nombre = 'Centra Sur L12';
UPDATE estaciones SET lat = 14.619100, lng = -90.544300 WHERE nombre = 'Trébol';
UPDATE estaciones SET lat = 14.623300, lng = -90.546800 WHERE nombre = 'Roosevelt';
UPDATE estaciones SET lat = 14.640000, lng = -90.518000 WHERE nombre = 'San Juan de Dios';
