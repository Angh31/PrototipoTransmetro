/**
 * @file pages/DashboardPage.jsx
 * @author Anghel CC
 * @project PrototipoTransmetro
 */

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../services/api';
import { conectarSocket } from '../services/socket';
import { PageHeader, StatCard, Badge, AlertDot, Loader, Btn } from '../components/ui';
import MapaRed from '../components/map/MapaRed';

// Colores por línea (consistentes con el mapa de la red)
const LINE_COLORS = {
  L1: '#FF3B30', L2: '#FF9500', L5: '#00E676', L6: '#FFB800', L7: '#00D4FF',
  L12: '#9C27B0', L13: '#E91E63', L18: '#3F51B5', TB1: '#607D8B', TB2: '#9E9E9E',
};
const colorLinea = (codigo) => LINE_COLORS[codigo] || 'var(--cyan2)';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '8px 12px', fontSize: '0.8rem' }}>
      <div style={{ color: 'var(--text2)', marginBottom: '2px' }}>{payload[0]?.payload?.codigo}</div>
      <div style={{ color: 'var(--cyan)', fontWeight: 600 }}>{payload[0]?.value} buses</div>
      <div style={{ color: 'var(--text3)' }}>{payload[0]?.payload?.total_estaciones} estaciones</div>
    </div>
  );
};

export default function DashboardPage() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [alertas, setAlertas]   = useState([]);
  const [liveAlert, setLiveAlert] = useState(null);
  const [red, setRed]           = useState(null); // estaciones geolocalizadas + recorridos para el mapa
  const [mostrarMapa, setMostrarMapa] = useState(false);

  const load = async () => {
    try {
      const [dash, alts, redRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/alertas/activas'),
        api.get('/publico/red'),
      ]);
      setData(dash.data.data);
      setAlertas(alts.data.data);
      setRed(redRes.data.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const socket = conectarSocket();
    const showAlert = (payload) => {
      setLiveAlert(payload);
      setTimeout(() => setLiveAlert(null), 6000);
      load(); // refrescar métricas
    };
    socket.on('alerta:capacidad', showAlert);
    socket.on('alerta:espera',    showAlert);
    socket.on('alerta:resuelta',  load);
    return () => {
      socket.off('alerta:capacidad', showAlert);
      socket.off('alerta:espera',    showAlert);
      socket.off('alerta:resuelta',  load);
    };
  }, []);

  if (loading) return <Loader />;

  const flota = data?.flota_por_linea || [];

  return (
    <div className="fade-up">
      <PageHeader
        title="Dashboard Operacional"
        subtitle={`Sistema activo · ${new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      {/* Live alert banner */}
      {liveAlert && (
        <div style={{
          margin: '16px 28px 0',
          padding: '12px 16px',
          background: 'var(--red-dim)',
          border: '1px solid rgba(255,59,48,0.35)',
          borderRadius: 'var(--r)',
          display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'fadeUp 0.3s ease both',
          fontSize: '0.85rem',
        }}>
          <AlertDot nivel="alta" />
          <span style={{ color: 'var(--text)' }}>{liveAlert.mensaje}</span>
          <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: '0.75rem' }}>En vivo</span>
        </div>
      )}

      <div style={{ padding: '20px 28px' }}>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <StatCard label="Líneas activas"   value={data?.lineas_activas}            icon="⬡" accent="var(--cyan)"  delay={1} />
          <StatCard label="Estaciones"        value={data?.estaciones_activas}         icon="◎" accent="var(--cyan)"  delay={2} />
          <StatCard label="Buses en servicio" value={data?.buses?.activos}             icon="⬛" accent="var(--green)" delay={3}
            sub={`${data?.buses?.electricos} eléctricos BYD`} />
          <StatCard label="Alertas activas"   value={data?.alertas?.pendientes}        icon="◉" accent={data?.alertas?.pendientes > 0 ? 'var(--red)' : 'var(--green)'} delay={4}
            sub={`${data?.alertas?.alta} alta · ${data?.alertas?.critica} crítica`} />
        </div>

        {/* Mapa interactivo de la red (colapsable) */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: mostrarMapa ? '14px' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text)' }}>
                Mapa de la red
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>
                {red?.estaciones?.filter(e => e.lat).length || 0} estaciones · {red?.recorridos?.length || 0} líneas trazadas
              </span>
            </div>
            <Btn small ghost onClick={() => setMostrarMapa(v => !v)}>
              {mostrarMapa ? 'Ocultar mapa' : 'Mostrar mapa de la red'}
            </Btn>
          </div>
          {mostrarMapa && (
            <div className="fade-up">
              <MapaRed estaciones={red?.estaciones || []} recorridos={red?.recorridos || []} alto={420} />
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>

          {/* Fleet chart */}
          <div className="fade-up-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '16px', color: 'var(--text)' }}>
              Flota por línea
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={flota} barCategoryGap="30%">
                <XAxis dataKey="codigo" tick={{ fill: 'var(--text3)', fontSize: 11, fontFamily: 'var(--font-d)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,212,255,0.05)' }} />
                <Bar dataKey="buses_asignados" radius={[4,4,0,0]}>
                  {flota.map((entry, i) => (
                    <Cell key={i} fill={parseInt(entry.buses_asignados) > 0 ? colorLinea(entry.codigo) : 'var(--border2)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alertas panel */}
          <div className="fade-up-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', overflow: 'hidden' }}>
            <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '14px', color: 'var(--text)', display: 'flex', justifyContent: 'space-between' }}>
              Alertas activas
              {alertas.length > 0 && <Badge color="var(--red)">{alertas.length}</Badge>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {alertas.length === 0 ? (
                <div style={{ color: 'var(--text3)', fontSize: '0.83rem', textAlign: 'center', padding: '20px 0' }}>
                  ✓ Sin alertas activas
                </div>
              ) : alertas.map(a => (
                <div key={a.id_alerta} style={{
                  padding: '10px 12px',
                  background: 'var(--bg3)',
                  borderRadius: 'var(--r)',
                  border: '1px solid var(--border)',
                  borderLeft: `3px solid ${a.nivel === 'alta' || a.nivel === 'critica' ? 'var(--red)' : 'var(--amber)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <AlertDot nivel={a.nivel} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{a.tipo}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.4 }}>{a.mensaje}</div>
                  {a.estacion_nombre && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '3px' }}>📍 {a.estacion_nombre}</div>
                  )}
                  <button onClick={async () => { await api.put(`/alertas/${a.id_alerta}/cerrar`); load(); }}
                    style={{ background: 'none', border: '1px solid var(--cyan2)', borderRadius: '4px', color: 'var(--cyan)', padding: '4px 8px', fontSize: '0.65rem', marginTop: '8px', cursor: 'pointer', textTransform: 'uppercase' }}>
                    Resolver Acción
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
