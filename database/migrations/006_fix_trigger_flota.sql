-- =============================================================================
-- Migration 006 — Fix trigger fn_validar_flota_linea
-- Problema: 004 exigía el mínimo de buses desde el primer INSERT, rompiendo
-- la carga del seed cuando los buses se insertan uno a uno.
-- Solución: el mínimo solo se valida al DESASIGNAR o CAMBIAR de línea (UPDATE).
-- @author Anghel CC
-- @project PrototipoTransmetro
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_validar_flota_linea()
RETURNS TRIGGER AS $$
DECLARE
  v_total_buses      INT;
  v_total_estaciones INT;
BEGIN
  -- Al ASIGNAR bus a una línea (INSERT o UPDATE): solo verificar MÁXIMO
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

  -- Al DESASIGNAR o CAMBIAR de línea (UPDATE): verificar MÍNIMO en la línea anterior
  IF TG_OP = 'UPDATE' AND OLD.id_linea IS NOT NULL AND
     OLD.id_linea IS DISTINCT FROM NEW.id_linea THEN

    SELECT COUNT(*) INTO v_total_buses
    FROM buses
    WHERE id_linea = OLD.id_linea
      AND activo = TRUE
      AND id_bus != OLD.id_bus;

    SELECT COUNT(*) INTO v_total_estaciones
    FROM linea_estacion
    WHERE id_linea = OLD.id_linea;

    IF v_total_estaciones > 0 AND v_total_buses < v_total_estaciones THEN
      RAISE EXCEPTION 'La línea id=% necesita mínimo % buses (1 por estación). Quedarían solo %.',
        OLD.id_linea, v_total_estaciones, v_total_buses;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
