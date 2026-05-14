/**
 * @file pages/AlertasPage.jsx
 * @author Anghel CC
 * @project PrototipoTransmetro
 */

import { useEffect, useState } from 'react';
import api from '../services/api';
import { conectarSocket } from '../services/socket';
import { PageHeader, Badge, Loader, Btn, AlertDot } from '../components/ui';

const NIVEL_COLOR = { critica: 'var(--red)', alta: 'var(--red)', media: 'var(--amber)', baja: 'var(--green)' };
const TIPO_ICON  = { capacidad: '🚦', espera: '⏱', seguridad: '🛡', operacional: '⚙' };

export default function AlertasPage() {
  const [alertas, setAlertas]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('activas');
  const [closing, setClosing]   = useState(null);

  const load = async () => {
    const endpoint = tab === 'activas' ? '/alertas/activas' : '/alertas';
    const r = await api.get(endpoint);
    setAlertas(r.data.data);
    setLoading(false);
  };

  useEffect(() => { setLoading(true); load(); }, [tab]);

  useEffect(() => {
    const socket = conectarSocket();
    socket.on('alerta:capacidad', load);
    socket.on('alerta:espera',    load);
    socket.on('alerta:resuelta',  load);
    return () => {
      socket.off('alerta:capacidad', load);
      socket.off('alerta:espera',    load);
      socket.off('alerta:resuelta',  load);
    };
  }, []);

  const cerrar = async (id) => {
    setClosing(id);
    try {
      await api.put(`/alertas/${id}/cerrar`);
      await load();
    } finally { setClosing(null); }
  };

  const activas  = alertas.filter(a => !a.resuelta).length;
  const criticas = alertas.filter(a => !a.resuelta && (a.nivel === 'critica' || a.nivel === 'alta')).length;

  if (loading) return <Loader />;

  return (
    <div className="fade-up">
      <PageHeader
        title="Centro de Alertas"
        subtitle="Monitoreo en tiempo real · Socket.io activo"
      />

      <div style={{ padding: '20px 28px' }}>

        {/* Summary bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Activas',   val: activas,  color: activas > 0 ? 'var(--red)' : 'var(--green)' },
            { label: 'Críticas',  val: criticas, color: criticas > 0 ? 'var(--red)' : 'var(--text3)' },
            { label: 'Total hoy', val: alertas.length, color: 'var(--text2)' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '14px 20px', minWidth: '130px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.8rem', fontWeight: 700, color, lineHeight: 1.1, marginTop: '4px' }}>{val}</div>
            </div>
          ))}

          {/* Socket indicator */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--green)' }}>
            <AlertDot nivel="baja" />
            Tiempo real activo
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          {[['activas', `Activas (${activas})`], ['historial', 'Historial completo']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '7px 18px', borderRadius: 'var(--r)',
              background: tab === k ? 'var(--cyan-dim)' : 'var(--surface)',
              border: `1px solid ${tab === k ? 'var(--cyan2)' : 'var(--border)'}`,
              color: tab === k ? 'var(--cyan)' : 'var(--text2)',
              fontFamily: 'var(--font-d)', fontSize: '0.88rem', fontWeight: 600,
              cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.15s',
            }}>{l}</button>
          ))}
        </div>

        {/* Alerts list */}
        {alertas.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '48px', textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✓</div>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem' }}>Sin alertas {tab === 'activas' ? 'activas' : 'registradas'}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alertas.map(a => {
              const color = NIVEL_COLOR[a.nivel] || 'var(--text2)';
              return (
                <div key={a.id_alerta} className="fade-up" style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderLeft: `3px solid ${color}`,
                  borderRadius: 'var(--r2)',
                  padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: '14px',
                }}>
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{TIPO_ICON[a.tipo] || '◉'}</span>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <Badge color={color}>{a.nivel}</Badge>
                      <Badge color="var(--text3)">{a.tipo}</Badge>
                      {a.estacion_nombre && <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>📍 {a.estacion_nombre}</span>}
                      {a.bus_placa && <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>🚌 {a.bus_placa}</span>}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.5 }}>{a.mensaje}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '4px' }}>
                      {new Date(a.created_at).toLocaleString('es-GT')}
                      {a.resuelta && a.resuelta_at && ` · Resuelta: ${new Date(a.resuelta_at).toLocaleString('es-GT')}`}
                    </div>
                  </div>

                  {!a.resuelta && (
                    <Btn small ghost onClick={() => cerrar(a.id_alerta)} disabled={closing === a.id_alerta}>
                      {closing === a.id_alerta ? 'Resolviendo...' : 'Resolver Acción'}
                    </Btn>
                  )}
                  {a.resuelta && <Badge color="var(--green)">Resuelta</Badge>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
