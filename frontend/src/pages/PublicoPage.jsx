/**
 * @file pages/PublicoPage.jsx
 * @description Vista pública de pasajeros (sin login)
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import MapaRed from '../components/map/MapaRed';

const NIVEL_COLOR = { critica: 'var(--red)', alta: 'var(--red)', media: 'var(--amber)', baja: 'var(--green)' };

const Stat = ({ label, value, accent = 'var(--cyan)' }) => (
  <div style={{
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--r2)', padding: '18px 20px', position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
      background: `linear-gradient(90deg, ${accent}, transparent)` }} />
    <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
      {label}
    </div>
    <div style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', fontWeight: 700, color: accent, lineHeight: 1 }}>
      {value ?? '—'}
    </div>
  </div>
);

export default function PublicoPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [lineaSel, setLineaSel] = useState(null);
  const [detalle, setDetalle]   = useState(null);
  const [clock, setClock]     = useState('');
  const [mapaModal, setMapaModal] = useState(false);

  const cargar = () => {
    api.get('/publico/red')
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, 30000); // refresco cada 30s
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const verLinea = async (linea) => {
    setLineaSel(linea);
    setDetalle(null);
    const r = await api.get(`/publico/lineas/${linea.id_linea}`);
    setDetalle(r.data.data);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', gap: '10px' }}>
        <div style={{ width: '18px', height: '18px', border: '2px solid var(--border2)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        Cargando información pública...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Header pública ─────────────────────────────────────────────────── */}
      <header style={{
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 5,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo-transmetro.png" alt="Transmetro" style={{ width: '38px', height: '38px', objectFit: 'contain' }}
            onError={e => e.target.style.display='none'} />
          <div>
            <div style={{ fontFamily: 'var(--font-d)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--cyan)', letterSpacing: '0.04em' }}>TRANSMETRO</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Información Pública · Pasajeros</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--green)', fontSize: '0.75rem' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
            En vivo · {clock}
          </span>
          <Link to="/login" style={{
            fontFamily: 'var(--font-d)', fontSize: '0.78rem', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'var(--cyan)', textDecoration: 'none',
            border: '1px solid var(--cyan2)', borderRadius: 'var(--r)', padding: '6px 14px',
          }}>Acceso al Sistema</Link>
        </div>
      </header>

      <div style={{ padding: '24px 28px', maxWidth: '1280px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '1.7rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.03em' }}>
            Red Transmetro Guatemala
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text2)', marginTop: '4px' }}>
            Consulta de líneas, estaciones y alertas activas del servicio en tiempo real.
          </p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <Stat label="Líneas activas"     value={data?.metricas?.lineas}             accent="var(--cyan)" />
          <Stat label="Estaciones"          value={data?.metricas?.estaciones}         accent="var(--cyan)" />
          <Stat label="Buses en servicio"   value={data?.metricas?.buses_en_servicio}  accent="var(--green)" />
          <Stat label="Alertas activas"     value={data?.metricas?.alertas_activas}    accent={data?.metricas?.alertas_activas > 0 ? 'var(--red)' : 'var(--green)'} />
        </div>

        {/* Mapa interactivo de la red (compacto + botón ampliar) */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text)' }}>
                Mapa de la red
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{data?.estaciones?.filter(e => e.lat).length || 0} estaciones geolocalizadas</span>
            </div>
            <button onClick={() => setMapaModal(true)} style={{
              fontFamily: 'var(--font-d)', fontSize: '0.74rem', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--cyan)', background: 'var(--surface2)',
              border: '1px solid var(--cyan2)', borderRadius: 'var(--r)',
              padding: '6px 14px', cursor: 'pointer',
            }}>↗ Ampliar mapa</button>
          </div>
          <MapaRed estaciones={data?.estaciones || []} recorridos={data?.recorridos || []} alto={320} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: lineaSel ? '1fr 380px' : '1fr', gap: '16px' }}>

          {/* Lista de líneas */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '14px', color: 'var(--text)' }}>
              Líneas disponibles
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
              {data?.lineas?.map(l => (
                <button key={l.id_linea} onClick={() => verLinea(l)}
                  style={{
                    background: lineaSel?.id_linea === l.id_linea ? 'var(--cyan-dim)' : 'var(--bg3)',
                    border: `1px solid ${lineaSel?.id_linea === l.id_linea ? 'var(--cyan2)' : 'var(--border)'}`,
                    borderRadius: 'var(--r)', padding: '12px 14px', textAlign: 'left',
                    cursor: 'pointer', color: 'var(--text)', transition: 'all 0.15s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-d)', fontWeight: 700, fontSize: '1rem', color: 'var(--cyan)' }}>{l.codigo}</span>
                    {l.distancia_km && <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{l.distancia_km} km</span>}
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text)', marginBottom: '6px' }}>{l.nombre}</div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: 'var(--text3)' }}>
                    <span>{l.total_estaciones} paradas</span>
                    <span>{l.total_buses} buses</span>
                    <span>{l.municipio}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detalle de línea */}
          {lineaSel && (
            <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', alignSelf: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--cyan)' }}>{lineaSel.codigo}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '2px' }}>{lineaSel.nombre}</div>
                </div>
                <button onClick={() => { setLineaSel(null); setDetalle(null); }}
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 'var(--r)', padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem' }}>✕</button>
              </div>

              {!detalle ? (
                <div style={{ color: 'var(--text3)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>Cargando…</div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                    {[
                      ['Distancia', detalle.distancia_km ? `${detalle.distancia_km} km` : '—'],
                      ['Paradas',   detalle.estaciones.length],
                      ['Buses',     detalle.total_buses],
                      ['Municipio', detalle.municipio],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '9px 11px' }}>
                        <div style={{ fontSize: '0.67rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}</div>
                        <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginTop: '2px' }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {detalle.estaciones.length > 0 && (
                    <>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Recorrido</div>
                      <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {detalle.estaciones.map((e, i) => (
                          <div key={e.id_estacion} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '7px 10px', background: 'var(--bg3)', borderRadius: 'var(--r)', fontSize: '0.82rem',
                          }}>
                            <span style={{ fontFamily: 'var(--font-d)', fontWeight: 700, color: 'var(--cyan)', minWidth: '22px', fontSize: '0.9rem' }}>{i + 1}</span>
                            <span style={{ color: 'var(--text)', flex: 1 }}>{e.nombre}</span>
                            <span style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>{e.capacidad_max} pax</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Alertas activas (avisos al público) */}
        <div style={{ marginTop: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px' }}>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '14px', color: 'var(--text)' }}>
            Avisos al público
          </div>
          {(!data?.alertas || data.alertas.length === 0) ? (
            <div style={{ color: 'var(--text3)', fontSize: '0.85rem', textAlign: 'center', padding: '14px' }}>
              ✓ Sin avisos por el momento
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.alertas.map(a => {
                const color = NIVEL_COLOR[a.nivel] || 'var(--text2)';
                return (
                  <div key={a.id_alerta} style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderLeft: `3px solid ${color}`, borderRadius: 'var(--r)',
                    padding: '10px 14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {a.tipo} · {a.nivel}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>
                        {new Date(a.created_at).toLocaleString('es-GT')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--text)' }}>{a.mensaje}</div>
                    {a.estacion_nombre && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text3)', marginTop: '3px' }}>📍 {a.estacion_nombre}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <footer style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text3)', letterSpacing: '0.06em' }}>
          Sistema de Control Integral Transmetro · Municipalidad de Guatemala · 2026 · @author Anghel CC
        </footer>
      </div>

      {/* Modal: mapa a pantalla grande */}
      {mapaModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', flexDirection: 'column', padding: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.03em' }}>
              Mapa de la red Transmetro
            </div>
            <button onClick={() => setMapaModal(false)} style={{
              fontFamily: 'var(--font-d)', fontSize: '0.8rem', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--text2)', background: 'var(--surface2)',
              border: '1px solid var(--border)', borderRadius: 'var(--r)',
              padding: '8px 16px', cursor: 'pointer',
            }}>✕ Cerrar</button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <MapaRed estaciones={data?.estaciones || []} recorridos={data?.recorridos || []} alto="100%" />
          </div>
        </div>
      )}
    </div>
  );
}
