import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Requisitos from './pages/Requisitos';
import Editor from './pages/Editor';
import Dashboard from './pages/Dashboard';
import Proyectos from './pages/Proyectos';
import Login from './pages/Login';
import Historial from './pages/Historial';
import Reportes from './pages/Reportes';
import Despliegue from './pages/Despliegue';
import Alertas from './pages/Alertas';
import Configuracion from './pages/Configuracion';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ecodev_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('ecodev_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ecodev_user');
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? '#1e1e2f' : 'white', 
    backgroundColor: isActive ? '#4ade80' : '#2d2d44',
    textDecoration: 'none', fontWeight: 'bold', fontSize: '14px',
    padding: '8px 12px', borderRadius: '5px', transition: 'all 0.3s'
  });

  const iconLinkStyle = ({ isActive }) => ({
    color: isActive ? '#4ade80' : '#a5b4fc', textDecoration: 'none',
    fontSize: '20px', padding: '5px', transition: 'all 0.3s'
  });

  // DEFINICIÓN DE ROLES DE LA TESIS
  const isAdmin = user.rol === 'Administrador';
  const isGerente = user.rol === 'Gerente de Proyecto';
  const isArquitecto = user.rol === 'Arquitecto de Software';
  const isDev = user.rol === 'Desarrollador';
  const isOps = user.rol === 'Ingeniero de Operaciones';

  // MATRIZ DE PERMISOS GRANULAR
  const canViewProyectos = isAdmin || isGerente || isArquitecto;
  const canViewRequisitos = isAdmin || isGerente || isArquitecto;
  const canViewEditor = isAdmin || isArquitecto || isDev;
  const canViewHistorial = isAdmin || isArquitecto || isDev || isOps; // Ops monitorea consumos
  const canViewReportes = isAdmin || isGerente || isOps;
  const canViewCICD = isAdmin || isDev || isOps;
  const canViewConfig = isAdmin || isGerente || isOps; // Ops/Gerentes configuran el umbral

  return (
    <BrowserRouter>
      <nav style={{ display: 'flex', gap: '20px', padding: '15px 30px', backgroundColor: '#1a1a24', borderBottom: '1px solid #3a3a52', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '18px', marginRight: '15px' }}>EcoDev 🍃</div>
          
          {/* El Dashboard (Vista Ejecutiva) es común a todos los operadores de la plataforma */}
          <NavLink to="/dashboard" style={navLinkStyle}>📊 Dashboard</NavLink>
          
          {canViewProyectos && <NavLink to="/proyectos" style={navLinkStyle}>📁 Proyectos</NavLink>}
          {canViewRequisitos && <NavLink to="/requisitos" style={navLinkStyle}>📋 Requisitos</NavLink>}
          {canViewEditor && <NavLink to="/editor" style={navLinkStyle}>🏗️ Editor Full-Stack</NavLink>}
          {canViewHistorial && <NavLink to="/historial" style={navLinkStyle}>⏱️ Historial AI</NavLink>}
          {canViewReportes && <NavLink to="/reportes" style={navLinkStyle}>📄 Reportes</NavLink>}
          {canViewCICD && <NavLink to="/despliegue" style={navLinkStyle}>🚀 CI/CD</NavLink>}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px', marginRight: '10px', textAlign: 'right', lineHeight: '1.2' }}>
            <span style={{ color: 'white', fontWeight: 'bold', display: 'block' }}>{user.email}</span>
            {user.rol}
          </div>
          
          {/* Todos ven las notificaciones ambientales (Alertas) */}
          <NavLink to="/alertas" style={iconLinkStyle} title="Alertas Ambientales">🔔</NavLink>
          
          {canViewConfig && <NavLink to="/configuracion" style={iconLinkStyle} title="Configuración de Sistema">⚙️</NavLink>}
          
          <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button>
        </div>
      </nav>

      <div style={{ height: 'calc(100vh - 65px)', width: '100vw', overflow: 'hidden', overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/requisitos" element={<Requisitos />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/despliegue" element={<Despliegue />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;