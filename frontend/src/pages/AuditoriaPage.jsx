/**
 * @file pages/AuditoriaPage.jsx
 * @description Bitácora de auditoría — quién hizo qué (solo admin)
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { useEffect, useState } from 'react';
import api from '../services/api';
import { PageHeader, Table, Badge, Loader } from '../components/ui';

// Color por tipo de acción
const COLOR_ACCION = (accion) => {
  if (accion.includes('FALLIDO') || accion.includes('BLOQUEADA')) return 'var(--red)';
  if (accion.includes('LOGIN'))      return 'var(--green)';
  if (accion.includes('PASSWORD'))   return 'var(--amber)';
  if (accion.includes('ALERTA'))     return 'var(--cyan)';
  if (accion.includes('USUARIO') || accion.includes('DESBLOQUEADA')) return 'var(--cyan)';
  return 'var(--text2)';
};

const cols = [
  { key: 'created_at', label: 'Fecha y hora', render: v => <span style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{new Date(v).toLocaleString('es-GT')}</span> },
  { key: 'usuario',    label: 'Usuario',      render: v => <span style={{ fontFamily: 'var(--font-d)', color: 'var(--text)' }}>{v}</span> },
  { key: 'accion',     label: 'Acción',       render: v => <Badge color={COLOR_ACCION(v)}>{v.replace(/_/g, ' ')}</Badge> },
  { key: 'detalle',    label: 'Detalle',      render: v => <span style={{ color: 'var(--text2)', fontSize: '0.84rem' }}>{v || '—'}</span> },
];

export default function AuditoriaPage() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro]   = useState('');

  useEffect(() => {
    api.get('/auditoria').then(r => setRows(r.data.data)).finally(() => setLoading(false));
  }, []);

  const filtradas = rows.filter(r =>
    !filtro || `${r.usuario} ${r.accion} ${r.detalle}`.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="fade-up">
      <PageHeader title="Auditoría" subtitle={`Bitácora de acciones · últimos ${rows.length} registros`} />
      <div style={{ padding: '20px 28px' }}>
        <div style={{ marginBottom: '14px' }}>
          <input
            placeholder="Buscar por usuario, acción o detalle..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            style={{
              padding: '9px 14px', background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r)', color: 'var(--text)', fontFamily: 'var(--font-b)',
              fontSize: '0.88rem', outline: 'none', width: '320px',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--cyan2)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden' }}>
          <Table columns={cols} rows={filtradas} keyField="id_auditoria" emptyMsg="Sin registros de auditoría" />
        </div>
      </div>
    </div>
  );
}
