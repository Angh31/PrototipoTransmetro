/**
 * @file pages/MonitoreoPage.jsx
 * @description Centro de monitoreo de cámaras por estación (simulación visual)
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { useEffect, useState } from 'react';
import api from '../services/api';
import { PageHeader, StatCard, Loader } from '../components/ui';

const IconoCamara = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

// Ocupación simulada estable que va variando con el "pulso"
const personasSimuladas = (capacidad, pulso, i) =>
  Math.max(0, Math.round((capacidad || 100) * (0.25 + 0.4 * Math.abs(Math.sin(pulso * 0.6 + i)))));

function CamaraTile({ estacion, indice, reloj, pulso }) {
  const personas = personasSimuladas(estacion.capacidad_max, pulso, indice);
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden' }}>
      {/* Área de "video" */}
      <div style={{
        position: 'relative', aspectRatio: '16 / 9',
        background: 'radial-gradient(circle at 50% 40%, #0d1c2a 0%, #060b11 100%)',
        overflow: 'hidden',
      }}>
        {/* rejilla */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }} />
        {/* línea de barrido */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 0, height: '40px',
          background: 'linear-gradient(180deg, rgba(0,212,255,0.10), transparent)',
          animation: `scanline ${3 + (indice % 3)}s linear infinite`,
        }} />
        {/* ícono cámara */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', opacity: 0.3 }}>
          <IconoCamara />
        </div>
        {/* EN VIVO */}
        <div style={{ position: 'absolute', top: 8, left: 10, display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-d)', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'var(--red)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 6px var(--red)', animation: 'blinkRec 1.4s infinite' }} />
          EN VIVO
        </div>
        <div style={{ position: 'absolute', top: 8, right: 10, fontFamily: 'var(--font-d)', fontSize: '0.6rem', color: 'var(--text2)', letterSpacing: '0.08em' }}>
          CAM-{String(indice + 1).padStart(2, '0')}
        </div>
        <div style={{ position: 'absolute', bottom: 8, left: 10, fontSize: '0.62rem', color: 'var(--cyan)' }}>
          ● {personas} personas
        </div>
        <div style={{ position: 'absolute', bottom: 8, right: 10, fontFamily: 'var(--font-d)', fontSize: '0.62rem', color: 'var(--text2)' }}>
          {reloj}
        </div>
      </div>
      {/* Pie */}
      <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{estacion.nombre}</span>
        <span style={{ fontSize: '0.66rem', color: 'var(--text3)' }}>{estacion.municipio}</span>
      </div>
    </div>
  );
}

export default function MonitoreoPage() {
  const [estaciones, setEstaciones] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [reloj, setReloj]           = useState('');
  const [pulso, setPulso]           = useState(0);

  useEffect(() => {
    api.get('/estaciones').then(r => setEstaciones(r.data.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const tick = () => setReloj(new Date().toLocaleTimeString('es-GT'));
    tick();
    const idR = setInterval(tick, 1000);
    const idP = setInterval(() => setPulso(p => p + 1), 4000);
    return () => { clearInterval(idR); clearInterval(idP); };
  }, []);

  if (loading) return <Loader />;

  const camaras = estaciones.slice(0, 12); // tablero de hasta 12 cámaras
  const totalPersonas = camaras.reduce((s, e, i) => s + personasSimuladas(e.capacidad_max, pulso, i), 0);

  return (
    <div className="fade-up">
      <PageHeader
        title="Centro de Monitoreo · Cámaras"
        subtitle="Vigilancia en vivo de las estaciones de la red"
      />
      <div style={{ padding: '20px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          <StatCard label="Cámaras activas"     value={camaras.length}        accent="var(--cyan)"  delay={1} />
          <StatCard label="Estado del enlace"   value="EN LÍNEA"              accent="var(--green)" delay={2} />
          <StatCard label="Personas detectadas" value={totalPersonas}         accent="var(--cyan)"  delay={3} sub="en estaciones monitoreadas" />
          <StatCard label="Última señal"        value={reloj}                 accent="var(--green)" delay={4} valueSize="1.3rem" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {camaras.map((e, i) => (
            <CamaraTile key={e.id_estacion} estacion={e} indice={i} reloj={reloj} pulso={pulso} />
          ))}
        </div>

        <p style={{ marginTop: '16px', fontSize: '0.72rem', color: 'var(--text3)' }}>
          Vista de demostración. En producción, cada recuadro mostraría la transmisión en vivo de la cámara de la estación, con conteo de personas por visión por computadora.
        </p>
      </div>
    </div>
  );
}
