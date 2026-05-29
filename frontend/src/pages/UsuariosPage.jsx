/**
 * @file pages/UsuariosPage.jsx
 * @description Gestión de cuentas de acceso al sistema (solo admin)
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { useEffect, useState } from 'react';
import api from '../services/api';
import { PageHeader, Table, Badge, Loader, Btn, MedidorPassword, PasswordInput } from '../components/ui';

const ROL_COLOR = {
  admin:      'var(--red)',
  supervisor: 'var(--amber)',
  operador:   'var(--cyan)',
  piloto:     'var(--green)',
  guardia:    'var(--purple, #a78bfa)',
};
const ROLES = ['admin', 'supervisor', 'operador', 'piloto', 'guardia'];

const inputStyle = { padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--r)', width: '100%' };

const cols = [
  { key: 'username', label: 'Usuario', render: v => <span style={{ fontFamily: 'var(--font-d)', fontWeight: 600, color: 'var(--text)' }}>{v}</span> },
  { key: 'rol',      label: 'Rol',     render: v => <Badge color={ROL_COLOR[v] || 'var(--text2)'}>{v}</Badge> },
  { key: 'nombres',  label: 'Personal vinculado', render: (v, row) => row.nombres ? `${row.nombres} ${row.apellidos}` : <span style={{ color: 'var(--text3)' }}>—</span> },
  { key: 'activo',   label: 'Estado',  render: v => <Badge color={v ? 'var(--green)' : 'var(--text3)'}>{v ? 'Activo' : 'Inactivo'}</Badge> },
];

export default function UsuariosPage() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [form, setForm]         = useState({ username: '', password: '', rol: 'operador' });

  const [showPwd, setShowPwd]   = useState(false);
  const [nuevaPwd, setNuevaPwd] = useState('');
  const [confirmar, setConfirmar] = useState(false);

  const load = () => api.get('/usuarios').then(r => setRows(r.data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const refrescarSeleccion = async (id) => {
    const { data } = await api.get('/usuarios');
    setRows(data.data);
    const fresh = data.data.find(u => u.id_usuario === id);
    setSelected(fresh || null);
  };

  const abrirCrear = () => {
    setFormMode('create');
    setForm({ username: '', password: '', rol: 'operador' });
    setShowForm(true);
  };

  const abrirEditar = () => {
    if (!selected) return;
    setFormMode('edit');
    setForm({ username: selected.username, password: '', rol: selected.rol });
    setShowForm(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (formMode === 'create') {
        const res = await api.post('/usuarios', { username: form.username, password: form.password, rol: form.rol });
        setShowForm(false);
        await refrescarSeleccion(res.data.data.id_usuario);
      } else {
        await api.put(`/usuarios/${selected.id_usuario}`, { rol: form.rol });
        setShowForm(false);
        await refrescarSeleccion(selected.id_usuario);
      }
    } catch (err) {
      /* la notificación la muestra el interceptor de api.js */
    }
  };

  const toggleActivo = async () => {
    try {
      await api.put(`/usuarios/${selected.id_usuario}`, { activo: !selected.activo });
      await refrescarSeleccion(selected.id_usuario);
    } catch (err) {
      /* la notificación la muestra el interceptor de api.js */
    }
  };

  const guardarPwd = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/usuarios/${selected.id_usuario}/password`, { password: nuevaPwd });
      setShowPwd(false);
      setNuevaPwd('');
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: res.data.message || 'Contraseña restablecida', kind: 'success' } }));
    } catch (err) {
      /* la notificación la muestra el interceptor de api.js */
    }
  };

  const desbloquear = async () => {
    try {
      const res = await api.put(`/usuarios/${selected.id_usuario}/desbloquear`);
      await refrescarSeleccion(selected.id_usuario);
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: res.data.message || 'Cuenta desbloqueada', kind: 'success' } }));
    } catch (err) {
      /* la notificación la muestra el interceptor de api.js */
    }
  };

  const confirmarDesactivar = async () => {
    setConfirmar(false);
    await toggleActivo();
  };

  if (loading) return <Loader />;

  const estaBloqueado = selected?.bloqueado_hasta && new Date(selected.bloqueado_hasta) > new Date();

  return (
    <div className="fade-up">
      <PageHeader
        title="Usuarios y Accesos"
        subtitle={`${rows.length} cuentas de acceso al sistema`}
        actions={<Btn onClick={abrirCrear}>+ Nuevo Usuario</Btn>}
      />
      <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: '16px' }}>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden' }}>
          <Table columns={cols} rows={rows} keyField="id_usuario" onRowClick={setSelected} emptyMsg="Sin usuarios" />
        </div>

        {selected && (
          <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '20px', alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{selected.username}</div>
                <div style={{ marginTop: '4px' }}><Badge color={ROL_COLOR[selected.rol]}>{selected.rol}</Badge></div>
              </div>
              <Btn small ghost onClick={() => setSelected(null)}>✕</Btn>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>Estado</span>
                <span style={{ fontSize: '0.82rem', color: selected.activo ? 'var(--green)' : 'var(--text3)' }}>{selected.activo ? 'Activo' : 'Inactivo'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>Personal vinculado</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{selected.nombres ? `${selected.nombres} ${selected.apellidos}` : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: estaBloqueado ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>Creado</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{new Date(selected.created_at).toLocaleDateString('es-GT')}</span>
              </div>
              {estaBloqueado && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>Acceso</span>
                  <Badge color="var(--red)">🔒 Bloqueado</Badge>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Btn small onClick={abrirEditar}>Editar rol</Btn>
              <Btn small ghost onClick={() => { setNuevaPwd(''); setShowPwd(true); }}>Restablecer contraseña</Btn>
              {estaBloqueado && (
                <Btn small onClick={desbloquear}>Desbloquear acceso</Btn>
              )}
              <Btn small danger={selected.activo} onClick={() => selected.activo ? setConfirmar(true) : toggleActivo()}>
                {selected.activo ? 'Desactivar acceso' : 'Reactivar acceso'}
              </Btn>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación: desactivar acceso */}
      {confirmar && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 150 }}>
          <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', width: '100%', maxWidth: '380px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-d)', marginBottom: '10px', color: 'var(--red)' }}>¿Desactivar acceso?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '18px', lineHeight: 1.5 }}>
              La cuenta <strong style={{ color: 'var(--text)' }}>{selected.username}</strong> ya no podrá iniciar sesión hasta que se reactive. ¿Continuar?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Btn danger onClick={confirmarDesactivar} style={{ flex: 1 }}>Sí, desactivar</Btn>
              <Btn ghost onClick={() => setConfirmar(false)} style={{ flex: 1 }}>Cancelar</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear / editar */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', width: '100%', maxWidth: '400px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-d)', marginBottom: '16px', color: 'var(--cyan)' }}>
              {formMode === 'create' ? 'Nuevo Usuario' : `Editar — ${selected?.username}`}
            </h3>
            <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {formMode === 'create' && (
                <>
                  <input placeholder="Nombre de usuario" required value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })} style={inputStyle} />
                  <PasswordInput placeholder="Contraseña" required value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} />
                  <MedidorPassword password={form.password} />
                </>
              )}
              <label style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rol</label>
              <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })} style={inputStyle}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <Btn type="submit" style={{ flex: 1 }}>Guardar</Btn>
                <Btn type="button" ghost onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancelar</Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal restablecer contraseña */}
      {showPwd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', width: '100%', maxWidth: '380px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-d)', marginBottom: '8px', color: 'var(--cyan)' }}>Restablecer contraseña</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text2)', marginBottom: '16px' }}>
              Nueva contraseña para <strong>{selected?.username}</strong>.
            </p>
            <form onSubmit={guardarPwd} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <PasswordInput placeholder="Nueva contraseña" required value={nuevaPwd}
                onChange={e => setNuevaPwd(e.target.value)} style={inputStyle} autoFocus />
              <MedidorPassword password={nuevaPwd} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <Btn type="submit" style={{ flex: 1 }}>Restablecer</Btn>
                <Btn type="button" ghost onClick={() => setShowPwd(false)} style={{ flex: 1 }}>Cancelar</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
