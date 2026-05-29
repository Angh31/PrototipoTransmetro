/**
 * @file pages/GuardiaPage.jsx
 * @description Vista del Guardia — control de accesos y guardias por estación
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

export default function GuardiaPage() {
  const [estaciones, setEstaciones] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [sel, setSel]               = useState(null);
  const [detalle, setDetalle]       = useState(null);

  useEffect(() => {
    api.get('/estaciones').then(r => setEstaciones(r.data.data)).finally(() => setLoading(false));
  }, []);

  const verEstacion = async (e) => {
    setSel(e); setDetalle(null);
    const r = await api.get(`/estaciones/${e.id_estacion}`);
    setDetalle(r.data.data);
  };

  const registrarNovedad = () => {
    window.dispatchEvent(new CustomEvent('app:toast', {
      detail: { message: `Novedad registrada en ${sel?.nombre || 'la estación'} — ${new Date().toLocaleTimeString('es-GT')}`, kind: 'success' },
    }));
  };

  if (loading) return <Loader />;

  const totalAccesos = estaciones.reduce((s, e) => s + (e.total_accesos || 0), 0);

  return (
    <div className="fade-up">
      <PageHeader title="Control de Accesos · Guardia" subtitle="Monitoreo de accesos y guardias asignados por estación" />
      <div style={{ padding: '20px 28px' }}>

        {/* Turnos del día */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          {TURNOS.map((t, i) => (
            <StatCard key={t.nombre} label={t.nombre} value={t.horario} accent={i === 0 ? 'var(--cyan)' : 'var(--amber)'} delay={i + 1} valueSize="1.3rem" />
          ))}
          <StatCard label="Estaciones activas" value={estaciones.filter(e => e.activa).length} accent="var(--green)" delay={3} />
          <StatCard label="Accesos en la red" value={totalAccesos} accent="var(--cyan)" delay={4} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: sel ? '1fr 360px' : '1fr', gap: '16px' }}>
          {/* Estaciones */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text)', marginBottom: '14px' }}>
              Estaciones a cargo
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
              {estaciones.map(e => (
                <button key={e.id_estacion} onClick={() => verEstacion(e)} style={{
                  background: sel?.id_estacion === e.id_estacion ? 'var(--cyan-dim)' : 'var(--bg3)',
                  border: `1px solid ${sel?.id_estacion === e.id_estacion ? 'var(--cyan2)' : 'var(--border)'}`,
                  borderRadius: 'var(--r)', padding: '12px 14px', textAlign: 'left', cursor: 'pointer', color: 'var(--text)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>{e.nombre}</span>
                    <Badge color={e.activa ? 'var(--green)' : 'var(--text3)'}>{e.activa ? 'Activa' : 'Inactiva'}</Badge>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: '4px' }}>{e.municipio} · {e.total_accesos} accesos</div>
                </button>
              ))}
            </div>
          </div>

          {/* Detalle de la estación */}
          {sel && (
            <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', alignSelf: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--cyan)' }}>{sel.nombre}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>{detalle?.municipio ?? sel.municipio}</div>
                </div>
                <Btn small ghost onClick={() => { setSel(null); setDetalle(null); }}>✕</Btn>
              </div>

              <Btn small onClick={registrarNovedad}>Registrar novedad</Btn>

              {!detalle ? (
                <div style={{ color: 'var(--text3)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>Cargando…</div>
              ) : (
                <>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '16px 0 8px' }}>
                    Accesos y guardias ({detalle.accesos?.length || 0})
                  </div>
                  {detalle.accesos?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {detalle.accesos.map(a => (
                        <div key={a.id_acceso} style={{ padding: '9px 12px', background: 'var(--bg3)', borderRadius: 'var(--r)', borderLeft: '2px solid var(--border2)' }}>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text)', marginBottom: '4px' }}>{a.descripcion}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {(a.guardias || []).map((g, i) => (
                              <span key={i} style={{ fontSize: '0.7rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 7px', color: 'var(--text2)' }}>
                                {g.nombre} · {g.turno}
                              </span>
                            ))}
                            {(!a.guardias || a.guardias.length === 0) && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--red)' }}>⚠ Sin guardia asignado</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text3)', fontSize: '0.82rem', textAlign: 'center', padding: '12px' }}>Esta estación no tiene accesos registrados.</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
