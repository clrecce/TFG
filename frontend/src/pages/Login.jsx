import { useState } from 'react';
import '../App.css';

export default function Login({ onLogin }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', rol: 'Desarrollador' });
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempUser, setTempUser] = useState(null); 

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setExito('');
    try {
      const res = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (res.ok && data.status === 'mfa_required') {
        setTempUser({ email: data.email, rol: data.rol }); 
        setStep(2);
      } else {
        setError(data.detail || 'Credenciales incorrectas.');
      }
    } catch (err) { setError('Error de conexión con el servidor MySQL.'); } 
    finally { setLoading(false); }
  };

  const handleRegistroSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setExito('');
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,16}$/;
    if (!regex.test(formData.password)) {
      setError('La contraseña debe tener entre 8 y 16 caracteres, e incluir mayúsculas, minúsculas y números.');
      setLoading(false); return;
    }
    try {
      const res = await fetch('http://127.0.0.1:8000/registro', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setExito('Usuario registrado. Ya puedes iniciar sesión.');
        setStep(1);
      } else { setError(data.detail || 'Error al registrar.'); }
    } catch (err) { setError('Error de conexión.'); } 
    finally { setLoading(false); }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/mfa-verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      if (res.ok) {
        onLogin(tempUser); 
      } else { setError('PIN incorrecto.'); }
    } catch (err) { setError('Error al verificar MFA.'); } 
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1e1e2f' }}>
      <div style={{ backgroundColor: '#252536', padding: '40px', borderRadius: '10px', border: '1px solid #3a3a52', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#4ade80', margin: '0 0 10px 0' }}>EcoDev Platform 🍃</h1>
          <p style={{ color: '#a5b4fc', margin: 0, fontSize: '14px' }}>
            {step === 1 ? 'Inicia sesión para acceder' : step === 2 ? 'Autenticación Multifactor (MFA)' : 'Registro de Nuevo Usuario'}
          </p>
        </div>

        {exito && <div style={{ backgroundColor: '#064e3b', color: '#34d399', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{exito}</div>}
        {error && <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

        {step === 1 && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" required placeholder="Correo Electrónico" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
            <input type="password" required placeholder="Contraseña" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
            <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#4ade80', color: '#1e1e2f', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '10px' }}>¿No tienes cuenta? <span onClick={() => {setStep(3); setError(''); setExito('');}} style={{ color: '#4ade80', cursor: 'pointer', textDecoration: 'underline' }}>Regístrate aquí</span></p>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleRegistroSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" required placeholder="Nombre Completo" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
            <input type="email" required placeholder="Correo Electrónico" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
            <input type="password" required placeholder="Contraseña Robusta" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
            <small style={{ color: '#6b7280', fontSize: '11px', marginTop: '-10px' }}>* 8 a 16 caracteres, con mayúsculas, minúsculas y números.</small>
            
            {/* SE AGREGARON TODOS LOS ROLES DE LA TESIS */}
            <select value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }}>
              <option value="Desarrollador">Desarrollador</option>
              <option value="Arquitecto de Software">Arquitecto de Software</option>
              <option value="Gerente de Proyecto">Gerente de Proyecto</option>
              <option value="Ingeniero de Operaciones">Ingeniero de Operaciones</option>
              <option value="Administrador">Administrador (Root)</option>
            </select>

            <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#8b5cf6', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>
              {loading ? 'Registrando...' : 'Crear Cuenta Segura'}
            </button>
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '10px' }}><span onClick={() => {setStep(1); setError(''); setExito('');}} style={{ color: '#a5b4fc', cursor: 'pointer', textDecoration: 'underline' }}>Volver al Login</span></p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleMfaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ textAlign: 'center', backgroundColor: '#1a1a24', padding: '15px', borderRadius: '5px', border: '1px dashed #f59e0b' }}>
              <p style={{ color: '#d1d5db', fontSize: '13px', margin: 0 }}>Ingresa el PIN de 6 dígitos (Demo: 123456).</p>
            </div>
            <input type="text" required maxLength="6" placeholder="Ej: 123456" value={pin} onChange={(e) => setPin(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box', textAlign: 'center', fontSize: '20px', letterSpacing: '5px' }} />
            <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              {loading ? 'Validando...' : 'Verificar e Ingresar'}
            </button>
            <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', textDecoration: 'underline' }}>Volver</button>
          </form>
        )}
      </div>
    </div>
  );
}