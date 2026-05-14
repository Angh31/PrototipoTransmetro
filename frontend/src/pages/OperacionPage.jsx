/**
 * @file pages/OperacionPage.jsx
 * @description Simulador de Centro de Mando / Operación (Validación de REQ-0001, REQ-0005, REQ-0006)
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import { PageHeader, Btn, Loader, StatCard } from '../components/ui';

// Paleta institucional requerida por el Prompt Maestro
const colors = {
  verdeInstitucional: '#00A859', // Movilidad
  azulTecnologico:    '#0055A4', // Seguridad de datos
  blanco:             '#FFFFFF',
  grisPlata:          '#E0E0E0'
};

export default function OperacionPage() {
  const [buses, setBuses] = useState([]);
  const [estaciones, setEstaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulario
  const [busSel, setBusSel] = useState('');
  const [estSel, setEstSel] = useState('');
  const [ocupBus, setOcupBus] = useState(10);
  const [ocupEst, setOcupEst] = useState(150);

  // Resultado
  const [resultado, setResultado] = useState(null);
  const [ahorro, setAhorro] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [resB, resE, resA] = await Promise.all([
        api.get('/buses'),
        api.get('/estaciones'),
        api.get('/operacion/ahorro-combustible')
      ]);
      setBuses(resB.data.data);
      setEstaciones(resE.data.data);
      setAhorro(resA.data.data);
      if (resB.data.data.length > 0) setBusSel(resB.data.data[0].id_bus);
      if (resE.data.data.length > 0) setEstSel(resE.data.data[0].id_estacion);
      setLoading(false);
    };
    load();
  }, []);

  const handleSimular = async (e) => {
    e.preventDefault();
    setResultado(null);
    try {
      const res = await api.post('/operacion/registro-estacion', {
        id_bus: parseInt(busSel),
        id_estacion: parseInt(estSel),
        ocupacion_bus: parseInt(ocupBus),
        ocupacion_estacion: parseInt(ocupEst)
      });
      setResultado(res.data);
    } catch (err) {
      if (err.response?.data) {
        setResultado(err.response.data);
      } else {
        alert('Error de conexión');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-up" style={{ minHeight: '100%', background: colors.blanco }}>
      {/* Header Estilo "Centro de Mando" */}
      <div style={{ background: colors.azulTecnologico, padding: '20px 30px', color: colors.blanco, display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Marcador de posición para Logo Solicitado */}
        <div style={{ 
          width: '60px', height: '60px', borderRadius: '50%', background: colors.blanco, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `3px solid ${colors.verdeInstitucional}`, padding: '5px'
        }}>
          <div style={{ textAlign: 'center', lineHeight: '1.1' }}>
            <span style={{ fontSize: '1.2rem' }}>🚌</span>
            <div style={{ fontSize: '0.4rem', color: colors.azulTecnologico, fontWeight: 'bold' }}>DATOS</div>
          </div>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-d)', fontWeight: 700 }}>Centro de Mando Transmetro</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: colors.grisPlata }}>Registro de Operaciones y Validación de Reglas Críticas</p>
        </div>
      </div>

      <div style={{ padding: '20px 30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Panel Izquierdo: Simulación de Llegada */}
        <div style={{ background: '#F5F7FA', padding: '24px', borderRadius: '8px', border: `1px solid ${colors.grisPlata}` }}>
          <h2 style={{ color: colors.azulTecnologico, fontSize: '1.1rem', marginBottom: '16px', borderBottom: `2px solid ${colors.verdeInstitucional}`, paddingBottom: '8px' }}>
            Registro de Entrada/Salida de Bus
          </h2>
          
          <form onSubmit={handleSimular} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', color: '#333', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>Bus Operando</label>
              <select 
                value={busSel} onChange={e => setBusSel(e.target.value)} 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CCC' }}
              >
                {buses.map(b => (
                  <option key={b.id_bus} value={b.id_bus}>{b.placa} ({b.parqueo ? `Parqueo: ${b.parqueo}` : 'SIN PARQUEO'})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#333', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>Estación de Llegada</label>
              <select 
                value={estSel} onChange={e => setEstSel(e.target.value)} 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CCC' }}
              >
                {estaciones.map(e => (
                  <option key={e.id_estacion} value={e.id_estacion}>{e.nombre} (Cap Max: {e.capacidad_max})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#333', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>Pasajeros Actuales en Bus</label>
                <input 
                  type="number" value={ocupBus} onChange={e => setOcupBus(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CCC' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#333', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>Torniquetes (Tarjeta Ciudadana)</label>
                <input 
                  type="number" value={ocupEst} onChange={e => setOcupEst(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CCC' }}
                  title="Ingresos en torniquetes menos salidas"
                />
              </div>
            </div>

            <button type="submit" style={{
              background: colors.verdeInstitucional, color: colors.blanco, border: 'none', 
              padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
            }}>
              Evaluar Reglas y Registrar
            </button>
          </form>
        </div>

        {/* Panel Derecho: Resultado de Reglas */}
        <div>
          <h2 style={{ color: colors.azulTecnologico, fontSize: '1.1rem', marginBottom: '16px', borderBottom: `2px solid ${colors.verdeInstitucional}`, paddingBottom: '8px' }}>
            Resolución del Sistema
          </h2>

          {resultado ? (
            <div style={{ 
              padding: '20px', borderRadius: '8px', color: '#FFF',
              background: resultado.accion === 'bloqueado' ? '#FF3B30' : 
                          resultado.data?.accion === 'despachar_urgente' ? '#E53935' : 
                          resultado.data?.accion === 'esperar' ? '#FFB300' : colors.verdeInstitucional 
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
                {resultado.accion === 'bloqueado' ? 'BLOQUEO OPERATIVO' : 
                 resultado.data?.accion === 'despachar_urgente' ? 'ALERTA: DESPACHO URGENTE' : 
                 resultado.data?.accion === 'esperar' ? 'MODO EFICIENCIA: ESPERAR' : 'DESPACHO NORMAL'}
              </h3>
              
              <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                {resultado.mensaje || resultado.data?.justificacion}
              </p>

              {resultado.data && (
                <div style={{ marginTop: '15px', background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <strong>Métricas Evaluadas:</strong>
                  <ul style={{ margin: '5px 0 0 20px' }}>
                    <li>Carga del Bus: {resultado.data.pctBus}%</li>
                    <li>Saturación Estación: {resultado.data.pctEstacion}%</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888', background: '#F5F7FA', borderRadius: '8px', border: '1px dashed #CCC' }}>
              Llena el formulario para evaluar las reglas críticas de operación.
            </div>
          )}

          {/* Reporte de Ahorro de Combustible */}
          <div style={{ marginTop: '20px', background: '#F5F7FA', padding: '20px', borderRadius: '8px', border: `1px solid ${colors.grisPlata}` }}>
            <h3 style={{ color: colors.azulTecnologico, margin: '0 0 15px 0', fontSize: '1rem' }}>
              Impacto Ambiental
            </h3>
            {ahorro && (
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, background: colors.blanco, padding: '10px', borderRadius: '6px', textAlign: 'center', border: `1px solid ${colors.grisPlata}` }}>
                  <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Galones Ahorrados / Día</div>
                  <div style={{ color: colors.verdeInstitucional, fontWeight: 'bold', fontSize: '1.4rem' }}>{ahorro.galones_ahorrados_dia}</div>
                </div>
                <div style={{ flex: 1, background: colors.blanco, padding: '10px', borderRadius: '6px', textAlign: 'center', border: `1px solid ${colors.grisPlata}` }}>
                  <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>CO2 Evitado (Kg/Día)</div>
                  <div style={{ color: colors.azulTecnologico, fontWeight: 'bold', fontSize: '1.4rem' }}>{ahorro.co2_evitado_kg_dia}</div>
                </div>
              </div>
            )}
            <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '10px', textAlign: 'center' }}>
              Cálculo basado en distancia digital de flota eléctrica BYD
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
