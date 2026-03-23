import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Requisitos from './pages/Requisitos';
import Editor from './pages/Editor';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './App.css';

function App() {
  // Estado para manejar si el usuario inició sesión
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Si no está autenticado, mostramos solo el Login
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  // Si está autenticado, mostramos la aplicación completa
  return (
    <BrowserRouter>
      {/* Barra de Navegación Global */}
      <nav style={{ 
        display: 'flex', 
        gap: '30px', 
        padding: '15px 30px', 
        backgroundColor: '#1a1a24', 
        borderBottom: '1px solid #3a3a52',
        alignItems: 'center',
        justifyContent: 'space-between' // Separamos el logo de los links
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '18px', marginRight: '20px' }}>
            EcoDev Platform 🍃
          </div>
          <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>📊 Dashboard</Link>
          <Link to="/requisitos" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>📋 Requisitos</Link>
          <Link to="/editor" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>🏗️ Diseño de Arquitectura</Link>
        </div>
        
        {/* Botón de Logout */}
        <button 
          onClick={() => setIsAuthenticated(false)}
          style={{
            backgroundColor: 'transparent',
            color: '#ef4444',
            border: '1px solid #ef4444',
            padding: '5px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Cerrar Sesión
        </button>
      </nav>

      {/* Contenedor de las páginas */}
      <div style={{ height: 'calc(100vh - 55px)', overflow: 'hidden', overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requisitos" element={<Requisitos />} />
          <Route path="/editor" element={<Editor />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;