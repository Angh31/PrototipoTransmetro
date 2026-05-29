/**
 * @file pages/TarjetaPage.jsx
 * @description Detección de Tarjeta Ciudadana — validaciones en tiempo real (simulación)
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { PageHeader, StatCard, Loader, Badge } from '../components/ui';

const TARIFA = 1.00; // Q por pasaje

const IconoTarjeta = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

export default function TarjetaPage() {
  const [estaciones, setEstaciones]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [validaciones, setValidaciones] = useState([]);
  const [total, setTotal]               = useState(0);
  const [porEstacion, setPorEstacion]   = useState({});
  const estRef = useRef([]);

  useEffect(() => {
    api.get('/estaciones').then(r => { setEstaciones(r.data.data); estRef.current = r.data.data; }).finally(() => setLoading(false));
  }, []);

  // Genera validaciones simuladas en tiempo real
  useEffect(() => {
    const id = setInterval(() => {
      const lista = estRef.current;
      if (!lista.length) return;
      const est = lista[Math.floor(Math.random() * lista.length)];
      const v = {
        id: Date.now() + Math.random(),
        tarjeta: '**** **** ' + Math.floor(1000 + Math.random() * 9000),
        estacion: est.nombre,
        hora: new Date().toLocaleTimeString('es-GT'),
      };
      setValidaciones(prev => [v, ...prev].slice(0, 20));
      setTotal(t => t + 1);
      setPorEstacion(prev => ({ ...prev, [est.nombre]: (prev[est.nombre] || 0) + 1 }));
    }, 1700);
    return () => clearInterval(id);
  }, []);

  if (loading) return <Loader />;

  const ranking = Object.entries(porEstacion).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxRank = Math.max(1, ...ranking.map(r => r[1]));
  const recaudacion = (total * TARIFA).toFixed(2);

  return (
    <div className="fade-up">
      <PageHeader
        title="Tarjeta Ciudadana · Validaciones"
        subtitle="Detección de pasajes en tiempo real en los accesos de la red"
      />
      <div style={{ padding: '20px 28px' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          <StatCard label="Validaciones (sesión)" value={total}             accent="var(--cyan)"  delay={1} />
          <StatCard label="Recaudación estimada"  value={`Q ${recaudacion}`} accent="var(--green)" delay={2} />
          <StatCard label="Tarifa"                value="Q 1.00"            accent="var(--cyan)"  delay={3} />
          <StatCard label="Estaciones activas"    value={estaciones.length} accent="var(--green)" delay={4} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>

          {/* Feed de validaciones */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text)' }}>
                Validaciones en vivo
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--green)', fontSize: '0.72rem' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', animation: 'blinkRec 1.4s infinite' }} />
                Tiempo real
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '420px', overflowY: 'auto' }}>
              {validaciones.length === 0 ? (
                <div style={{ color: 'var(--text3)', fontSize: '0.85rem', textAlign: 'center', padding: '30px' }}>Esperando validaciones…</div>
              ) : validaciones.map((v, idx) => (
                <div key={v.id} className={idx === 0 ? 'fade-up' : ''} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', background: 'var(--bg3)', borderRadius: 'var(--r)',
                  borderLeft: '3px solid var(--cyan)',
                }}>
                  <span style={{ color: 'var(--cyan)' }}><IconoTarjeta /></span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text)' }}>{v.tarjeta}</span>
                  <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text2)' }}>📍 {v.estacion}</span>
                  <Badge color="var(--green)">Q 1.00</Badge>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'var(--font-d)' }}>{v.hora}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking por estación */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', alignSelf: 'start' }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text)', marginBottom: '14px' }}>
              Validaciones por estación
            </div>
            {ranking.length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>Sin datos aún</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ranking.map(([nombre, n], i) => (
                  <div key={nombre} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-d)', fontWeight: 700, color: 'var(--cyan)', minWidth: '18px', fontSize: '0.82rem' }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nombre}</span>
                    <div style={{ width: '70px', height: '7px', background: 'var(--bg3)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(n / maxRank) * 100}%`, height: '100%', background: 'var(--cyan2)' }} />
                    </div>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text3)', minWidth: '22px', textAlign: 'right' }}>{n}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p style={{ marginTop: '16px', fontSize: '0.72rem', color: 'var(--text3)' }}>
          Vista de demostración. En producción, cada validación llega automáticamente desde los validadores de Tarjeta Ciudadana en los torniquetes, y alimenta el cálculo de ocupación de la estación.
        </p>
      </div>
    </div>
  );
}
