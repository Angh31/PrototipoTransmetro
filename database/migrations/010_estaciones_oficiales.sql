-- =============================================================================
-- Migration 010 — Estaciones oficiales por línea (réplica del mapa oficial)
-- @author Anghel CC
-- @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
--
-- Expande la red con estaciones reales y sus recorridos por línea, alineado
-- al MyMaps oficial de Transmetro (L1, L6, L7, L13, L18, TuBus 1 y 2).
-- =============================================================================

-- ── 1) Restricción de unicidad por nombre (idempotente) ─────────────────────
ALTER TABLE estaciones DROP CONSTRAINT IF EXISTS estaciones_nombre_unique;
ALTER TABLE estaciones ADD CONSTRAINT estaciones_nombre_unique UNIQUE (nombre);

-- ── 2) Estaciones oficiales por línea (datos reales aproximados) ────────────
INSERT INTO estaciones (nombre, capacidad_max, id_municipio, lat, lng) VALUES
  -- L1 · Eje Centro Histórico (6a/7a Avenida zona 1)
  ('Plaza Barrios L1',         220, 1, 14.6438, -90.5141),
  ('Tipografía Nacional',      180, 1, 14.6431, -90.5135),
  ('Justo Rufino Barrios',     160, 1, 14.6411, -90.5142),
  ('18 Calle Zona 1',          200, 1, 14.6373, -90.5145),
  ('12 Calle Zona 1',          180, 1, 14.6356, -90.5151),
  ('Cementerio General',       220, 1, 14.6328, -90.5210),

  -- L6 · Zona 1 ↔ Zona 6
  ('Castillo de San José',     160, 1, 14.6478, -90.5083),
  ('Ferrocarril',              180, 1, 14.6541, -90.5067),
  ('Atanasio Tzul Zona 6',     200, 1, 14.6612, -90.5042),

  -- L7 · Periférico (USAC ↔ Centro) — paradas reales adicionales
  ('Plaza Berlín',             200, 1, 14.6080, -90.5350),
  ('IGSS Aguilar Batres',      180, 1, 14.5970, -90.5500),
  ('Trébol Sur',               220, 1, 14.6173, -90.5460),
  ('Aguilar Batres y 38 C',    180, 1, 14.5905, -90.5535),

  -- L13 · Hangares ↔ Plaza España — paradas intermedias
  ('Aeropuerto La Aurora',     250, 1, 14.5833, -90.5279),
  ('INTECAP',                  180, 1, 14.5882, -90.5258),
  ('Reforma 24 Zona 9',        200, 1, 14.5961, -90.5208),
  ('Reforma Obelisco',         220, 1, 14.6033, -90.5188),
  ('Reforma 12 Zona 10',       200, 1, 14.6101, -90.5198),

  -- L18 · Mixco
  ('Mixco Plaza',              200, 2, 14.6322, -90.6082),
  ('Las Brisas Mixco',         180, 2, 14.6403, -90.6125),
  ('San Cristóbal Norte',      200, 2, 14.6470, -90.6189),
  ('Lo de Bran',               160, 2, 14.6520, -90.6244),

  -- TuBus Ruta 1
  ('TuBus TB1 — Roosevelt',          180, 1, 14.6233, -90.5470),
  ('TuBus TB1 — Calzada San Juan',   160, 1, 14.6310, -90.5550),
  ('TuBus TB1 — El Naranjo Norte',   140, 2, 14.6603, -90.6204),

  -- TuBus Ruta 2
  ('TuBus TB2 — Plaza Berlín',           160, 1, 14.6078, -90.5345),
  ('TuBus TB2 — Vista Hermosa II',       140, 1, 14.6011, -90.5290),
  ('TuBus TB2 — Carretera al Salvador',  140, 1, 14.5895, -90.4990)
ON CONFLICT (nombre) DO UPDATE SET
  capacidad_max = EXCLUDED.capacidad_max,
  id_municipio  = EXCLUDED.id_municipio,
  lat           = EXCLUDED.lat,
  lng           = EXCLUDED.lng;

-- ── 3) Recorridos por línea (linea_estacion) ────────────────────────────────

-- L1 — Centro Histórico
INSERT INTO linea_estacion (id_linea, id_estacion, orden_visita, distancia_km)
SELECT 1, e.id_estacion, x.orden, x.dist
FROM (VALUES
  ('Plaza Barrios L1',     1, 0.30),
  ('Tipografía Nacional',  2, 0.30),
  ('Justo Rufino Barrios', 3, 0.40),
  ('Plaza Mayor',          4, 0.40),
  ('Sexta Avenida',        5, 0.30),
  ('San Juan de Dios',     6, 0.40),
  ('18 Calle Zona 1',      7, 0.40),
  ('12 Calle Zona 1',      8, 0.30),
  ('Cementerio General',   9, 0.90)
) AS x(nom, orden, dist)
JOIN estaciones e ON e.nombre = x.nom
ON CONFLICT (id_linea, id_estacion) DO NOTHING;

-- L6 — Zona 1 ↔ Zona 6
INSERT INTO linea_estacion (id_linea, id_estacion, orden_visita, distancia_km)
SELECT 4, e.id_estacion, x.orden, x.dist
FROM (VALUES
  ('Parque Colón',           1, 0.50),
  ('Castillo de San José',   2, 0.85),
  ('Ferrocarril',            3, 0.95),
  ('Atanasio Tzul Zona 6',   4, 1.10)
) AS x(nom, orden, dist)
JOIN estaciones e ON e.nombre = x.nom
ON CONFLICT (id_linea, id_estacion) DO NOTHING;

-- L7 — paradas reales adicionales (extiende la ruta actual a 12 paradas)
INSERT INTO linea_estacion (id_linea, id_estacion, orden_visita, distancia_km)
SELECT 5, e.id_estacion, x.orden, x.dist
FROM (VALUES
  ('Plaza Berlín',            9, 1.30),
  ('IGSS Aguilar Batres',    10, 1.60),
  ('Trébol Sur',             11, 1.20),
  ('Aguilar Batres y 38 C',  12, 1.50)
) AS x(nom, orden, dist)
JOIN estaciones e ON e.nombre = x.nom
ON CONFLICT (id_linea, id_estacion) DO NOTHING;

-- L13 — paradas intermedias entre Hangares y Plaza España
INSERT INTO linea_estacion (id_linea, id_estacion, orden_visita, distancia_km)
SELECT 7, e.id_estacion, x.orden, x.dist
FROM (VALUES
  ('Aeropuerto La Aurora',  3, 0.50),
  ('INTECAP',               4, 0.60),
  ('Reforma 24 Zona 9',     5, 1.20),
  ('Reforma Obelisco',      6, 0.80),
  ('Reforma 12 Zona 10',    7, 0.90)
) AS x(nom, orden, dist)
JOIN estaciones e ON e.nombre = x.nom
ON CONFLICT (id_linea, id_estacion) DO NOTHING;

-- L18 — Mixco
INSERT INTO linea_estacion (id_linea, id_estacion, orden_visita, distancia_km)
SELECT 8, e.id_estacion, x.orden, x.dist
FROM (VALUES
  ('Mixco Central',        1, 0.85),
  ('Mixco Plaza',          2, 0.80),
  ('Las Brisas Mixco',     3, 0.95),
  ('San Cristóbal Norte',  4, 1.10),
  ('Lo de Bran',           5, 0.85)
) AS x(nom, orden, dist)
JOIN estaciones e ON e.nombre = x.nom
ON CONFLICT (id_linea, id_estacion) DO NOTHING;

-- TB1 — TuBus Ruta 1
INSERT INTO linea_estacion (id_linea, id_estacion, orden_visita, distancia_km)
SELECT 9, e.id_estacion, x.orden, x.dist
FROM (VALUES
  ('Trébol',                       1, 0.60),
  ('TuBus TB1 — Roosevelt',        2, 0.80),
  ('TuBus TB1 — Calzada San Juan', 3, 1.20),
  ('TuBus TB1 — El Naranjo Norte', 4, 1.80)
) AS x(nom, orden, dist)
JOIN estaciones e ON e.nombre = x.nom
ON CONFLICT (id_linea, id_estacion) DO NOTHING;

-- TB2 — TuBus Ruta 2
INSERT INTO linea_estacion (id_linea, id_estacion, orden_visita, distancia_km)
SELECT 10, e.id_estacion, x.orden, x.dist
FROM (VALUES
  ('Vista Hermosa',                       1, 0.40),
  ('TuBus TB2 — Plaza Berlín',            2, 0.60),
  ('TuBus TB2 — Vista Hermosa II',        3, 0.80),
  ('TuBus TB2 — Carretera al Salvador',   4, 3.20)
) AS x(nom, orden, dist)
JOIN estaciones e ON e.nombre = x.nom
ON CONFLICT (id_linea, id_estacion) DO NOTHING;

-- ── 4) Buses adicionales para que las nuevas líneas tengan flota en el mapa ─
INSERT INTO buses (placa, modelo, marca, es_electrico, capacidad_max, id_linea, id_parqueo) VALUES
  ('GTM-L1-001', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 1, 1),
  ('GTM-L1-002', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 1, 1),
  ('GTM-L1-003', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 1, 1),
  ('GTM-L6-001', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 4, 1),
  ('GTM-L6-002', 'Sprinter', 'Mercedes-Benz', FALSE, 90, 4, 1),
  ('GTM-L18-001','Sprinter', 'Mercedes-Benz', FALSE, 90, 8, 5),
  ('GTM-L18-002','Sprinter', 'Mercedes-Benz', FALSE, 90, 8, 5),
  ('GTM-TB1-001','Sprinter', 'Mercedes-Benz', FALSE, 90, 9, 3),
  ('GTM-TB1-002','Sprinter', 'Mercedes-Benz', FALSE, 90, 9, 3),
  ('GTM-TB2-001','Sprinter', 'Mercedes-Benz', FALSE, 90, 10, 3),
  ('GTM-TB2-002','Sprinter', 'Mercedes-Benz', FALSE, 90, 10, 3)
ON CONFLICT (placa) DO NOTHING;

-- ── 5) Accesos básicos para las nuevas estaciones-hub ───────────────────────
INSERT INTO accesos (descripcion, id_estacion)
SELECT x.descripcion, e.id_estacion FROM (VALUES
  ('Acceso Principal — Plaza Barrios',     'Plaza Barrios L1'),
  ('Acceso Sur — Plaza Barrios',           'Plaza Barrios L1'),
  ('Acceso Principal — Cementerio',        'Cementerio General'),
  ('Acceso Principal — Atanasio Tzul',     'Atanasio Tzul Zona 6'),
  ('Acceso Principal — Aeropuerto',        'Aeropuerto La Aurora'),
  ('Acceso Sur — Aeropuerto',              'Aeropuerto La Aurora'),
  ('Acceso Principal — Reforma Obelisco',  'Reforma Obelisco'),
  ('Acceso Principal — Mixco Plaza',       'Mixco Plaza')
) AS x(descripcion, nom)
JOIN estaciones e ON e.nombre = x.nom
WHERE NOT EXISTS (
  SELECT 1 FROM accesos a
  WHERE a.id_estacion = e.id_estacion AND a.descripcion = x.descripcion
);
