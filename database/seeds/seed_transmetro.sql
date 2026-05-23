-- =============================================================================
-- Seed — Datos reales de la red Transmetro Guatemala
-- @author Anghel CC
-- @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
-- =============================================================================

-- =============================================================================
-- MUNICIPIOS
-- =============================================================================
INSERT INTO municipios (nombre, departamento) VALUES
  ('Guatemala',       'Guatemala'),
  ('Mixco',           'Guatemala'),
  ('Villa Nueva',     'Guatemala'),
  ('San Miguel Petapa','Guatemala'),
  ('Chinautla',       'Guatemala'),
  ('Amatitlán',       'Guatemala')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PARQUEOS (incluyendo parqueos con carga eléctrica para BYD)
-- =============================================================================
INSERT INTO parqueos (nombre, capacidad, carga_electrica, id_municipio) VALUES
  ('Parqueo Central Norte',       30, FALSE, 1),
  ('Parqueo Centra Sur',          40, FALSE, 3),
  ('Parqueo Trébol',              25, FALSE, 1),
  ('Parqueo Eléctrico L5 — BYD', 20, TRUE,  1),
  ('Parqueo Mixco Norte',         20, FALSE, 2),
  ('Parqueo Villa Nueva Sur',     30, FALSE, 3)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- LÍNEAS REALES DE TRANSMETRO
-- =============================================================================
INSERT INTO lineas (nombre, codigo, distancia_km, id_municipio) VALUES
  ('Línea 1 — Centro Histórico',          'L1',   8.5,  1),
  ('Línea 2 — Periférico',                'L2',   12.0, 1),
  ('Línea 5 — Eléctrica BYD',             'L5',   12.0, 1),
  ('Línea 6 — Parque Colón',              'L6',   15.0, 1),
  ('Línea 7 — Ruta Larga',                'L7',   24.0, 1),
  ('Línea 12 — Centra Sur',               'L12',  18.0, 3),
  ('Línea 13 — Hangares / Plaza España',  'L13',  16.0, 1),
  ('Línea 18 — Mixco',                    'L18',  14.0, 2),
  ('TuBus Ruta 1',                        'TB1',  10.0, 1),
  ('TuBus Ruta 2',                        'TB2',  11.0, 2)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ESTACIONES REALES
-- =============================================================================
INSERT INTO estaciones (nombre, capacidad_max, id_municipio) VALUES
  -- L5 — 14 estaciones (datos reales)
  ('Centra Norte L5',        200, 1),
  ('La Reformita',           150, 1),
  ('Escuela Politécnica',    180, 1),
  ('El Gallito',             160, 1),
  ('Parque Colón',           250, 1),  -- Hub principal L6, L7, L18, TuBus
  ('La Terminal',            200, 1),
  ('Mercado Central',        220, 1),
  ('Plaza Mayor',            300, 1),
  ('Sexta Avenida',          280, 1),
  ('Estadio Mateo Flores',   200, 1),
  ('Ciudad Universitaria',   250, 1),
  ('USAC Sur',               180, 1),
  ('Vista Hermosa',          160, 1),
  ('Centra Sur L5',          200, 3),
  -- L7 estaciones adicionales (30 paradas en total, aquí las principales)
  ('Mixco Central',          180, 2),
  ('Colonia Primero de Julio',160, 2),
  ('El Naranjo',             140, 2),
  ('San Cristóbal',          200, 2),
  -- L13 estaciones
  ('Hangares',               150, 1),
  ('Plaza España',           200, 1),
  -- L12
  ('Centra Sur L12',         200, 3),
  -- Generales
  ('Trébol',                 280, 1),
  ('Roosevelt',              220, 1),
  ('San Juan de Dios',       180, 1)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ACCESOS (mínimo 2 por estación principal)
-- =============================================================================
INSERT INTO accesos (descripcion, id_estacion) VALUES
  ('Acceso Norte — Centra Norte L5',   1),
  ('Acceso Sur — Centra Norte L5',     1),
  ('Acceso Principal — Parque Colón',  5),
  ('Acceso Lateral — Parque Colón',    5),
  ('Acceso Oriente — Plaza Mayor',     8),
  ('Acceso Poniente — Plaza Mayor',    8),
  ('Acceso Norte — Centra Sur',       14),
  ('Acceso Sur — Centra Sur',         14),
  ('Acceso Principal — Hangares',     19),
  ('Acceso Principal — Plaza España', 20)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- RELACIÓN LÍNEA-ESTACIÓN (L5 completa — 14 estaciones en orden)
-- =============================================================================
INSERT INTO linea_estacion (id_linea, id_estacion, orden_visita, distancia_km) VALUES
  (3, 1,  1,  0.85),
  (3, 2,  2,  0.90),
  (3, 3,  3,  0.95),
  (3, 4,  4,  0.80),
  (3, 5,  5,  1.10),
  (3, 6,  6,  0.75),
  (3, 7,  7,  0.60),
  (3, 8,  8,  0.55),
  (3, 9,  9,  0.70),
  (3, 10, 10, 0.90),
  (3, 11, 11, 1.20),
  (3, 12, 12, 0.85),
  (3, 13, 13, 0.95),
  (3, 14, 14, 0.90)
ON CONFLICT DO NOTHING;

-- L7 (muestra de 8 estaciones clave de sus 30 paradas)
INSERT INTO linea_estacion (id_linea, id_estacion, orden_visita, distancia_km) VALUES
  (5, 5,  1, 2.10),
  (5, 15, 2, 1.80),
  (5, 16, 3, 1.50),
  (5, 17, 4, 1.90),
  (5, 18, 5, 2.00),
  (5, 22, 6, 2.20),
  (5, 23, 7, 1.70),
  (5, 24, 8, 1.60)
ON CONFLICT DO NOTHING;

-- L13 (Hangares → Plaza España, 21 estaciones — muestra clave)
INSERT INTO linea_estacion (id_linea, id_estacion, orden_visita, distancia_km) VALUES
  (7, 19, 1, 1.50),
  (7, 20, 2, 1.80)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- BUSES (Flota L5 — BYD eléctricos — 14 buses mínimo para 14 estaciones)
-- =============================================================================
INSERT INTO buses (placa, modelo, marca, es_electrico, capacidad_max, id_linea, id_parqueo) VALUES
  ('GTM-L5-001', 'K9', 'BYD', TRUE, 80, 3, 4),
  ('GTM-L5-002', 'K9', 'BYD', TRUE, 80, 3, 4),
  ('GTM-L5-003', 'K9', 'BYD', TRUE, 80, 3, 4),
  ('GTM-L5-004', 'K9', 'BYD', TRUE, 80, 3, 4),
  ('GTM-L5-005', 'K9', 'BYD', TRUE, 80, 3, 4),
  ('GTM-L5-006', 'K9', 'BYD', TRUE, 80, 3, 4),
  ('GTM-L5-007', 'K9', 'BYD', TRUE, 80, 3, 4),
  ('GTM-L5-008', 'K9', 'BYD', TRUE, 80, 3, 4),
  ('GTM-L5-009', 'K9', 'BYD', TRUE, 80, 3, 4),
  ('GTM-L5-010', 'K9', 'BYD', TRUE, 80, 3, 4),
  ('GTM-L5-011', 'K9', 'BYD', TRUE, 80, 3, 4),
  ('GTM-L5-012', 'K9', 'BYD', TRUE, 80, 3, 4),
  ('GTM-L5-013', 'K9', 'BYD', TRUE, 80, 3, 4),
  ('GTM-L5-014', 'K9', 'BYD', TRUE, 80, 3, 4)
ON CONFLICT DO NOTHING;

-- Buses L7 (convencionales)
INSERT INTO buses (placa, modelo, marca, es_electrico, capacidad_max, id_linea, id_parqueo) VALUES
  ('GTM-L7-001', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 5, 1),
  ('GTM-L7-002', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 5, 1),
  ('GTM-L7-003', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 5, 1),
  ('GTM-L7-004', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 5, 1),
  ('GTM-L7-005', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 5, 1),
  ('GTM-L7-006', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 5, 1),
  ('GTM-L7-007', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 5, 1),
  ('GTM-L7-008', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 5, 1)
ON CONFLICT DO NOTHING;

-- Buses L12
INSERT INTO buses (placa, modelo, marca, es_electrico, capacidad_max, id_linea, id_parqueo) VALUES
  ('GTM-L12-001', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 6, 2),
  ('GTM-L12-002', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 6, 2),
  ('GTM-L12-003', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 6, 2),
  ('GTM-L12-004', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 6, 2),
  ('GTM-L12-005', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 6, 2)
ON CONFLICT DO NOTHING;

-- Buses L13
INSERT INTO buses (placa, modelo, marca, es_electrico, capacidad_max, id_linea, id_parqueo) VALUES
  ('GTM-L13-001', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 7, 3),
  ('GTM-L13-002', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 7, 3),
  ('GTM-L13-003', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 7, 3),
  ('GTM-L13-004', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 7, 3)
ON CONFLICT DO NOTHING;

-- Buses sin línea asignada (reserva)
INSERT INTO buses (placa, modelo, marca, es_electrico, capacidad_max, id_linea, id_parqueo) VALUES
  ('GTM-RSV-001', 'Sprinter', 'Mercedes-Benz', FALSE, 80, NULL, 1),
  ('GTM-RSV-002', 'Sprinter', 'Mercedes-Benz', FALSE, 80, NULL, 2)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- GUARDIAS (asignados a accesos)
-- =============================================================================
INSERT INTO guardias (nombres, apellidos, dpi, telefono) VALUES
  ('Carlos Alberto',  'Méndez López',   '1234567890101', '5501-1001'),
  ('Juan Francisco',  'García Pérez',   '1234567890102', '5501-1002'),
  ('Pedro Antonio',   'Ramírez Cruz',   '1234567890103', '5501-1003'),
  ('Luis Fernando',   'Morales Ruiz',   '1234567890104', '5501-1004'),
  ('Mario Roberto',   'Castillo Díaz',  '1234567890105', '5501-1005'),
  ('José Miguel',     'Herrera Lima',   '1234567890106', '5501-1006'),
  ('Roberto Carlos',  'Juárez Alonzo',  '1234567890107', '5501-1007'),
  ('Erick Josué',     'Vásquez Pérez',  '1234567890108', '5501-1008'),
  ('David Ernesto',   'Solís Fuentes',  '1234567890109', '5501-1009'),
  ('Sergio Antonio',  'Lima González',  '1234567890110', '5501-1010')
ON CONFLICT DO NOTHING;

-- Asignación de guardias a accesos
INSERT INTO guardia_acceso (id_guardia, id_acceso, turno) VALUES
  (1, 1,  'mañana'), (2, 1,  'tarde'),
  (3, 2,  'mañana'), (4, 2,  'tarde'),
  (5, 3,  'mañana'), (6, 3,  'tarde'),
  (7, 4,  'mañana'), (8, 4,  'tarde'),
  (9, 5,  'mañana'), (10, 5, 'tarde'),
  (1, 6,  'noche'),  (2, 7,  'mañana'),
  (3, 8,  'mañana'), (4, 8,  'tarde'),
  (5, 9,  'mañana'), (6, 10, 'mañana')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PILOTOS
-- =============================================================================
INSERT INTO pilotos (nombres, apellidos, dpi, telefono, correo, municipio_reside, nivel_educativo, id_linea) VALUES
  ('Ana María',      'López Gutiérrez', '2001001010101', '5502-2001', 'ana.lopez@transmetro.gt',    'Guatemala',  'diversificado',  3),
  ('Héctor Rodrigo', 'Pérez Sánchez',   '2001001010102', '5502-2002', 'hector.perez@transmetro.gt', 'Mixco',      'universitario',  3),
  ('Sandra Patricia','Ruiz Morales',    '2001001010103', '5502-2003', 'sandra.ruiz@transmetro.gt',  'Guatemala',  'diversificado',  5),
  ('Miguel Ángel',   'Castro Reyes',    '2001001010104', '5502-2004', 'miguel.castro@transmetro.gt','Villa Nueva', 'diversificado', 5),
  ('Karla Beatriz',  'Hernández Vega',  '2001001010105', '5502-2005', 'karla.h@transmetro.gt',      'Guatemala',  'universitario',  7),
  ('Jorge Luis',     'Alvarez Fuentes', '2001001010106', '5502-2006', 'jorge.a@transmetro.gt',      'Chinautla',  'diversificado',  7)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- OPERADORES DE ESTACIÓN
-- =============================================================================
INSERT INTO operadores (nombres, apellidos, dpi, correo, id_estacion) VALUES
  ('Diana Paola',    'Cordón Méndez',  '3001001010101', 'diana.cordon@transmetro.gt',   1),
  ('Francisco José', 'Alvarado Lima',  '3001001010102', 'francisco.a@transmetro.gt',    5),
  ('Verónica Isabel','Matías Pérez',   '3001001010103', 'veronica.m@transmetro.gt',     8),
  ('Rolando Alberto','Cifuentes Cruz', '3001001010104', 'rolando.c@transmetro.gt',     14),
  ('Cecilia María',  'Ríos Ajú',       '3001001010105', 'cecilia.rios@transmetro.gt',  19),
  ('Emilio José',    'Orozco Barrios', '3001001010106', 'emilio.o@transmetro.gt',      20)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- USUARIOS DEL SISTEMA
-- password_hash corresponde a bcrypt de 'admin2026' (rounds=10)
-- Generado con: bcryptjs.hashSync('admin2026', 10)
-- =============================================================================
INSERT INTO usuarios (username, password_hash, rol, id_operador) VALUES
  ('admin',            '$2a$10$x27mzNyCSE5bZxAE5MaitO/VCEtmpJXYSszgHVR2CfBzfKyweHnX2', 'admin',      NULL),
  ('supervisor_l5',    '$2a$10$x27mzNyCSE5bZxAE5MaitO/VCEtmpJXYSszgHVR2CfBzfKyweHnX2', 'supervisor', NULL),
  ('operador_colón',   '$2a$10$x27mzNyCSE5bZxAE5MaitO/VCEtmpJXYSszgHVR2CfBzfKyweHnX2', 'operador',   2),
  ('operador_centra_norte','$2a$10$x27mzNyCSE5bZxAE5MaitO/VCEtmpJXYSszgHVR2CfBzfKyweHnX2', 'operador', 1)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- GEOLOCALIZACIÓN DE ESTACIONES (coordenadas reales aproximadas)
-- Se aplica aquí para que funcione tanto en instalación nueva como en reset.
-- =============================================================================
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

-- =============================================================================
-- DATOS DE EJEMPLO — Historial de alertas de los últimos 30 días
-- Pueblan el módulo de Reportes para la demostración.
-- NOTA: en un despliegue real estos registros deben eliminarse para que las
-- estadísticas reflejen solo la operación verdadera.
-- =============================================================================
INSERT INTO alertas (tipo, nivel, mensaje, id_estacion, resuelta, created_at, resuelta_at)
SELECT
  (ARRAY['capacidad','capacidad','espera','capacidad','seguridad'])[1 + (g % 5)],
  (ARRAY['alta','critica','media','alta','baja'])[1 + (g % 5)],
  'Evento operativo registrado (histórico)',
  1 + (g % 24),
  TRUE,
  NOW() - (INTERVAL '1 day' * (g % 30)) - (INTERVAL '1 hour' * (g % 9)),
  NOW() - (INTERVAL '1 day' * (g % 30)) - (INTERVAL '1 hour' * (g % 9)) + INTERVAL '17 minutes'
FROM generate_series(1, 45) g
WHERE NOT EXISTS (SELECT 1 FROM alertas WHERE mensaje = 'Evento operativo registrado (histórico)');
