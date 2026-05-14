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

export default function EstacionesPage() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail]   = useState(null);

  useEffect(() => {
    api.get('/estaciones').then(r => setRows(r.data.data)).finally(() => setLoading(false));
  }, []);

  const openDetail = async (row) => {
    setSelected(row);
    setDetail(null);
    const r = await api.get(`/estaciones/${row.id_estacion}`);
    setDetail(r.data.data);
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-up">
      <PageHeader title="Estaciones" subtitle={`${rows.length} estaciones en la red`} />
      <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: '16px' }}>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden' }}>
          <Table columns={cols} rows={rows} keyField="id_estacion" onRowClick={openDetail} emptyMsg="Sin estaciones" />
        </div>

        {selected && (
          <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{selected.nombre}</div>
              <Btn small ghost onClick={() => { setSelected(null); setDetail(null); }}>✕</Btn>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              {[
                ['Capacidad', selected.capacidad_max + ' pax'],
                ['Municipio', selected.municipio],
                ['Líneas',    selected.total_lineas],
                ['Accesos',   selected.total_accesos],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '9px 11px' }}>
                  <div style={{ fontSize: '0.67rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}</div>
                  <div style={{ fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginTop: '2px' }}>{v}</div>
                </div>
              ))}
            </div>

            {detail?.accesos?.length > 0 && (
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

            {!detail && <div style={{ color: 'var(--text3)', fontSize: '0.82rem', textAlign: 'center', padding: '10px' }}>Cargando detalle...</div>}
          </div>
        )}
      </div>
    </div>
  );
}
