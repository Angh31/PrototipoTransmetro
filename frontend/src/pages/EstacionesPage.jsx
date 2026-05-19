/**
 * @file pages/EstacionesPage.jsx
 * @author Anghel CC
 * @project PrototipoTransmetro
 */

import { useEffect, useState } from 'react';
import api from '../services/api';
import { PageHeader, Table, Badge, Loader, Btn } from '../components/ui';

const cols = [
  { key: 'nombre',        label: 'Estación' },
  { key: 'municipio',     label: 'Municipio' },
  { key: 'capacidad_max', label: 'Capacidad', render: v => <span style={{ fontFamily: 'var(--font-d)', fontWeight: 600, color: 'var(--cyan)' }}>{v}</span> },
  { key: 'total_lineas',  label: 'Líneas',    render: v => <Badge color="var(--cyan)">{v}</Badge> },
  { key: 'total_accesos', label: 'Accesos',   render: v => <span style={{ color: 'var(--text2)' }}>{v}</span> },
  { key: 'activa',        label: 'Estado',    render: v => <Badge color={v ? 'var(--green)' : 'var(--text3)'}>{v ? 'Activa' : 'Inactiva'}</Badge> },
];

const EMPTY_CREATE = { nombre: '', capacidad_max: 200, id_municipio: '' };
const EMPTY_EDIT   = { nombre: '', capacidad_max: '', activa: true };

const inputStyle = { padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--r)' };

export default function EstacionesPage() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail]     = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formData, setFormData] = useState(EMPTY_CREATE);
  const [municipios, setMunicipios] = useState([]);

  const load = () => {
    api.get('/estaciones').then(r => setRows(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cargarDetalle = async (idEstacion) => {
    const r = await api.get(`/estaciones/${idEstacion}`);
    setDetail(r.data.data);
  };

  const openDetail = (row) => {
    setSelected(row);
    setDetail(null);
    cargarDetalle(row.id_estacion);
  };

  const fetchMunicipios = () => api.get('/municipios').then(r => setMunicipios(r.data.data)).catch(() => {});

  const handleOpenCreate = () => {
    setFormMode('create');
    setFormData(EMPTY_CREATE);
    fetchMunicipios();
    setShowForm(true);
  };

  const handleOpenEdit = () => {
    if (!detail) return;
    setFormMode('edit');
    setFormData({
      nombre:        detail.nombre        ?? '',
      capacidad_max: detail.capacidad_max ?? '',
      activa:        detail.activa,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const editId = formMode === 'edit' ? selected?.id_estacion : null;
      let savedId = editId;
      if (formMode === 'create') {
        const payload = {
          nombre:        formData.nombre,
          capacidad_max: parseInt(formData.capacidad_max),
          id_municipio:  parseInt(formData.id_municipio),
        };
        const res = await api.post('/estaciones', payload);
        savedId = res.data.data?.id_estacion ?? null;
      } else {
        const payload = {
          nombre:        formData.nombre,
          capacidad_max: parseInt(formData.capacidad_max),
          activa:        formData.activa,
        };
        await api.put(`/estaciones/${selected.id_estacion}`, payload);
      }
      setShowForm(false);
      const { data } = await api.get('/estaciones');
      setRows(data.data);
      if (savedId) {
        const fresh = data.data.find(r => r.id_estacion === savedId);
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
        title="Estaciones"
        subtitle={`${rows.length} estaciones en la red`}
        actions={<Btn onClick={handleOpenCreate}>+ Nueva Estación</Btn>}
      />
      <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: '16px' }}>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden' }}>
          <Table columns={cols} rows={rows} keyField="id_estacion" onRowClick={openDetail} emptyMsg="Sin estaciones" />
        </div>

        {selected && (
          <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
                {detail?.nombre ?? selected.nombre}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                  {[
                    ['Capacidad', detail.capacidad_max + ' pax'],
                    ['Municipio', detail.municipio],
                    ['Estado',    detail.activa ? 'Activa' : 'Inactiva'],
                    ['Accesos',   detail.accesos?.length ?? 0],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '9px 11px' }}>
                      <div style={{ fontSize: '0.67rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}</div>
                      <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginTop: '2px' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {detail.accesos?.length > 0 && (
                  <>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Accesos y guardias</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {detail.accesos.map(a => (
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
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', width: '100%', maxWidth: '420px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-d)', marginBottom: '16px', color: 'var(--cyan)' }}>
              {formMode === 'create' ? 'Nueva Estación' : `Editar — ${detail?.nombre ?? ''}`}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <input placeholder="Nombre de la estación" required value={formData.nombre}
                onChange={e => set('nombre', e.target.value)} style={inputStyle} />

              <input type="number" min="1" placeholder="Capacidad máxima (pax)" required value={formData.capacidad_max}
                onChange={e => set('capacidad_max', e.target.value)} style={inputStyle} />

              {formMode === 'create' && (
                <select required value={formData.id_municipio}
                  onChange={e => set('id_municipio', e.target.value)} style={inputStyle}>
                  <option value="">-- Municipio (obligatorio) --</option>
                  {municipios.map(m => (
                    <option key={m.id_municipio} value={m.id_municipio}>{m.nombre}</option>
                  ))}
                </select>
              )}

              {formMode === 'edit' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text2)', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={formData.activa} onChange={e => set('activa', e.target.checked)} />
                  Estación activa
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
