import { useState } from 'react';
import '../App.css';

// Recibimos la función onLogin como prop para avisarle a App.jsx que el usuario entró
export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulamos una validación de seguridad (para el prototipo aceptamos admin / admin123)
    if (email === 'admin@ecodev.com' && password === 'admin123') {
      setError(false);
      onLogin(); // Damos acceso
    } else {
      setError(true);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#1e1e2f' 
    }}>
      <div style={{ 
        backgroundColor: '#252536', 
        padding: '40px', 
        borderRadius: '10px', 
        border: '1px solid #3a3a52',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#4ade80', margin: '0 0 10px 0' }}>EcoDev Platform 🍃</h1>
          <p style={{ color: '#a5b4fc', margin: 0, fontSize: '14px' }}>Inicia sesión para acceder al entorno sostenible</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#a5b4fc', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ecodev.com"
              style={{ width: '100%', padding: '12px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a5b4fc', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              style={{ width: '100%', padding: '12px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }}
            />
          </div>

          {error && <p style={{ color: '#ef4444', margin: 0, fontSize: '14px', textAlign: 'center' }}>Credenciales incorrectas.</p>}

          <button 
            type="submit" 
            style={{ 
              padding: '14px', 
              backgroundColor: '#4ade80', 
              color: '#1e1e2f', 
              fontWeight: 'bold', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '10px'
            }}
          >
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}