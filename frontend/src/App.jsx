/**
 * @file App.jsx
 * @author Anghel CC
 * @project PrototipoTransmetro — Sistema de Control Integral Transmetro Guatemala
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout         from './components/layout/Layout';
import LoginPage      from './pages/LoginPage';
import DashboardPage  from './pages/DashboardPage';
import OperacionPage  from './pages/OperacionPage';
import LineasPage     from './pages/LineasPage';
import EstacionesPage from './pages/EstacionesPage';
import BusesPage      from './pages/BusesPage';
import PilotosPage    from './pages/PilotosPage';
import AlertasPage    from './pages/AlertasPage';
import PublicoPage    from './pages/PublicoPage';
import UsuariosPage   from './pages/UsuariosPage';
import AuditoriaPage  from './pages/AuditoriaPage';
import ReportesPage   from './pages/ReportesPage';
import { Toast }      from './components/ui';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', gap:'10px' }}>
      <div style={{ width:'16px', height:'16px', border:'2px solid var(--border2)', borderTopColor:'var(--cyan)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      Iniciando sistema...
    </div>
  );
  // Si no hay sesión → enviamos al usuario a la vista pública (la app "abre" como portal de pasajeros).
  // El personal entra al sistema desde el botón "Acceso al Sistema" del header público.
  return user ? children : <Navigate to="/publico" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toast />
        <Routes>
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/publico" element={<PublicoPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index              element={<DashboardPage />} />
            <Route path="operacion"  element={<OperacionPage />} />
            <Route path="lineas"     element={<LineasPage />} />
            <Route path="estaciones" element={<EstacionesPage />} />
            <Route path="buses"      element={<BusesPage />} />
            <Route path="pilotos"    element={<PilotosPage />} />
            <Route path="alertas"    element={<AlertasPage />} />
            <Route path="usuarios"   element={<UsuariosPage />} />
            <Route path="reportes"   element={<ReportesPage />} />
            <Route path="auditoria"  element={<AuditoriaPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
