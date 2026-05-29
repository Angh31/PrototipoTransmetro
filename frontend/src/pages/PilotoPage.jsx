/**
 * @file pages/PilotoPage.jsx
 * @description Vista del Piloto — consulta de rutas/turnos y registro de recorridos
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { useEffect, useState } from 'react';
import api from '../services/api';
import { PageHeader, StatCard, Loader, Badge, Btn } from '../components/ui';

const TURNOS = [
  { nombre: 'Turno mañana', horario: '05:00 – 13:00' },
  { nombre: 'Turno tarde',  horario: '13:00 – 21:00' },
];

export default function PilotoPage() {
  const [lineas, setLineas]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel]         = useState(null);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    api.get('/lineas').then(r => setLineas(r.data.data)).finally(() => setLoading(false));
  }, []);

  const verLinea = async (l) => {
    setSel(l); setDetalle(null);
    const r = await api.get(`/lineas/${l.id_linea}`);
    setDetalle(r.data.data);
  };

  const registrarRecorrido = () => {
    window.dispatchEvent(new CustomEvent('app:toast', {
      detail: { message: `Recorrido registrado en ${sel?.codigo || 'la línea'} — ${new Date().toLocaleTimeString('es-GT')}`, kind: 'success' },
    }));
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-up">
      <PageHeader title="Mi Operación · Piloto" subtitle="Consulta de rutas y turnos asignados · registro de recorridos" />
      <div style={{ padding: '20px 28px' }}>

        {/* Turnos del día */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          {TURNOS.map((t, i) => (
            <StatCard key={t.nombre} label={t.nombre} value={t.horario} accent={i === 0 ? 'var(--cyan)' : 'var(--amber)'} delay={i + 1} valueSize="1.3rem" />
          ))}
          <StatCard label="Líneas en servicio" value={lineas.filter(l => l.activa).length} accent="var(--green)" delay={3} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: sel ? '1fr 360px' : '1fr', gap: '16px' }}>
          {/* Líneas */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text)', marginBottom: '14px' }}>
              Rutas disponibles
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {lineas.map(l => (
                <button key={l.id_linea} onClick={() => verLinea(l)} style={{
                  background: sel?.id_linea === l.id_linea ? 'var(--cyan-dim)' : 'var(--bg3)',
                  border: `1px solid ${sel?.id_linea === l.id_linea ? 'var(--cyan2)' : 'var(--border)'}`,
                  borderRadius: 'var(--r)', padding: '12px 14px', textAlign: 'left', cursor: 'pointer', color: 'var(--text)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-d)', fontWeight: 700, color: 'var(--cyan)' }}>{l.codigo}</span>
                    {l.distancia_km && <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{l.distancia_km} km</span>}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{l.nombre}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: '4px' }}>{l.total_estaciones} paradas · {l.total_buses} buses</div>
                </button>
              ))}
            </div>
          </div>

          {/* Detalle de la ruta */}
          {sel && (
            <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', alignSelf: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--cyan)' }}>{sel.codigo}</div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text2)' }}>{sel.nombre}</div>
                </div>
                <Btn small ghost onClick={() => { setSel(null); setDetalle(null); }}>✕</Btn>
              </div>

              <Btn small onClick={registrarRecorrido}>Registrar recorrido</Btn>

              {!detalle ? (
                <div style={{ color: 'var(--text3)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>Cargando…</div>
              ) : detalle.estaciones?.length > 0 && (
                <>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '16px 0 8px' }}>Recorrido ({detalle.estaciones.length} paradas)</div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {detalle.estaciones.map((e, i) => (
                      <div key={e.id_estacion} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px', background: 'var(--bg3)', borderRadius: 'var(--r)', fontSize: '0.82rem' }}>
                        <span style={{ fontFamily: 'var(--font-d)', fontWeight: 700, color: 'var(--cyan)', minWidth: '22px' }}>{i + 1}</span>
                        <span style={{ color: 'var(--text)', flex: 1 }}>{e.nombre}</span>
                        {e.distancia_km && <span style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>{e.distancia_km} km</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
