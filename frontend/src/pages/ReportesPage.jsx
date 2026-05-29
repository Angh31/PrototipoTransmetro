/**
 * @file pages/ReportesPage.jsx
 * @description Reportes y estadísticas por rango de fecha (admin / supervisor)
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../services/api';
import { PageHeader, StatCard, Loader, Badge, Btn } from '../components/ui';

const RANGOS = [['hoy', 'Hoy'], ['semana', 'Semana'], ['mes', 'Mes']];
const TIPO_COLOR = { capacidad: 'var(--red)', espera: 'var(--amber)', seguridad: 'var(--cyan)', operacional: 'var(--text2)' };

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '8px 12px', fontSize: '0.8rem' }}>
      <div style={{ color: 'var(--text2)', marginBottom: '2px' }}>{label}</div>
      <div style={{ color: 'var(--cyan)', fontWeight: 600 }}>{payload[0]?.value} alertas</div>
    </div>
  );
};

const Panel = ({ title, children }) => (
  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px' }}>
    <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '16px', color: 'var(--text)' }}>{title}</div>
    {children}
  </div>
);

export default function ReportesPage() {
  const [rango, setRango]     = useState('semana');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/reportes?rango=${rango}`).then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, [rango]);

  const maxTipo = Math.max(1, ...(data?.por_tipo?.map(t => parseInt(t.total)) || [1]));
  const maxEst  = Math.max(1, ...(data?.por_estacion?.map(e => parseInt(e.total)) || [1]));

  const nombreRango = { hoy: 'Hoy', semana: 'Última semana', mes: 'Último mes' }[rango] || rango;

  const exportarCSV = () => {
    if (!data) return;
    const L = [];
    L.push(`Reporte Transmetro - ${nombreRango}`);
    L.push(`Generado,${new Date().toLocaleString('es-GT')}`);
    L.push('');
    L.push('RESUMEN');
    L.push(`Alertas en el periodo,${data.resumen.total}`);
    L.push(`Resueltas,${data.resumen.resueltas}`);
    L.push(`Criticas/altas,${data.resumen.criticas}`);
    L.push(`Sin resolver,${data.resumen.activas}`);
    L.push('');
    L.push('ALERTAS POR DIA');
    L.push('Dia,Total');
    (data.por_dia || []).forEach(d => L.push(`${d.dia},${d.total}`));
    L.push('');
    L.push('ALERTAS POR TIPO');
    L.push('Tipo,Total');
    (data.por_tipo || []).forEach(t => L.push(`${t.tipo},${t.total}`));
    L.push('');
    L.push('ESTACIONES CON MAS ALERTAS');
    L.push('Estacion,Total');
    (data.por_estacion || []).forEach(e => L.push(`${e.nombre},${e.total}`));
    const blob = new Blob(['﻿' + L.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_transmetro_${rango}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-up">
      <PageHeader
        title="Reportes y Estadísticas"
        subtitle="Indicadores operativos por rango de fecha"
        actions={
          <>
            <Btn small ghost onClick={() => window.print()} disabled={!data}>🖨 Imprimir / PDF</Btn>
            <Btn small onClick={exportarCSV} disabled={!data}>⤓ Exportar CSV</Btn>
          </>
        }
      />

      <div style={{ padding: '20px 28px' }}>

        {/* Selector de rango */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {RANGOS.map(([k, l]) => (
            <button key={k} onClick={() => setRango(k)} style={{
              padding: '7px 18px', borderRadius: 'var(--r)',
              background: rango === k ? 'var(--cyan-dim)' : 'var(--surface)',
              border: `1px solid ${rango === k ? 'var(--cyan2)' : 'var(--border)'}`,
              color: rango === k ? 'var(--cyan)' : 'var(--text2)',
              fontFamily: 'var(--font-d)', fontSize: '0.88rem', fontWeight: 600,
              cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.15s',
            }}>{l}</button>
          ))}
        </div>

        {loading ? <Loader /> : (
          <>
            {/* KPIs del rango */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <StatCard label="Alertas en el periodo" value={data?.resumen?.total}     accent="var(--cyan)"  delay={1} />
              <StatCard label="Resueltas"             value={data?.resumen?.resueltas} accent="var(--green)" delay={2} />
              <StatCard label="Críticas / altas"      value={data?.resumen?.criticas}  accent="var(--red)"   delay={3} />
              <StatCard label="Sin resolver"          value={data?.resumen?.activas}   accent={parseInt(data?.resumen?.activas) > 0 ? 'var(--amber)' : 'var(--green)'} delay={4} />
            </div>

            {/* Alertas por día */}
            <Panel title="Alertas por día">
              {(!data?.por_dia || data.por_dia.length === 0) ? (
                <div style={{ color: 'var(--text3)', fontSize: '0.85rem', textAlign: 'center', padding: '30px' }}>Sin datos en el periodo</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.por_dia} barCategoryGap="25%">
                    <XAxis dataKey="dia" tick={{ fill: 'var(--text3)', fontSize: 11, fontFamily: 'var(--font-d)' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,212,255,0.05)' }} />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="var(--cyan2)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Panel>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              {/* Por tipo */}
              <Panel title="Alertas por tipo">
                {(!data?.por_tipo || data.por_tipo.length === 0) ? (
                  <div style={{ color: 'var(--text3)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>Sin datos</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.por_tipo.map(t => (
                      <div key={t.tipo}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.82rem' }}>
                          <span style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{t.tipo}</span>
                          <span style={{ color: 'var(--text3)' }}>{t.total}</span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--bg3)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${(parseInt(t.total) / maxTipo) * 100}%`, height: '100%', background: TIPO_COLOR[t.tipo] || 'var(--cyan)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

              {/* Top estaciones */}
              <Panel title="Estaciones con más alertas">
                {(!data?.por_estacion || data.por_estacion.length === 0) ? (
                  <div style={{ color: 'var(--text3)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>Sin datos</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {data.por_estacion.map((e, i) => (
                      <div key={e.nombre} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: 'var(--font-d)', fontWeight: 700, color: 'var(--cyan)', minWidth: '20px', fontSize: '0.85rem' }}>{i + 1}</span>
                        <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text)' }}>{e.nombre}</span>
                        <div style={{ width: '90px', height: '8px', background: 'var(--bg3)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${(parseInt(e.total) / maxEst) * 100}%`, height: '100%', background: 'var(--cyan2)' }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text3)', minWidth: '20px', textAlign: 'right' }}>{e.total}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>

            {/* Flota activa por línea */}
            <div style={{ marginTop: '16px' }}>
              <Panel title="Flota activa por línea">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {data?.flota?.map(f => (
                    <div key={f.codigo} style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '10px 14px', minWidth: '140px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Badge color="var(--cyan)">{f.codigo}</Badge>
                        <span style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>{f.buses}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>buses</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '4px' }}>{f.nombre}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <p style={{ marginTop: '18px', fontSize: '0.72rem', color: 'var(--text3)' }}>
              Periodo: últimos {data?.dias} día(s). Las estadísticas se calculan sobre las alertas registradas en el sistema.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
