-- =============================================================================
-- Migration 004 — Triggers: reglas de negocio en base de datos
-- @author Anghel CC
-- @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
-- =============================================================================

-- =============================================================================
-- TRIGGER 1: Bus BYD (eléctrico) solo puede asignarse a parqueo con carga eléctrica
-- =============================================================================
CREATE OR REPLACE FUNCTION fn_validar_parqueo_electrico()
RETURNS TRIGGER AS $$
DECLARE
  v_tiene_carga BOOLEAN;
BEGIN
  IF NEW.es_electrico THEN
    SELECT carga_electrica INTO v_tiene_carga
    FROM parqueos
    WHERE id_parqueo = NEW.id_parqueo;

    IF NOT v_tiene_carga THEN
      RAISE EXCEPTION 'Bus eléctrico (BYD) debe asignarse a un parqueo con carga eléctrica. Parqueo id=% no tiene esta capacidad.', NEW.id_parqueo;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_parqueo_electrico ON buses;
CREATE TRIGGER trg_validar_parqueo_electrico
  BEFORE INSERT OR UPDATE OF id_parqueo, es_electrico ON buses
  FOR EACH ROW EXECUTE FUNCTION fn_validar_parqueo_electrico();

-- =============================================================================
-- TRIGGER 2: Bus no puede quedar sin parqueo (parqueo nunca puede ser NULL)
-- Este constraint ya está en la DDL (NOT NULL), pero el trigger protege UPDATE
-- =============================================================================
CREATE OR REPLACE FUNCTION fn_bus_sin_parqueo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_parqueo IS NULL THEN
    RAISE EXCEPTION 'Un bus no puede quedar sin parqueo asignado. Bus id=%.', NEW.id_bus;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bus_sin_parqueo ON buses;
CREATE TRIGGER trg_bus_sin_parqueo
  BEFORE UPDATE OF id_parqueo ON buses
  FOR EACH ROW EXECUTE FUNCTION fn_bus_sin_parqueo();

-- =============================================================================
-- TRIGGER 3: Flota por línea — mínimo = nº estaciones, máximo = 2× estaciones
-- =============================================================================
CREATE OR REPLACE FUNCTION fn_validar_flota_linea()
RETURNS TRIGGER AS $$
DECLARE
  v_total_buses     INT;
  v_total_estaciones INT;
BEGIN
  -- Solo aplica cuando el bus tiene una línea asignada
  IF NEW.id_linea IS NOT NULL THEN
    SELECT COUNT(*) INTO v_total_buses
    FROM buses
    WHERE id_linea = NEW.id_linea AND activo = TRUE AND id_bus != COALESCE(NEW.id_bus, 0);

    v_total_buses := v_total_buses + 1;

    SELECT COUNT(*) INTO v_total_estaciones
    FROM linea_estacion
    WHERE id_linea = NEW.id_linea;

    IF v_total_estaciones > 0 THEN
      IF v_total_buses < v_total_estaciones THEN
        RAISE EXCEPTION 'La línea id=% necesita mínimo % buses (uno por estación). Actual: %.', 
          NEW.id_linea, v_total_estaciones, v_total_buses;
      END IF;
      IF v_total_buses > (v_total_estaciones * 2) THEN
        RAISE EXCEPTION 'La línea id=% no puede tener más de % buses (2× estaciones). Actual: %.',
          NEW.id_linea, (v_total_estaciones * 2), v_total_buses;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_flota_linea ON buses;
CREATE TRIGGER trg_validar_flota_linea
  BEFORE INSERT OR UPDATE OF id_linea ON buses
  FOR EACH ROW EXECUTE FUNCTION fn_validar_flota_linea();

-- =============================================================================
-- TRIGGER 4: Acceso nunca puede quedar sin guardia activo
-- =============================================================================
CREATE OR REPLACE FUNCTION fn_acceso_sin_guardia()
RETURNS TRIGGER AS $$
DECLARE
  v_guardias_activos INT;
BEGIN
  -- Al desactivar un guardia_acceso, verificar que quede al menos uno activo
  IF NEW.activo = FALSE OR TG_OP = 'DELETE' THEN
    SELECT COUNT(*) INTO v_guardias_activos
    FROM guardia_acceso
    WHERE id_acceso = OLD.id_acceso
      AND activo = TRUE
      AND id_guardia_acceso != OLD.id_guardia_acceso;

    IF v_guardias_activos = 0 THEN
      RAISE EXCEPTION 'El acceso id=% debe tener al menos un guardia activo. No se puede desactivar el último guardia.', OLD.id_acceso;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_acceso_sin_guardia ON guardia_acceso;
CREATE TRIGGER trg_acceso_sin_guardia
  BEFORE UPDATE OF activo ON guardia_acceso
  FOR EACH ROW EXECUTE FUNCTION fn_acceso_sin_guardia();
