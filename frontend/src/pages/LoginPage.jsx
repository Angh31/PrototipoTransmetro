/**
 * @file pages/LoginPage.jsx
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const S = {
  wrap: {
    minHeight: '100vh', background: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: `linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)`,
    backgroundSize: '48px 48px', pointerEvents: 'none',
  },
  glow: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)',
    top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 1,
    width: '100%', maxWidth: '400px', padding: '2.5rem',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--r2)',
    boxShadow: '0 0 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.06)',
    animation: 'fadeUp 0.5s ease both',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '2rem' },
  logoImg: { width: '54px', height: '54px', objectFit: 'contain' },
  logoTitle: {
    fontFamily: 'var(--font-d)', fontSize: '1.35rem', fontWeight: 700,
    color: 'var(--text)', lineHeight: 1.1, letterSpacing: '0.03em',
  },
  logoSub: {
    fontSize: '0.68rem', color: 'var(--text2)', marginTop: '3px',
    letterSpacing: '0.1em', textTransform: 'uppercase',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, var(--border2), transparent)',
    marginBottom: '1.8rem',
  },
  label: {
    display: 'block', fontSize: '0.7rem', fontWeight: 500,
    color: 'var(--text2)', letterSpacing: '0.1em',
    textTransform: 'uppercase', marginBottom: '6px',
  },
  inputWrap: { marginBottom: '1.1rem' },
  input: {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 'var(--r)', color: 'var(--text)',
    fontFamily: 'var(--font-b)', fontSize: '0.93rem', outline: 'none',
    transition: 'border-color 0.2s',
  },
  btn: {
    width: '100%', padding: '11px',
    background: 'var(--cyan)', color: '#030810',
    border: 'none', borderRadius: 'var(--r)',
    fontFamily: 'var(--font-d)', fontSize: '1rem', fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    cursor: 'pointer', marginTop: '0.5rem', transition: 'opacity 0.2s',
  },
  error: {
    background: 'var(--red-dim)', border: '1px solid rgba(255,59,48,0.3)',
    borderRadius: 'var(--r)', padding: '9px 12px',
    fontSize: '0.82rem', color: '#FF8A80', marginBottom: '1rem',
  },
  footer: {
    marginTop: '1.6rem', textAlign: 'center',
    fontSize: '0.68rem', color: 'var(--text3)',
    letterSpacing: '0.06em',
  },
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas');
    } finally { setLoading(false); }
  };

  return (
    <div style={S.wrap}>
      <div style={S.grid} />
      <div style={S.glow} />
      <div style={S.card}>

        <div style={S.logoRow}>
          <img src="/LogoT.png" alt="Transmetro" style={S.logoImg}
            onError={e => { e.target.style.display='none'; }} />
          <div>
            <div style={S.logoTitle}>TRANSMETRO</div>
            <div style={S.logoSub}>Centro de Control · Guatemala</div>
          </div>
        </div>

        <div style={S.divider} />

        <form onSubmit={handleSubmit}>
          {error && <div style={S.error}>{error}</div>}

          <div style={S.inputWrap}>
            <label style={S.label}>Usuario</label>
            <input style={S.input} value={username} autoFocus
              onChange={e => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              onFocus={e => e.target.style.borderColor='var(--cyan2)'}
              onBlur={e => e.target.style.borderColor='var(--border)'} />
          </div>

          <div style={S.inputWrap}>
            <label style={S.label}>Contraseña</label>
            <input type="password" style={S.input} value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              onFocus={e => e.target.style.borderColor='var(--cyan2)'}
              onBlur={e => e.target.style.borderColor='var(--border)'} />
          </div>

          <button type="submit" style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
            onMouseEnter={e => !loading && (e.target.style.opacity='0.85')}
            onMouseLeave={e => e.target.style.opacity='1'}>
            {loading ? 'Verificando...' : 'Ingresar al sistema'}
          </button>
        </form>

        <div style={S.footer}>
          Sistema de Control Integral · Municipalidad de Guatemala · 2026
        </div>
      </div>
    </div>
  );
}
