/**
 * @file pages/PilotosPage.jsx
 * @author Anghel CC
 * @project PrototipoTransmetro
 */

import { useEffect, useState } from 'react';
import api from '../services/api';
import { PageHeader, Table, Badge, Loader, Btn } from '../components/ui';

const EDU_COLOR = { universitario: 'var(--cyan)', diversificado: 'var(--amber)', basico: 'var(--text2)', primaria: 'var(--text3)' };
const EDU_OPTS  = ['primaria', 'basico', 'diversificado', 'universitario'];

const cols = [
  { key: 'apellidos',       label: 'Apellidos' },
  { key: 'nombres',         label: 'Nombres' },
  { key: 'dpi',             label: 'DPI',            render: v => <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text2)' }}>{v}</span> },
  { key: 'linea_codigo',    label: 'Línea',          render: v => v ? <Badge color="var(--cyan)">{v}</Badge> : <span style={{ color: 'var(--text3)' }}>—</span> },
  { key: 'nivel_educativo', label: 'Educación',      render: v => v ? <Badge color={EDU_COLOR[v] || 'var(--text2)'}>{v}</Badge> : '—' },
  { key: 'municipio_reside',label: 'Municipio',      render: v => <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{v || '—'}</span> },
  { key: 'telefono',        label: 'Teléfono',       render: v => <span style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{v || '—'}</span> },
  { key: 'activo',          label: 'Estado',         render: v => <Badge color={v ? 'var(--green)' : 'var(--text3)'}>{v ? 'Activo' : 'Inactivo'}</Badge> },
];

const EMPTY_CREATE = { nombres: '', apellidos: '', dpi: '', telefono: '', correo: '', municipio_reside: '', direccion: '', nivel_educativo: '', titulo: '', institucion: '', id_linea: '' };
const EMPTY_EDIT   = { telefono: '', correo: '', municipio_reside: '', direccion: '', nivel_educativo: '', titulo: '', institucion: '', id_linea: '', activo: true };

const inputStyle = { padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--r)' };

export default function PilotosPage() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail]     = useState(null);
  const [search, setSearch]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formData, setFormData] = useState(EMPTY_CREATE);
  const [lineas, setLineas]     = useState([]);

  const load = () => {
    api.get('/pilotos').then(r => setRows(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r =>
    !search || `${r.nombres} ${r.apellidos} ${r.dpi}`.toLowerCase().includes(search.toLowerCase())
  );

  const cargarDetalle = async (idPiloto) => {
    const r = await api.get(`/pilotos/${idPiloto}`);
    setDetail(r.data.data);
  };

  const openDetail = (row) => {
    setSelected(row);
    setDetail(null);
    cargarDetalle(row.id_piloto);
  };

  const fetchLineas = () => api.get('/lineas').then(r => setLineas(r.data.data)).catch(() => {});

  const handleOpenCreate = () => {
    setFormMode('create');
    setFormData(EMPTY_CREATE);
    fetchLineas();
    setShowForm(true);
  };

  const handleOpenEdit = () => {
    if (!detail) return;
    setFormMode('edit');
    setFormData({
      telefono:         detail.telefono         ?? '',
      correo:           detail.correo           ?? '',
      municipio_reside: detail.municipio_reside ?? '',
      direccion:        detail.direccion        ?? '',
      nivel_educativo:  detail.nivel_educativo  ?? '',
      titulo:           detail.titulo           ?? '',
      institucion:      detail.institucion      ?? '',
      id_linea:         detail.id_linea         ?? '',
      activo:           detail.activo,
    });
    fetchLineas();
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const editId = formMode === 'edit' ? selected?.id_piloto : null;
      const clean = { ...formData, id_linea: formData.id_linea || null };
      let savedId = editId;
      if (formMode === 'create') {
        const res = await api.post('/pilotos', clean);
        savedId = res.data.data?.id_piloto ?? null;
      } else {
        await api.put(`/pilotos/${selected.id_piloto}`, clean);
      }
      setShowForm(false);
      const { data } = await api.get('/pilotos');
      setRows(data.data);
      if (savedId) {
        const fresh = data.data.find(r => r.id_piloto === savedId);
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
        title="Pilotos"
        subtitle={`${rows.length} pilotos registrados`}
        actions={<Btn onClick={handleOpenCreate}>+ Nuevo Piloto</Btn>}
      />
      <div style={{ padding: '20px 28px' }}>

        <div style={{ marginBottom: '14px' }}>
          <input
            placeholder="Buscar por nombre o DPI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '9px 14px', background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r)', color: 'var(--text)', fontFamily: 'var(--font-b)',
              fontSize: '0.88rem', outline: 'none', width: '280px',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--cyan2)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 300px' : '1fr', gap: '16px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden' }}>
            <Table columns={cols} rows={filtered} keyField="id_piloto" onRowClick={openDetail} emptyMsg="Sin pilotos" />
          </div>

          {selected && (
            <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', alignSelf: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
                    {detail ? `${detail.nombres} ${detail.apellidos}` : '…'}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text3)', marginTop: '2px' }}>
                    {detail?.dpi ?? '…'}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    ['Línea asignada', detail.linea_nombre || 'Sin asignar'],
                    ['Teléfono',       detail.telefono],
                    ['Correo',         detail.correo],
                    ['Residencia',     detail.municipio_reside],
                    ['Dirección',      detail.direccion],
                  ].map(([k, v]) => v ? (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{k}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text)', textAlign: 'right', maxWidth: '180px' }}>{v}</span>
                    </div>
                  ) : null)}

                  {detail.nivel_educativo && (
                    <div style={{ marginTop: '10px', padding: '12px', background: 'var(--bg3)', borderRadius: 'var(--r)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Historial educativo</div>
                      <Badge color={EDU_COLOR[detail.nivel_educativo] || 'var(--text2)'}>{detail.nivel_educativo}</Badge>
                      {detail.titulo && <div style={{ fontSize: '0.82rem', color: 'var(--text)', marginTop: '6px' }}>{detail.titulo}</div>}
                      {detail.institucion && <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: '2px' }}>{detail.institucion}</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', width: '100%', maxWidth: '440px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-d)', marginBottom: '16px', color: 'var(--cyan)' }}>
              {formMode === 'create' ? 'Nuevo Piloto' : `Editar — ${detail?.nombres} ${detail?.apellidos}`}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {formMode === 'create' && (
                <>
                  <input placeholder="Nombres" required value={formData.nombres}
                    onChange={e => set('nombres', e.target.value)} style={inputStyle} />
                  <input placeholder="Apellidos" required value={formData.apellidos}
                    onChange={e => set('apellidos', e.target.value)} style={inputStyle} />
                  <input placeholder="DPI (13 dígitos)" required value={formData.dpi}
                    onChange={e => set('dpi', e.target.value)} style={inputStyle} />
                </>
              )}

              <input placeholder="Teléfono" value={formData.telefono}
                onChange={e => set('telefono', e.target.value)} style={inputStyle} />
              <input placeholder="Correo electrónico" type="email" value={formData.correo}
                onChange={e => set('correo', e.target.value)} style={inputStyle} />
              <input placeholder="Municipio de residencia" value={formData.municipio_reside}
                onChange={e => set('municipio_reside', e.target.value)} style={inputStyle} />
              <input placeholder="Dirección" value={formData.direccion}
                onChange={e => set('direccion', e.target.value)} style={inputStyle} />

              <select value={formData.nivel_educativo}
                onChange={e => set('nivel_educativo', e.target.value)} style={inputStyle}>
                <option value="">-- Nivel educativo (opcional) --</option>
                {EDU_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>

              <input placeholder="Título obtenido" value={formData.titulo}
                onChange={e => set('titulo', e.target.value)} style={inputStyle} />
              <input placeholder="Institución educativa" value={formData.institucion}
                onChange={e => set('institucion', e.target.value)} style={inputStyle} />

              <select value={formData.id_linea}
                onChange={e => set('id_linea', e.target.value)} style={inputStyle}>
                <option value="">-- Línea asignada (opcional) --</option>
                {lineas.map(l => <option key={l.id_linea} value={l.id_linea}>{l.nombre}</option>)}
              </select>

              {formMode === 'edit' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text2)', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={formData.activo} onChange={e => set('activo', e.target.checked)} />
                  Piloto activo
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
