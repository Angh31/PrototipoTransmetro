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

// Traducciones de la vista pública (idiomas más frecuentes entre visitantes en Guatemala)
const T = {
  es: {
    subHeader: 'Información Pública · Pasajeros', enVivo: 'En vivo', acceso: 'Acceso al Sistema',
    titulo: 'Red Transmetro Guatemala',
    subtitulo: 'Consulta de líneas, estaciones y alertas activas del servicio en tiempo real.',
    lineasActivas: 'Líneas activas', estaciones: 'Estaciones', busesServicio: 'Buses en servicio', alertasActivas: 'Alertas activas',
    lineasDisponibles: 'Líneas disponibles', paradas: 'paradas', buses: 'buses',
    distancia: 'Distancia', paradasCol: 'Paradas', busesCol: 'Buses', municipio: 'Municipio',
    recorrido: 'Recorrido', cargando: 'Cargando…',
    mapaRed: 'Mapa de la red', estacionesGeo: 'estaciones geolocalizadas', ampliar: '↗ Ampliar mapa', verMapa: '🗺 Ver mapa',
    avisos: 'Avisos al público', sinAvisos: '✓ Sin avisos por el momento', verAvisos: '🔔 Avisos',
    mapaTitulo: 'Mapa de la red Transmetro', cerrar: '✕ Cerrar', cargandoPublica: 'Cargando información pública...',
  },
  en: {
    subHeader: 'Public Information · Passengers', enVivo: 'Live', acceso: 'System Access',
    titulo: 'Transmetro Network · Guatemala',
    subtitulo: 'Check lines, stations and active service alerts in real time.',
    lineasActivas: 'Active lines', estaciones: 'Stations', busesServicio: 'Buses in service', alertasActivas: 'Active alerts',
    lineasDisponibles: 'Available lines', paradas: 'stops', buses: 'buses',
    distancia: 'Distance', paradasCol: 'Stops', busesCol: 'Buses', municipio: 'Municipality',
    recorrido: 'Route', cargando: 'Loading…',
    mapaRed: 'Network map', estacionesGeo: 'geolocated stations', ampliar: '↗ Expand map', verMapa: '🗺 View map',
    avisos: 'Public notices', sinAvisos: '✓ No notices at the moment', verAvisos: '🔔 Notices',
    mapaTitulo: 'Transmetro network map', cerrar: '✕ Close', cargandoPublica: 'Loading public information...',
  },
};

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
    <div className="publico-stat-value" style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', fontWeight: 700, color: accent, lineHeight: 1 }}>
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
  const [idioma, setIdioma]   = useState(() => localStorage.getItem('transmetro_idioma') || 'es');
  const t = T[idioma] || T.es;

  const cambiarIdioma = (lang) => { setIdioma(lang); localStorage.setItem('transmetro_idioma', lang); };

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
        {t.cargandoPublica}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Cinta institucional Transmetro (acento de marca oficial) ──────── */}
      <div style={{
        height: '4px', width: '100%',
        background: 'linear-gradient(90deg, #00A859 0%, #00A859 55%, #F58220 55%, #F58220 100%)',
        position: 'sticky', top: 0, zIndex: 6,
      }} />

      {/* ── Header pública ─────────────────────────────────────────────────── */}
      <header className="publico-header" style={{
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: '4px', zIndex: 5,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo-transmetro.png" alt="Transmetro" style={{ width: '38px', height: '38px', objectFit: 'contain' }}
            onError={e => e.target.style.display='none'} />
          <div>
            <div style={{ fontFamily: 'var(--font-d)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--cyan)', letterSpacing: '0.04em' }}>TRANSMETRO</div>
            <div className="publico-header-brand-sub" style={{ fontSize: '0.66rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t.subHeader}</div>
          </div>
        </div>
        <div className="publico-header-ctrls" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Selector de idioma */}
          <div style={{ display: 'flex', border: '1px solid var(--border2)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
            {['es', 'en'].map(lang => (
              <button key={lang} onClick={() => cambiarIdioma(lang)} style={{
                padding: '5px 10px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-d)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em',
                background: idioma === lang ? 'var(--cyan)' : 'transparent',
                color: idioma === lang ? '#030810' : 'var(--text3)',
              }}>{lang.toUpperCase()}</button>
            ))}
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--green)', fontSize: '0.75rem' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
            {t.enVivo} · {clock}
          </span>
          <button onClick={() => document.getElementById('seccion-avisos')?.scrollIntoView({ behavior: 'smooth' })} style={{
            fontFamily: 'var(--font-d)', fontSize: '0.78rem', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'var(--cyan)', background: 'var(--surface2)',
            border: '1px solid var(--cyan2)', borderRadius: 'var(--r)', padding: '6px 14px', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}>
            {t.verAvisos}
            {data?.alertas?.length > 0 && (
              <span style={{ background: 'var(--red)', color: '#fff', borderRadius: '10px', padding: '0 6px', fontSize: '0.68rem' }}>{data.alertas.length}</span>
            )}
          </button>
          <button onClick={() => setMapaModal(true)} style={{
            fontFamily: 'var(--font-d)', fontSize: '0.78rem', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: '#030810', background: 'var(--cyan)', border: 'none',
            borderRadius: 'var(--r)', padding: '6px 14px', cursor: 'pointer',
          }}>{t.verMapa}</button>
          <Link to="/login" title={t.acceso} style={{
            fontFamily: 'var(--font-d)', fontSize: '0.78rem', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'var(--cyan)', textDecoration: 'none',
            border: '1px solid var(--cyan2)', borderRadius: 'var(--r)', padding: '6px 14px',
          }}>{t.acceso}</Link>
        </div>
      </header>

      <div className="publico-body" style={{ padding: '24px 28px', maxWidth: '1280px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 className="publico-titulo" style={{ fontFamily: 'var(--font-d)', fontSize: '1.7rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.03em' }}>
            {t.titulo}
          </h1>
          <p className="publico-subtitulo" style={{ fontSize: '0.9rem', color: 'var(--text2)', marginTop: '4px' }}>
            {t.subtitulo}
          </p>
        </div>

        {/* KPIs */}
        <div className="publico-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <Stat label={t.lineasActivas}    value={data?.metricas?.lineas}             accent="var(--cyan)" />
          <Stat label={t.estaciones}        value={data?.metricas?.estaciones}         accent="var(--cyan)" />
          <Stat label={t.busesServicio}     value={data?.metricas?.buses_en_servicio}  accent="var(--green)" />
          <Stat label={t.alertasActivas}    value={data?.metricas?.alertas_activas}    accent={data?.metricas?.alertas_activas > 0 ? 'var(--red)' : 'var(--green)'} />
        </div>

        <div className="publico-split" style={{ display: 'grid', gridTemplateColumns: lineaSel ? '1fr 380px' : '1fr', gap: '16px' }}>

          {/* Lista de líneas */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '14px', color: 'var(--text)' }}>
              {t.lineasDisponibles}
            </div>
            <div className="publico-lineas" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
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
                    <span>{l.total_estaciones} {t.paradas}</span>
                    <span>{l.total_buses} {t.buses}</span>
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
                <div style={{ color: 'var(--text3)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>{t.cargando}</div>
              ) : (
                <>
                  <div className="publico-detalle-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                    {[
                      [t.distancia, detalle.distancia_km ? `${detalle.distancia_km} km` : '—'],
                      [t.paradasCol, detalle.estaciones.length],
                      [t.busesCol,   detalle.total_buses],
                      [t.municipio,  detalle.municipio],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '9px 11px' }}>
                        <div style={{ fontSize: '0.67rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}</div>
                        <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginTop: '2px' }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {detalle.estaciones.length > 0 && (
                    <>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{t.recorrido}</div>
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
        <div id="seccion-avisos" style={{ marginTop: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', scrollMarginTop: '70px' }}>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '14px', color: 'var(--text)' }}>
            {t.avisos}
          </div>
          {(!data?.alertas || data.alertas.length === 0) ? (
            <div style={{ color: 'var(--text3)', fontSize: '0.85rem', textAlign: 'center', padding: '14px' }}>
              {t.sinAvisos}
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

        {/* Mapa interactivo de la red (compacto + botón ampliar) */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text)' }}>
                {t.mapaRed}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{data?.estaciones?.filter(e => e.lat).length || 0} {t.estacionesGeo}</span>
            </div>
            <button onClick={() => setMapaModal(true)} style={{
              fontFamily: 'var(--font-d)', fontSize: '0.74rem', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--cyan)', background: 'var(--surface2)',
              border: '1px solid var(--cyan2)', borderRadius: 'var(--r)',
              padding: '6px 14px', cursor: 'pointer',
            }}>{t.ampliar}</button>
          </div>
          <MapaRed estaciones={data?.estaciones || []} recorridos={data?.recorridos || []} alto={320} />
        </div>

        <footer style={{
          marginTop: '32px', textAlign: 'center', fontSize: '0.72rem',
          color: 'var(--text3)', letterSpacing: '0.06em',
          borderTop: '2px solid #00A859', paddingTop: '14px',
        }}>
          <span style={{ color: '#00A859', fontWeight: 600 }}>●</span> Sistema de Control Integral Transmetro · Municipalidad de Guatemala · 2026
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
              {t.mapaTitulo}
            </div>
            <button onClick={() => setMapaModal(false)} style={{
              fontFamily: 'var(--font-d)', fontSize: '0.8rem', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--text2)', background: 'var(--surface2)',
              border: '1px solid var(--border)', borderRadius: 'var(--r)',
              padding: '8px 16px', cursor: 'pointer',
            }}>{t.cerrar}</button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <MapaRed estaciones={data?.estaciones || []} recorridos={data?.recorridos || []} alto="100%" />
          </div>
        </div>
      )}
    </div>
  );
}
