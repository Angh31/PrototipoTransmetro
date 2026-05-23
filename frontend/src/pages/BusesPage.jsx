/**
 * @file pages/BusesPage.jsx
 * @author Anghel CC
 * @project PrototipoTransmetro
 */

import { useEffect, useState } from 'react';
import api from '../services/api';
import { PageHeader, Table, Badge, Loader, Btn, StatCard } from '../components/ui';

const cols = [
  { key: 'placa',        label: 'Placa',        render: v => <span style={{ fontFamily: 'var(--font-d)', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.06em' }}>{v}</span> },
  { key: 'marca',        label: 'Marca' },
  { key: 'modelo',       label: 'Modelo' },
  { key: 'es_electrico', label: 'Tipo',         render: v => <Badge color={v ? 'var(--green)' : 'var(--cyan)'}>{v ? '⚡ Eléctrico' : 'Combustión'}</Badge> },
  { key: 'capacidad_max',label: 'Capacidad',    render: v => <span style={{ color: 'var(--text2)' }}>{v} pax</span> },
  { key: 'linea_codigo', label: 'Línea',        render: v => v ? <Badge color="var(--cyan)">{v}</Badge> : <span style={{ color: 'var(--text3)' }}>Reserva</span> },
  { key: 'parqueo',      label: 'Parqueo',      render: v => <span style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{v}</span> },
  { key: 'activo',       label: 'Estado',       render: v => <Badge color={v ? 'var(--green)' : 'var(--text3)'}>{v ? 'Activo' : 'Inactivo'}</Badge> },
];

export default function BusesPage() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ placa: '', marca: '', modelo: '', es_electrico: false, capacidad_max: 80, id_linea: '', id_parqueo: '' });
  const [parqueos, setParqueos] = useState([]);
  const [lineas, setLineas]     = useState([]);

  const load = () => {
    api.get('/buses').then(r => setRows(r.data.data)).finally(() => setLoading(false));
  };

  const handleOpenForm = async () => {
    setShowForm(true);
    api.get('/lineas').then(r => setLineas(r.data.data)).catch(()=>{});
    api.get('/parqueos').then(r => setParqueos(r.data.data)).catch(()=>{});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, id_linea: formData.id_linea || null, id_parqueo: formData.id_parqueo || 1 }; 
      await api.post('/buses', payload);
      setShowForm(false);
      setFormData({ placa: '', marca: '', modelo: '', es_electrico: false, capacidad_max: 80, id_linea: '', id_parqueo: '' });
      load();
    } catch (error) {
      /* la notificación la muestra el interceptor de api.js */
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r => {
    if (filter === 'electrico')  return r.es_electrico;
    if (filter === 'combustion') return !r.es_electrico;
    if (filter === 'reserva')    return !r.linea_codigo;
    return true;
  });

  const stats = {
    total:      rows.length,
    activos:    rows.filter(r => r.activo).length,
    electricos: rows.filter(r => r.es_electrico).length,
    combustion: rows.filter(r => !r.es_electrico).length,
    reserva:    rows.filter(r => !r.linea_codigo).length,
  };
  const conteoFiltro = { todos: stats.total, electrico: stats.electricos, combustion: stats.combustion, reserva: stats.reserva };

  if (loading) return <Loader />;

  return (
    <div className="fade-up">
      <PageHeader title="Flota de Buses" subtitle={`${stats.total} unidades registradas`} />

      <div style={{ padding: '20px 28px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <StatCard label="Total flota"  value={stats.total}     accent="var(--cyan)"  delay={1} />
          <StatCard label="En servicio"  value={stats.activos}   accent="var(--green)" delay={2} />
          <StatCard label="Eléctricos BYD" value={stats.electricos} accent="var(--green)" delay={3} sub="Línea 5" />
          <StatCard label="En reserva"   value={stats.reserva}   accent="var(--amber)" delay={4} />
        </div>

        {/* Filters and Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[['todos','Todos'], ['electrico','⚡ Eléctricos'], ['combustion','Combustión'], ['reserva','Reserva']].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{
                padding: '6px 16px', borderRadius: 'var(--r)',
                background: filter === k ? 'var(--cyan-dim)' : 'var(--surface)',
                border: `1px solid ${filter === k ? 'var(--cyan2)' : 'var(--border)'}`,
                color: filter === k ? 'var(--cyan)' : 'var(--text2)',
                fontFamily: 'var(--font-d)', fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.15s',
              }}>
                {l} <span style={{ opacity: 0.6, fontSize: '0.78rem' }}>{conteoFiltro[k]}</span>
              </button>
            ))}
          </div>
          <Btn onClick={handleOpenForm}>+ Nuevo Bus</Btn>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 300px' : '1fr', gap: '16px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden' }}>
            <Table columns={cols} rows={filtered} keyField="id_bus" onRowClick={setSelected} emptyMsg="Sin buses" />
          </div>

          {selected && (
            <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', alignSelf: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.3rem', fontWeight: 700, color: selected.es_electrico ? 'var(--green)' : 'var(--cyan)' }}>
                    {selected.es_electrico ? '⚡ ' : ''}{selected.placa}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{selected.marca} {selected.modelo}</div>
                </div>
                <Btn small ghost onClick={() => setSelected(null)}>✕</Btn>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {[
                  ['Capacidad', `${selected.capacidad_max} pax`],
                  ['Tipo', selected.es_electrico ? 'Eléctrico BYD' : 'Combustión'],
                  ['Línea', selected.linea_nombre || 'Sin asignar'],
                  ['Parqueo', selected.parqueo],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '9px 11px' }}>
                    <div style={{ fontSize: '0.67rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text)', marginTop: '3px' }}>{v || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Reglas de negocio BYD */}
              {selected.es_electrico && (
                <div style={{ padding: '10px 12px', background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 'var(--r)', fontSize: '0.78rem', color: 'var(--green)' }}>
                  ⚡ Bus BYD — asignado a parqueo con carga eléctrica
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', width: '100%', maxWidth: '400px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-d)', marginBottom: '16px', color: 'var(--cyan)' }}>Registrar Nuevo Bus</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input placeholder="Placa (ej. U001ABC)" required value={formData.placa} onChange={e => setFormData({ ...formData, placa: e.target.value })} style={{ padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--r)' }} />
              <input placeholder="Marca (ej. Volvo)" required value={formData.marca} onChange={e => setFormData({ ...formData, marca: e.target.value })} style={{ padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--r)' }} />
              <input placeholder="Modelo (ej. 2024)" required value={formData.modelo} onChange={e => setFormData({ ...formData, modelo: e.target.value })} style={{ padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--r)' }} />
              <input type="number" placeholder="Capacidad Max" required value={formData.capacidad_max} onChange={e => setFormData({ ...formData, capacidad_max: e.target.value })} style={{ padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--r)' }} />
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text2)', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={formData.es_electrico} onChange={e => setFormData({ ...formData, es_electrico: e.target.checked })} />
                Es Eléctrico (BYD)
              </label>

              <select required value={formData.id_parqueo} onChange={e => setFormData({ ...formData, id_parqueo: e.target.value })} style={{ padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--r)' }}>
                <option value="">-- Seleccionar Parqueo Obligatorio --</option>
                {parqueos.map(p => (
                  <option key={p.id_parqueo} value={p.id_parqueo}>{p.nombre}{p.carga_electrica ? ' ⚡' : ''}</option>
                ))}
              </select>

              <select value={formData.id_linea} onChange={e => setFormData({ ...formData, id_linea: e.target.value })} style={{ padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--r)' }}>
                <option value="">-- Línea (Opcional - Reserva) --</option>
                {lineas.map(l => (
                  <option key={l.id_linea} value={l.id_linea}>{l.nombre}</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <Btn type="submit" style={{ flex: 1, justifyContent: 'center' }}>Guardar</Btn>
                <Btn type="button" ghost onClick={() => setShowForm(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancelar</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
