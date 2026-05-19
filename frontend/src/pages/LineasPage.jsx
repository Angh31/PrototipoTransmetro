/**
 * @file pages/LineasPage.jsx
 * @author Anghel CC
 * @project PrototipoTransmetro
 */

import { useEffect, useState } from 'react';
import api from '../services/api';
import { PageHeader, Table, Badge, Loader, Btn } from '../components/ui';

const cols = [
  { key: 'codigo',           label: 'Código',     render: v => <span style={{ fontFamily: 'var(--font-d)', fontWeight: 700, color: 'var(--cyan)', fontSize: '1rem' }}>{v}</span> },
  { key: 'nombre',           label: 'Nombre' },
  { key: 'total_estaciones', label: 'Estaciones',  render: v => <span style={{ color: 'var(--text2)' }}>{v}</span> },
  { key: 'total_buses',      label: 'Buses',       render: v => <span style={{ color: 'var(--text2)' }}>{v}</span> },
  { key: 'distancia_km',     label: 'Distancia',   render: v => v ? `${v} km` : '—' },
  { key: 'municipio',        label: 'Municipio' },
  { key: 'activa',           label: 'Estado',      render: v => <Badge color={v ? 'var(--green)' : 'var(--text3)'}>{v ? 'Activa' : 'Inactiva'}</Badge> },
];

const EMPTY_CREATE = { nombre: '', codigo: '', distancia_km: '', id_municipio: '' };
const EMPTY_EDIT   = { nombre: '', distancia_km: '', activa: true };

const inputStyle = { padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--r)' };

export default function LineasPage() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail]     = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formData, setFormData] = useState(EMPTY_CREATE);
  const [municipios, setMunicipios] = useState([]);

  const load = () => {
    api.get('/lineas').then(r => setRows(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cargarDetalle = async (idLinea) => {
    const r = await api.get(`/lineas/${idLinea}`);
    setDetail(r.data.data);
  };

  const openDetail = (row) => {
    setSelected(row);
    setDetail(null);
    cargarDetalle(row.id_linea);
  };

  const handleOpenCreate = () => {
    setFormMode('create');
    setFormData(EMPTY_CREATE);
    api.get('/municipios').then(r => setMunicipios(r.data.data)).catch(() => {});
    setShowForm(true);
  };

  const handleOpenEdit = () => {
    if (!detail) return;
    setFormMode('edit');
    setFormData({ nombre: detail.nombre, distancia_km: detail.distancia_km ?? '', activa: detail.activa });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const editId = formMode === 'edit' ? selected?.id_linea : null;
      let savedId = editId;
      if (formMode === 'create') {
        const res = await api.post('/lineas', {
          ...formData,
          distancia_km: formData.distancia_km || null,
          id_municipio: formData.id_municipio || null,
        });
        savedId = res.data.data?.id_linea ?? null;
      } else {
        await api.put(`/lineas/${selected.id_linea}`, {
          ...formData,
          distancia_km: formData.distancia_km || null,
        });
      }
      setShowForm(false);
      const { data } = await api.get('/lineas');
      setRows(data.data);
      if (savedId) {
        const fresh = data.data.find(r => r.id_linea === savedId);
        if (fresh) {
          setSelected(fresh);
          await cargarDetalle(savedId);
        } else {
          setSelected(null);
          setDetail(null);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar');
    }
  };

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  if (loading) return <Loader />;

  return (
    <div className="fade-up">
      <PageHeader
        title="Líneas de Transmetro"
        subtitle={`${rows.length} líneas registradas`}
        actions={<Btn onClick={handleOpenCreate}>+ Nueva Línea</Btn>}
      />
      <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: '16px' }}>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden' }}>
          <Table columns={cols} rows={rows} keyField="id_linea" onRowClick={openDetail}
            emptyMsg="No hay líneas registradas" />
        </div>

        {selected && (
          <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--cyan)' }}>
                  {detail?.codigo ?? '…'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '2px' }}>
                  {detail?.nombre ?? '…'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Btn small onClick={handleOpenEdit} disabled={!detail}>Editar</Btn>
                <Btn small ghost onClick={() => { setSelected(null); setDetail(null); }}>✕</Btn>
              </div>
            </div>

            {!detail ? (
              <div style={{ color: 'var(--text3)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>Cargando…</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  {[
                    ['Estaciones', detail.total_estaciones],
                    ['Buses',      detail.total_buses],
                    ['Distancia',  detail.distancia_km ? `${detail.distancia_km} km` : '—'],
                    ['Municipio',  detail.municipio],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}</div>
                      <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginTop: '2px' }}>{v ?? '—'}</div>
                    </div>
                  ))}
                </div>

                {detail.estaciones?.length > 0 && (
                  <>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                      Recorrido ({detail.estaciones.length} paradas)
                    </div>
                    <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {detail.estaciones.map((e, i) => (
                        <div key={e.id_estacion} style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '7px 10px', background: 'var(--bg3)',
                          borderRadius: 'var(--r)', fontSize: '0.82rem',
                        }}>
                          <span style={{ fontFamily: 'var(--font-d)', fontWeight: 700, color: 'var(--cyan)', minWidth: '22px', fontSize: '0.9rem' }}>{i + 1}</span>
                          <span style={{ color: 'var(--text)', flex: 1 }}>{e.nombre}</span>
                          {e.distancia_km && <span style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>{e.distancia_km} km</span>}
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

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', width: '100%', maxWidth: '400px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-d)', marginBottom: '16px', color: 'var(--cyan)' }}>
              {formMode === 'create' ? 'Nueva Línea' : `Editar ${detail?.codigo}`}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <input placeholder="Nombre de la línea" required value={formData.nombre}
                onChange={e => set('nombre', e.target.value)} style={inputStyle} />

              {formMode === 'create' && (
                <>
                  <input placeholder="Código (ej. L1)" required value={formData.codigo}
                    onChange={e => set('codigo', e.target.value)} style={inputStyle} />
                  <select required value={formData.id_municipio}
                    onChange={e => set('id_municipio', e.target.value)} style={inputStyle}>
                    <option value="">-- Municipio (obligatorio) --</option>
                    {municipios.map(m => (
                      <option key={m.id_municipio} value={m.id_municipio}>{m.nombre}</option>
                    ))}
                  </select>
                </>
              )}

              <input type="number" placeholder="Distancia km (opcional)" value={formData.distancia_km}
                onChange={e => set('distancia_km', e.target.value)} style={inputStyle} />

              {formMode === 'edit' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text2)', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={formData.activa} onChange={e => set('activa', e.target.checked)} />
                  Línea activa
                </label>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <Btn type="submit" style={{ flex: 1 }}>Guardar</Btn>
                <Btn type="button" ghost onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancelar</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
