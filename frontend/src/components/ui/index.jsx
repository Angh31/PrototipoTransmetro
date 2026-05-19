/**
 * @file components/ui/index.jsx
 * @description Componentes reutilizables del sistema
 * @author Anghel CC
 * @project PrototipoTransmetro
 */

import { useEffect, useState } from 'react';

// ── PageHeader ────────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, actions }) => (
  <div style={{
    padding: '24px 28px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'flex-end',
    justifyContent: 'space-between', gap: '12px',
    background: 'var(--bg2)',
  }}>
    <div>
      <h1 style={{
        fontFamily: 'var(--font-d)', fontSize: '1.6rem', fontWeight: 700,
        color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1.1,
      }}>{title}</h1>
      {subtitle && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '4px', letterSpacing: '0.04em' }}>
          {subtitle}
        </p>
      )}
    </div>
    {actions && <div style={{ display: 'flex', gap: '8px' }}>{actions}</div>}
  </div>
);

// ── StatCard ─────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, sub, accent = 'var(--cyan)', icon, delay = 0 }) => (
  <div className={`fade-up-${delay}`} style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r2)',
    padding: '18px 20px',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
      background: `linear-gradient(90deg, ${accent}, transparent)`,
    }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--font-d)', fontSize: '2rem', fontWeight: 700, color: accent, lineHeight: 1 }}>
          {value ?? '—'}
        </div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: '5px' }}>{sub}</div>}
      </div>
      {icon && <span style={{ fontSize: '1.5rem', opacity: 0.35 }}>{icon}</span>}
    </div>
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ children, color = 'var(--cyan)', bg }) => (
  <span style={{
    display: 'inline-block',
    padding: '2px 9px',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color,
    background: bg || `${color}18`,
    border: `1px solid ${color}30`,
  }}>
    {children}
  </span>
);

// ── Table ─────────────────────────────────────────────────────────────────────
export const Table = ({ columns, rows, onRowClick, keyField = 'id', emptyMsg = 'Sin datos' }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border2)' }}>
          {columns.map(col => (
            <th key={col.key} style={{
              padding: '10px 14px', textAlign: 'left',
              fontFamily: 'var(--font-d)', fontSize: '0.72rem',
              color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: '0.1em', fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={columns.length} style={{ padding: '28px', textAlign: 'center', color: 'var(--text3)', fontSize: '0.85rem' }}>{emptyMsg}</td></tr>
        ) : rows.map((row, i) => (
          <tr key={row[keyField] ?? i}
            onClick={() => onRowClick?.(row)}
            style={{
              borderBottom: '1px solid var(--border)',
              cursor: onRowClick ? 'pointer' : 'default',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => onRowClick && (e.currentTarget.style.background = 'var(--surface2)')}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {columns.map(col => (
              <td key={col.key} style={{ padding: '11px 14px', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Loader ────────────────────────────────────────────────────────────────────
export const Loader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'var(--text3)', gap: '10px' }}>
    <div style={{ width: '18px', height: '18px', border: '2px solid var(--border2)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    Cargando...
  </div>
);

// ── Btn ───────────────────────────────────────────────────────────────────────
export const Btn = ({ children, onClick, variant = 'primary', small, disabled, type = 'button', style, ghost, danger, ...rest }) => {
  const base = {
    border: 'none', borderRadius: 'var(--r)',
    fontFamily: 'var(--font-d)', fontWeight: 600,
    letterSpacing: '0.06em', textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: small ? '6px 14px' : '9px 20px',
    fontSize: small ? '0.78rem' : '0.88rem',
    opacity: disabled ? 0.5 : 1,
    transition: 'opacity 0.15s, transform 0.1s',
  };
  const variants = {
    primary:  { background: 'var(--cyan)',    color: '#030810' },
    danger:   { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(255,59,48,0.3)' },
    ghost:    { background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' },
  };
  const resolvedVariant = danger ? 'danger' : ghost ? 'ghost' : variant;
  return (
    <button type={type} style={{ ...base, ...variants[resolvedVariant], ...style }} onClick={onClick} disabled={disabled}
      onMouseEnter={e => !disabled && (e.target.style.opacity = '0.82')}
      onMouseLeave={e => e.target.style.opacity = '1'}
      {...rest}
    >
      {children}
    </button>
  );
};

// ── AlertDot ──────────────────────────────────────────────────────────────────
export const AlertDot = ({ nivel }) => {
  const map = { critica: 'var(--red)', alta: 'var(--red)', media: 'var(--amber)', baja: 'var(--green)' };
  const color = map[nivel] || 'var(--text3)';
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: '10px', height: '10px' }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.3, animation: 'pulseRing 1.6s ease-out infinite' }} />
      <span style={{ position: 'absolute', inset: '2px', borderRadius: '50%', background: color }} />
    </span>
  );
};

// ── Toast ─────────────────────────────────────────────────────────────────────
// Sistema global de avisos. Disparar con:
//   window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, kind } }))
// kind: 'error' | 'success' | 'info'  (por defecto 'info')
export const Toast = () => {
  const [msgs, setMsgs] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const { message, kind = 'info' } = e.detail || {};
      if (!message) return;
      const id = Date.now() + Math.random();
      setMsgs(prev => [...prev, { id, message, kind }]);
      setTimeout(() => setMsgs(prev => prev.filter(m => m.id !== id)), 5000);
    };
    window.addEventListener('app:toast', handler);
    return () => window.removeEventListener('app:toast', handler);
  }, []);

  if (msgs.length === 0) return null;

  const palette = {
    error:   { color: 'var(--red)',   bg: 'var(--red-dim)',   borde: 'rgba(255,59,48,0.35)' },
    success: { color: 'var(--green)', bg: 'var(--green-dim)', borde: 'rgba(0,230,118,0.35)' },
    info:    { color: 'var(--cyan)',  bg: 'var(--cyan-dim)',  borde: 'rgba(0,212,255,0.35)' },
  };

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: '8px',
      pointerEvents: 'none',
    }}>
      {msgs.map(m => {
        const p = palette[m.kind] || palette.info;
        return (
          <div key={m.id} className="fade-up" style={{
            background: p.bg, border: `1px solid ${p.borde}`, borderLeft: `3px solid ${p.color}`,
            borderRadius: 'var(--r)', padding: '12px 16px',
            color: 'var(--text)', fontSize: '0.85rem',
            minWidth: '260px', maxWidth: '380px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            pointerEvents: 'auto',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}>
            {m.message}
          </div>
        );
      })}
    </div>
  );
};
