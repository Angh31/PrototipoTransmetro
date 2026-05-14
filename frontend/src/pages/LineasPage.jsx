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

export default function LineasPage() {
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail]   = useState(null);

  useEffect(() => {
    api.get('/lineas').then(r => setRows(r.data.data)).finally(() => setLoading(false));
  }, []);

  const openDetail = async (row) => {
    setSelected(row);
    const r = await api.get(`/lineas/${row.id_linea}`);
    setDetail(r.data.data);
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-up">
      <PageHeader title="Líneas de Transmetro" subtitle={`${rows.length} líneas registradas`} />
      <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: '16px' }}>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden' }}>
          <Table columns={cols} rows={rows} keyField="id_linea" onRowClick={openDetail}
            emptyMsg="No hay líneas registradas" />
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--cyan)' }}>{selected.codigo}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '2px' }}>{selected.nombre}</div>
              </div>
              <Btn small ghost onClick={() => { setSelected(null); setDetail(null); }}>✕</Btn>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                ['Estaciones', selected.total_estaciones],
                ['Buses',      selected.total_buses],
                ['Distancia',  selected.distancia_km ? `${selected.distancia_km} km` : '—'],
                ['Municipio',  selected.municipio],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}</div>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginTop: '2px' }}>{v ?? '—'}</div>
                </div>
              ))}
            </div>

            {detail?.estaciones?.length > 0 && (
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
          </div>
        )}
      </div>
    </div>
  );
}
