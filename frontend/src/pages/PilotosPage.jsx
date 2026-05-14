/**
 * @file pages/PilotosPage.jsx
 * @author Anghel CC
 * @project PrototipoTransmetro
 */

import { useEffect, useState } from 'react';
import api from '../services/api';
import { PageHeader, Table, Badge, Loader, Btn } from '../components/ui';

const EDU_COLOR = { universitario: 'var(--cyan)', diversificado: 'var(--amber)', basico: 'var(--text2)', primaria: 'var(--text3)' };

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

export default function PilotosPage() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    api.get('/pilotos').then(r => setRows(r.data.data)).finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter(r =>
    !search || `${r.nombres} ${r.apellidos} ${r.dpi}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="fade-up">
      <PageHeader title="Pilotos" subtitle={`${rows.length} pilotos registrados`} />
      <div style={{ padding: '20px 28px' }}>

        {/* Search */}
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
            <Table columns={cols} rows={filtered} keyField="id_piloto" onRowClick={setSelected} emptyMsg="Sin pilotos" />
          </div>

          {selected && (
            <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', alignSelf: 'start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
                    {selected.nombres} {selected.apellidos}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text3)', marginTop: '2px' }}>{selected.dpi}</div>
                </div>
                <Btn small ghost onClick={() => setSelected(null)}>✕</Btn>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  ['Línea asignada', selected.linea_nombre || 'Sin asignar'],
                  ['Teléfono',       selected.telefono],
                  ['Correo',         selected.correo],
                  ['Residencia',     selected.municipio_reside],
                  ['Dirección',      selected.direccion],
                ].map(([k, v]) => v ? (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{k}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text)', textAlign: 'right', maxWidth: '180px' }}>{v}</span>
                  </div>
                ) : null)}

                {/* Historial educativo */}
                {selected.nivel_educativo && (
                  <div style={{ marginTop: '10px', padding: '12px', background: 'var(--bg3)', borderRadius: 'var(--r)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Historial educativo</div>
                    <Badge color={EDU_COLOR[selected.nivel_educativo] || 'var(--text2)'}>{selected.nivel_educativo}</Badge>
                    {selected.titulo && <div style={{ fontSize: '0.82rem', color: 'var(--text)', marginTop: '6px' }}>{selected.titulo}</div>}
                    {selected.institucion && <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: '2px' }}>{selected.institucion}</div>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
