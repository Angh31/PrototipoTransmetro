-- =============================================================================
-- Fix: Trigger flota — máximo en INSERT, mínimo al desasignar
-- @author Anghel CC
-- @project PrototipoTransmetro
-- =============================================================================

-- Reemplazar la función del trigger de flota
CREATE OR REPLACE FUNCTION fn_validar_flota_linea()
RETURNS TRIGGER AS $$
DECLARE
  v_total_buses      INT;
  v_total_estaciones INT;
BEGIN
  -- ── Al ASIGNAR bus a una línea: verificar que no supere el MÁXIMO ──────────
  IF NEW.id_linea IS NOT NULL THEN
    SELECT COUNT(*) INTO v_total_buses
    FROM buses
    WHERE id_linea = NEW.id_linea
      AND activo = TRUE
      AND id_bus != COALESCE(NEW.id_bus, 0);

    v_total_buses := v_total_buses + 1;

    SELECT COUNT(*) INTO v_total_estaciones
    FROM linea_estacion
    WHERE id_linea = NEW.id_linea;

    IF v_total_estaciones > 0 AND v_total_buses > (v_total_estaciones * 2) THEN
      RAISE EXCEPTION 'La línea id=% no puede tener más de % buses (2× estaciones). Actual: %.',
        NEW.id_linea, (v_total_estaciones * 2), v_total_buses;
    END IF;
  END IF;

  -- ── Al DESASIGNAR bus de una línea: verificar que quede el MÍNIMO ─────────
  IF TG_OP = 'UPDATE' AND OLD.id_linea IS NOT NULL AND
     (NEW.id_linea IS NULL OR NEW.id_linea != OLD.id_linea) THEN

    SELECT COUNT(*) INTO v_total_buses
    FROM buses
    WHERE id_linea = OLD.id_linea
      AND activo = TRUE
      AND id_bus != OLD.id_bus;

    SELECT COUNT(*) INTO v_total_estaciones
    FROM linea_estacion
    WHERE id_linea = OLD.id_linea;

    IF v_total_estaciones > 0 AND v_total_buses < v_total_estaciones THEN
      RAISE EXCEPTION 'La línea id=% necesita mínimo % buses. Quedarían solo %.',
        OLD.id_linea, v_total_estaciones, v_total_buses;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Reinsertar buses L5 — BYD eléctricos (14 buses para 14 estaciones)
INSERT INTO buses (placa, modelo, marca, es_electrico, capacidad_max, id_linea, id_parqueo) VALUES
  ('GTM-L5-001','K9','BYD',TRUE,80,3,4), ('GTM-L5-002','K9','BYD',TRUE,80,3,4),
  ('GTM-L5-003','K9','BYD',TRUE,80,3,4), ('GTM-L5-004','K9','BYD',TRUE,80,3,4),
  ('GTM-L5-005','K9','BYD',TRUE,80,3,4), ('GTM-L5-006','K9','BYD',TRUE,80,3,4),
  ('GTM-L5-007','K9','BYD',TRUE,80,3,4), ('GTM-L5-008','K9','BYD',TRUE,80,3,4),
  ('GTM-L5-009','K9','BYD',TRUE,80,3,4), ('GTM-L5-010','K9','BYD',TRUE,80,3,4),
  ('GTM-L5-011','K9','BYD',TRUE,80,3,4), ('GTM-L5-012','K9','BYD',TRUE,80,3,4),
  ('GTM-L5-013','K9','BYD',TRUE,80,3,4), ('GTM-L5-014','K9','BYD',TRUE,80,3,4)
ON CONFLICT (placa) DO NOTHING;

-- Reinsertar buses L7 — convencionales (8 buses para 8 estaciones)
INSERT INTO buses (placa, modelo, marca, es_electrico, capacidad_max, id_linea, id_parqueo) VALUES
  ('GTM-L7-001','Sprinter','Mercedes-Benz',FALSE,90,5,1),
  ('GTM-L7-002','Sprinter','Mercedes-Benz',FALSE,90,5,1),
  ('GTM-L7-003','Sprinter','Mercedes-Benz',FALSE,90,5,1),
  ('GTM-L7-004','Sprinter','Mercedes-Benz',FALSE,90,5,1),
  ('GTM-L7-005','Sprinter','Mercedes-Benz',FALSE,90,5,1),
  ('GTM-L7-006','Sprinter','Mercedes-Benz',FALSE,90,5,1),
  ('GTM-L7-007','Sprinter','Mercedes-Benz',FALSE,90,5,1),
  ('GTM-L7-008','Sprinter','Mercedes-Benz',FALSE,90,5,1)
ON CONFLICT (placa) DO NOTHING;