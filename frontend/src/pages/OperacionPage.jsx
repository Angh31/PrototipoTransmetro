/**
 * @file pages/OperacionPage.jsx
 * @description Centro de Mando — Validación de REQ-0001, REQ-0005 y REQ-0006
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import { PageHeader, Btn, Loader, StatCard, Badge } from '../components/ui';

const inputStyle = {
  padding: '9px 12px', background: 'var(--bg3)',
  border: '1px solid var(--border)', color: 'var(--text)',
  borderRadius: 'var(--r)', fontFamily: 'var(--font-b)',
  fontSize: '0.88rem', outline: 'none', width: '100%',
};

const labelStyle = {
  display: 'block', fontSize: '0.7rem', fontWeight: 500,
  color: 'var(--text2)', letterSpacing: '0.1em',
  textTransform: 'uppercase', marginBottom: '6px',
};

const sectionTitle = {
  fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600,
  letterSpacing: '0.04em', color: 'var(--text)',
  borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '16px',
};

// Mapea la acción del resultado a un estado visual coherente con el tema oscuro
const resolverEstadoVisual = (resultado) => {
  if (!resultado) return null;
  if (resultado.accion === 'bloqueado') {
    return { titulo: 'BLOQUEO OPERATIVO', color: 'var(--red)', bg: 'var(--red-dim)', borde: 'rgba(255,59,48,0.35)' };
  }
  const accion = resultado.data?.accion;
  if (accion === 'despachar_urgente') {
    return { titulo: 'ALERTA · DESPACHO URGENTE', color: 'var(--red)', bg: 'var(--red-dim)', borde: 'rgba(255,59,48,0.35)' };
  }
  if (accion === 'esperar') {
    return { titulo: 'MODO EFICIENCIA · ESPERAR', color: 'var(--amber)', bg: 'var(--amber-dim)', borde: 'rgba(255,184,0,0.35)' };
  }
  return { titulo: 'DESPACHO NORMAL', color: 'var(--green)', bg: 'var(--green-dim)', borde: 'rgba(0,230,118,0.35)' };
};

export default function OperacionPage() {
  const [buses, setBuses]         = useState([]);
  const [estaciones, setEstaciones] = useState([]);
  const [loading, setLoading]     = useState(true);

  const [busSel, setBusSel] = useState('');
  const [estSel, setEstSel] = useState('');
  const [ocupBus, setOcupBus] = useState(10);
  const [ocupEst, setOcupEst] = useState(150);

  const [resultado, setResultado] = useState(null);
  const [ahorro, setAhorro]       = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [resB, resE, resA] = await Promise.all([
          api.get('/buses'),
          api.get('/estaciones'),
          api.get('/operacion/ahorro-combustible'),
        ]);
        setBuses(resB.data.data);
        setEstaciones(resE.data.data);
        setAhorro(resA.data.data);
        if (resB.data.data.length > 0) setBusSel(resB.data.data[0].id_bus);
        if (resE.data.data.length > 0) setEstSel(resE.data.data[0].id_estacion);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSimular = async (e) => {
    e.preventDefault();
    setResultado(null);
    try {
      const res = await api.post('/operacion/registro-estacion', {
        id_bus:             parseInt(busSel),
        id_estacion:        parseInt(estSel),
        ocupacion_bus:      parseInt(ocupBus),
        ocupacion_estacion: parseInt(ocupEst),
      });
      setResultado(res.data);
    } catch (err) {
      if (err.response?.data) setResultado(err.response.data);
      else alert('Error de conexión');
    }
  };

  if (loading) return <Loader />;

  const estado = resolverEstadoVisual(resultado);

  return (
    <div className="fade-up">
      <PageHeader
        title="Centro de Mando · Operación"
        subtitle="Registro de eventos y validación de reglas de operación"
      />

      <div style={{ padding: '20px 28px' }}>

        {/* KPIs ambientales arriba (flota eléctrica BYD) */}
        {ahorro && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <StatCard label="Buses eléctricos"      value={ahorro.buses_electricos}      accent="var(--green)" delay={1} />
            <StatCard label="Km diarios eléctricos" value={ahorro.distancia_diaria_km}   accent="var(--cyan)"  delay={2} />
            <StatCard label="Galones ahorrados/día" value={ahorro.galones_ahorrados_dia} accent="var(--green)" delay={3} sub="vs flota diésel" />
            <StatCard label="CO₂ evitado kg/día"    value={ahorro.co2_evitado_kg_dia}    accent="var(--cyan)"  delay={4} sub="por flota BYD" />
          </div>
        )}

        {/* Simulador */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Panel izquierdo: formulario */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px' }}>
            <div style={sectionTitle}>Registro de entrada / salida de bus</div>

            <form onSubmit={handleSimular} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              <div>
                <label style={labelStyle}>Bus en operación</label>
                <select value={busSel} onChange={e => setBusSel(e.target.value)} style={inputStyle}>
                  {buses.map(b => (
                    <option key={b.id_bus} value={b.id_bus}>
                      {b.placa} {b.es_electrico ? '⚡' : ''} · {b.parqueo ? `Parqueo: ${b.parqueo}` : 'SIN PARQUEO'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Estación de llegada</label>
                <select value={estSel} onChange={e => setEstSel(e.target.value)} style={inputStyle}>
                  {estaciones.map(e => (
                    <option key={e.id_estacion} value={e.id_estacion}>{e.nombre} · cap. {e.capacidad_max}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Pasajeros en bus</label>
                  <input type="number" min="0" value={ocupBus}
                    onChange={e => setOcupBus(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Ocupación estación (torniquetes)</label>
                  <input type="number" min="0" value={ocupEst}
                    onChange={e => setOcupEst(e.target.value)} style={inputStyle}
                    title="Ingresos en torniquetes (Tarjeta Ciudadana) menos salidas" />
                </div>
              </div>

              <div style={{ marginTop: '6px' }}>
                <Btn type="submit">Evaluar reglas y registrar</Btn>
              </div>
            </form>
          </div>

          {/* Panel derecho: resultado */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px' }}>
            <div style={sectionTitle}>Resolución del sistema</div>

            {!resultado ? (
              <div style={{
                padding: '36px', textAlign: 'center',
                color: 'var(--text3)', fontSize: '0.88rem',
                background: 'var(--bg3)', borderRadius: 'var(--r)',
                border: '1px dashed var(--border2)',
              }}>
                Completa el formulario para evaluar las reglas críticas de operación.
              </div>
            ) : (
              <div className="fade-up" style={{
                padding: '18px',
                borderRadius: 'var(--r2)',
                background: estado.bg,
                border: `1px solid ${estado.borde}`,
                borderLeft: `3px solid ${estado.color}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Badge color={estado.color}>{estado.titulo}</Badge>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.5 }}>
                  {resultado.mensaje || resultado.data?.justificacion}
                </div>
                {resultado.data && (
                  <div style={{
                    marginTop: '14px', padding: '10px 12px',
                    background: 'var(--surface2)', borderRadius: 'var(--r)', fontSize: '0.83rem',
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                      Métricas evaluadas
                    </div>
                    <div style={{ display: 'flex', gap: '18px', color: 'var(--text)' }}>
                      <span>Carga del bus: <strong style={{ color: estado.color }}>{resultado.data.pctBus}%</strong></span>
                      <span>Saturación estación: <strong style={{ color: estado.color }}>{resultado.data.pctEstacion}%</strong></span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
