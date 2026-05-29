/**
 * @file components/layout/Layout.jsx
 * @description Layout principal con sidebar profesional
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { MedidorPassword, PasswordInput } from '../ui';

/* ── SVG Logo (compacto) removed in favor of LogoT.png ── */

const ALL_NAV = [
  { to: '/',           icon: '▦', label: 'Dashboard',     roles: ['admin', 'supervisor', 'operador', 'guardia', 'piloto'] },
  { to: '/operacion',  icon: '⚡', label: 'Operación',    roles: ['admin', 'operador', 'supervisor'] },
  { to: '/piloto',     icon: '⊙', label: 'Mi Operación', roles: ['piloto'] },
  { to: '/guardia',    icon: '⊟', label: 'Accesos',      roles: ['guardia'] },
  { to: '/lineas',     icon: '⬡', label: 'Líneas',       roles: ['admin', 'supervisor'] },
  { to: '/estaciones', icon: '◎', label: 'Estaciones',   roles: ['admin', 'operador', 'guardia'] },
  { to: '/buses',      icon: '⬛', label: 'Flota',        roles: ['admin', 'supervisor'] },
  { to: '/pilotos',    icon: '◈', label: 'Pilotos',      roles: ['admin', 'supervisor'] },
  { to: '/alertas',    icon: '◉', label: 'Alertas',      roles: ['admin', 'operador', 'supervisor', 'guardia', 'piloto'] },
  { to: '/monitoreo',  icon: '⊡', label: 'Cámaras',      roles: ['admin', 'operador', 'supervisor', 'guardia'] },
  { to: '/tarjeta',    icon: '⊞', label: 'Tarjeta',      roles: ['admin', 'operador', 'supervisor'] },
  { to: '/reportes',   icon: '▣', label: 'Reportes',     roles: ['admin', 'supervisor'] },
  { to: '/usuarios',   icon: '⚙', label: 'Usuarios',     roles: ['admin'] },
  { to: '/auditoria',  icon: '▤', label: 'Auditoría',    roles: ['admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [clock, setClock] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwd, setPwd] = useState({ actual: '', nueva: '' });
  const [menuUser, setMenuUser] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const cambiarPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/password', pwd);
      setShowPwd(false);
      setPwd({ actual: '', nueva: '' });
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: res.data.message || 'Contraseña actualizada', kind: 'success' } }));
    } catch (err) {
      /* la notificación la muestra el interceptor de api.js */
    }
  };

  // Estilos del menú desplegable de usuario
  const menuItem = (color = 'var(--text2)') => ({
    width: '100%', textAlign: 'left', background: 'none', border: 'none',
    padding: '11px 14px', cursor: 'pointer', color,
    fontSize: '0.82rem', fontFamily: 'var(--font-b)',
    display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.15s',
  });
  const menuHover = (on) => (e) => { e.currentTarget.style.background = on ? 'var(--surface2)' : 'transparent'; };

  const NAV = ALL_NAV.filter(n => !user || !n.roles || n.roles.includes(user.rol));

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    const tick = () => setClock(
      new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const W = collapsed ? '60px' : '210px';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: W, minWidth: W, background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden', position: 'relative', zIndex: 10,
      }}>

        {/* Logo */}
        <div style={{
          padding: collapsed ? '16px 0' : '16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between', gap: '10px',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo-transmetro.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                onError={e => e.target.style.display='none'} />
              <div>
                <div style={{ fontFamily: 'var(--font-d)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--cyan)', letterSpacing: '0.04em' }}>TRANSMETRO</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Control Integral</div>
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{
            background: 'none', border: 'none', color: 'var(--text3)',
            cursor: 'pointer', fontSize: '0.9rem', padding: '4px',
            borderRadius: 'var(--r)', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.target.style.color='var(--cyan)'}
            onMouseLeave={e => e.target.style.color='var(--text3)'}>
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: collapsed ? '11px 0' : '11px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: isActive ? 'var(--cyan)' : 'var(--text2)',
                textDecoration: 'none',
                fontFamily: 'var(--font-d)', fontSize: '0.95rem',
                fontWeight: isActive ? 600 : 400, letterSpacing: '0.04em',
                borderLeft: isActive ? '2px solid var(--cyan)' : '2px solid transparent',
                background: isActive ? 'var(--cyan-dim)' : 'transparent',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              })}>
              <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + menú desplegable */}
        <div style={{ borderTop: '1px solid var(--border)', padding: collapsed ? '12px 0' : '12px 14px', position: 'relative' }}>
          <button onClick={() => setMenuUser(v => !v)} title="Cuenta"
            style={{
              width: '100%', cursor: 'pointer',
              background: menuUser ? 'var(--surface2)' : 'none',
              border: `1px solid ${menuUser ? 'var(--border2)' : 'transparent'}`,
              borderRadius: 'var(--r)', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: '10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '6px 0' : '6px 8px',
            }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--cyan-dim)', border: '1px solid var(--cyan2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-d)', fontWeight: 700, color: 'var(--cyan)', fontSize: '0.95rem',
            }}>
              {(user?.nombre || user?.username || '?').charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <>
                <div style={{ overflow: 'hidden', textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.nombre || user?.username}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{user?.rol}</div>
                </div>
                <span style={{ color: 'var(--text3)', fontSize: '0.7rem' }}>{menuUser ? '▾' : '▴'}</span>
              </>
            )}
          </button>

          {menuUser && (
            <>
              <div onClick={() => setMenuUser(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div className="fade-up" style={{
                position: 'absolute', zIndex: 50,
                bottom: collapsed ? '12px' : '70px',
                left: collapsed ? '64px' : '14px',
                right: collapsed ? 'auto' : '14px',
                width: collapsed ? '210px' : 'auto',
                background: 'var(--surface)', border: '1px solid var(--border2)',
                borderRadius: 'var(--r)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', overflow: 'hidden',
              }}>
                <button onClick={() => { setMenuUser(false); setPwd({ actual: '', nueva: '' }); setShowPwd(true); }}
                  style={menuItem()} onMouseEnter={menuHover(true)} onMouseLeave={menuHover(false)}>
                  🔑 Cambiar contraseña
                </button>
                <button onClick={() => { setMenuUser(false); setShowConfig(true); }}
                  style={menuItem()} onMouseEnter={menuHover(true)} onMouseLeave={menuHover(false)}>
                  ⚙ Configuración
                </button>
                <div style={{ borderTop: '1px solid var(--border)' }} />
                <button onClick={() => { setMenuUser(false); logout(); navigate('/login'); }}
                  style={menuItem('var(--red)')} onMouseEnter={menuHover(true, 'var(--red)')} onMouseLeave={menuHover(false, 'var(--red)')}>
                  ⏻ Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ── Content ── */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', position: 'relative' }}>
        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 5,
          padding: '0 28px',
          height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px',
          background: 'rgba(7,13,19,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(26,48,73,0.4)',
          fontSize: '0.72rem',
          color: 'var(--text3)',
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            color: 'var(--green)', fontSize: '0.7rem',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--green)',
              boxShadow: '0 0 6px var(--green)',
            }} />
            En línea
          </span>
          <span style={{ color: 'var(--text2)', fontFamily: 'var(--font-d)', letterSpacing: '0.08em', fontSize: '0.95rem', fontWeight: 600 }}>
            {clock}
          </span>
        </div>
        <Outlet />
      </main>

      {/* Modal: cambiar mi contraseña */}
      {showPwd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', width: '100%', maxWidth: '380px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-d)', marginBottom: '16px', color: 'var(--cyan)' }}>Cambiar mi contraseña</h3>
            <form onSubmit={cambiarPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <PasswordInput placeholder="Contraseña actual" required value={pwd.actual}
                onChange={e => setPwd({ ...pwd, actual: e.target.value })}
                style={{ padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--r)' }} autoFocus />
              <PasswordInput placeholder="Nueva contraseña" required value={pwd.nueva}
                onChange={e => setPwd({ ...pwd, nueva: e.target.value })}
                style={{ padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--r)' }} />
              <MedidorPassword password={pwd.nueva} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="submit" style={{ flex: 1, padding: '9px', background: 'var(--cyan)', color: '#030810', border: 'none', borderRadius: 'var(--r)', fontFamily: 'var(--font-d)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontSize: '0.82rem' }}>Guardar</button>
                <button type="button" onClick={() => setShowPwd(false)} style={{ flex: 1, padding: '9px', background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontFamily: 'var(--font-d)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontSize: '0.82rem' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: configuración del sistema (informativo) */}
      {showConfig && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', width: '100%', maxWidth: '440px', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg2)' }}>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.1rem', color: 'var(--cyan)' }}>⚙ Configuración del sistema</div>
              <button onClick={() => setShowConfig(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
            </div>
            <div style={{ padding: '20px', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Parámetros operativos</div>
              {[
                ['Alerta de saturación', 'al 50% de capacidad'],
                ['Validación de eficiencia', 'espera 5 min si la carga < 25%'],
                ['Flota por línea', 'de 1 a 2 buses por cada estación'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text3)' }}>{k}</span>
                  <span style={{ color: 'var(--text)', textAlign: 'right', maxWidth: '230px' }}>{v}</span>
                </div>
              ))}
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '16px 0 10px' }}>Seguridad</div>
              {[
                ['Bloqueo de login', 'tras 5 intentos fallidos'],
                ['Duración del bloqueo', '15 minutos'],
                ['Expiración de sesión', '8 horas'],
                ['Contraseña', 'mín. 8, mayúscula, minúscula y número'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text3)' }}>{k}</span>
                  <span style={{ color: 'var(--text)', textAlign: 'right', maxWidth: '230px' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0' }}>
                <span style={{ color: 'var(--text3)' }}>Versión</span>
                <span style={{ color: 'var(--text)' }}>1.0.0 · 2026</span>
              </div>
              <p style={{ marginTop: '14px', fontSize: '0.74rem', color: 'var(--text3)', lineHeight: 1.5 }}>
                Estos parámetros son fijos en esta versión. Su edición desde el panel se contempla para una fase futura.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
