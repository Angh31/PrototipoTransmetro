/**
 * @file components/layout/Layout.jsx
 * @description Layout principal con sidebar profesional
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ── SVG Logo (compacto) removed in favor of LogoT.png ── */

const ALL_NAV = [
  { to: '/',           icon: '▦', label: 'Dashboard',  roles: ['admin', 'supervisor', 'operador', 'guardia'] },
  { to: '/operacion',  icon: '⚡', label: 'Operación', roles: ['admin', 'operador', 'supervisor'] },
  { to: '/lineas',     icon: '⬡', label: 'Líneas',     roles: ['admin', 'supervisor', 'guardia'] },
  { to: '/estaciones', icon: '◎', label: 'Estaciones', roles: ['admin', 'operador', 'guardia'] },
  { to: '/buses',      icon: '⬛', label: 'Flota',      roles: ['admin', 'supervisor'] },
  { to: '/pilotos',    icon: '◈', label: 'Pilotos',    roles: ['admin', 'supervisor'] },
  { to: '/alertas',    icon: '◉', label: 'Alertas',    roles: ['admin', 'operador', 'supervisor', 'guardia'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [clock, setClock] = useState('');
  const [showInfo, setShowInfo] = useState(false);

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

        {/* User */}
        <div style={{
          padding: collapsed ? '12px 0' : '12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between', gap: '8px',
        }}>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.nombre || user?.username}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user?.rol}</div>
            </div>
          )}
          <button onClick={() => { logout(); navigate('/login'); }} title="Cerrar sesión"
            style={{
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 'var(--r)', padding: '5px 8px',
              color: 'var(--text3)', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.color='var(--red)'; e.target.style.borderColor='var(--red)'; }}
            onMouseLeave={e => { e.target.style.color='var(--text3)'; e.target.style.borderColor='var(--border)'; }}>
            ⏻
          </button>
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
          {/* Project Info Button */}
          <button onClick={() => setShowInfo(true)} style={{ background: 'none', border: '1px solid var(--cyan2)', borderRadius: 'var(--r)', color: 'var(--cyan)', padding: '4px 10px', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'var(--font-d)' }}>
            ℹ ESTUDIO DE FACTIBILIDAD
          </button>

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
          <span style={{ color: 'var(--text3)', fontFamily: 'var(--font-d)', letterSpacing: '0.06em' }}>
            {clock}
          </span>
        </div>
        <Outlet />

        {/* Modal de Estudio de Factibilidad */}
        {showInfo && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: '20px'
          }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r2)', width: '100%', maxWidth: '600px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)', overflow: 'hidden'
            }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg2)' }}>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.2rem', color: 'var(--cyan)' }}>Estudio de Factibilidad</div>
                <button onClick={() => setShowInfo(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
              </div>
              <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto', fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.5 }}>
                <h4 style={{ color: 'var(--text2)', marginBottom: '10px' }}>Sistema de Control Integral Transmetro</h4>
                <p style={{ marginBottom: '15px' }}>Prototipo desarrollado bajo estrictos estándares técnicos para la Municipalidad de Guatemala. Este sistema resuelve la falta de conectividad entre las estaciones de la red BRT.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: 'var(--r)', borderLeft: '3px solid var(--green)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Inversión Estimada</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text)' }}>Q76,600</div>
                  </div>
                  <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: 'var(--r)', borderLeft: '3px solid var(--cyan)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase' }}>ROI Operativo</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>-40% Tiempo de gestión</div>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ color: 'var(--green)', fontWeight: 600, marginBottom: '5px' }}>✔ Factibilidad Técnica:</div>
                  <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Arquitectura Node.js, React, PostgreSQL y Docker sin costos de licencias propietarias.</div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ color: 'var(--cyan)', fontWeight: 600, marginBottom: '5px' }}>✔ Factibilidad Operativa:</div>
                  <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Eliminación de papeles y visualización en tiempo real con alertas de saturación al 50%.</div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ color: 'var(--amber)', fontWeight: 600, marginBottom: '5px' }}>✔ Factibilidad Legal:</div>
                  <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Cumple con Ley de Acceso a la Información (Dto. 57-2008) y JWT Roles para privacidad.</div>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text3)' }}>
                  <span>Elaborado por: <strong>Angel Chub Cuc</strong> (Project Manager)</span>
                  <span>Versión 1.0 — 2026</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
