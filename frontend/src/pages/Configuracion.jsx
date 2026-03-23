import { useState, useEffect } from 'react';

export default function Configuracion() {
  const [guardado, setGuardado] = useState(false);
  const [formData, setFormData] = useState({ nombre_completo: '', email: '', motor_ia: 'gemma:2b', umbral_co2: 0.05 });
  
  // Estados para la sección de Seguridad
  const [pwdData, setPwdData] = useState({ actual: '', nueva: '' });
  const [pwdExito, setPwdExito] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Extraemos el email del usuario logueado en la sesión actual
  const currentUser = JSON.parse(localStorage.getItem('ecodev_user'));

  useEffect(() => {
    fetch('http://127.0.0.1:8000/configuracion')
      .then(res => res.json())
      .then(data => { if (data) setFormData(data); })
      .catch(err => console.error("Error cargando configuración:", err));
  }, []);

  const handleGuardarConfig = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://127.0.0.1:8000/configuracion', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_completo: formData.nombre_completo, motor_ia: formData.motor_ia, umbral_co2: parseFloat(formData.umbral_co2) })
      });
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    } catch (error) { console.error("Error guardando configuración:", error); }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setPwdLoading(true); setPwdError(''); setPwdExito('');
    
    // Validación Frontend de Contraseña Robusta
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,16}$/;
    if (!regex.test(pwdData.nueva)) {
      setPwdError('La contraseña nueva debe tener entre 8 y 16 caracteres, e incluir mayúsculas, minúsculas y números.');
      setPwdLoading(false); return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/cambiar-password', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, actual: pwdData.actual, nueva: pwdData.nueva })
      });
      const data = await res.json();
      
      if (res.ok) {
        setPwdExito(data.mensaje);
        setPwdData({ actual: '', nueva: '' });
      } else {
        setPwdError(data.detail);
      }
    } catch (error) {
      setPwdError("Error de conexión al servidor.");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#4ade80' }}>⚙️ Configuración de Plataforma y Seguridad</h2>
      <p style={{ color: '#a5b4fc', marginBottom: '30px' }}>Gestión de variables ambientales, datos globales y seguridad de la cuenta.</p>

      {/* SECCIÓN 1: CONFIGURACIÓN GLOBAL */}
      <form onSubmit={handleGuardarConfig} style={{ backgroundColor: '#252536', padding: '30px', borderRadius: '8px', border: '1px solid #3a3a52', marginBottom: '30px' }}>
        
        <h3 style={{ marginTop: 0, color: 'white', borderBottom: '1px solid #3a3a52', paddingBottom: '10px' }}>Empresa / Organización</h3>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#9ca3af', marginBottom: '5px', fontSize: '14px' }}>Nombre de la Organización</label>
            <input type="text" required value={formData.nombre_completo} onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#9ca3af', marginBottom: '5px', fontSize: '14px' }}>Correo de Contacto (Fijo)</label>
            <input type="email" value={formData.email} disabled style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: '#6b7280', border: '1px solid #3a3a52', boxSizing: 'border-box', cursor: 'not-allowed' }} />
          </div>
        </div>

        <h3 style={{ color: 'white', borderBottom: '1px solid #3a3a52', paddingBottom: '10px', marginTop: '30px' }}>Preferencias de IA y Eco-Eficiencia</h3>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#9ca3af', marginBottom: '5px', fontSize: '14px' }}>Motor de Inteligencia Artificial (LLM)</label>
          <select value={formData.motor_ia} onChange={(e) => setFormData({...formData, motor_ia: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }}>
            <option value="gemma:2b">Gemma 2b (Local - Eco-Eficiente)</option>
            <option value="gpt-4" disabled>GPT-4 (Cloud - Bloqueado por políticas green)</option>
          </select>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', color: '#9ca3af', marginBottom: '5px', fontSize: '14px' }}>Umbral de Alerta de Consumo (kg CO2)</label>
          <input type="number" step="0.0000001" required value={formData.umbral_co2} onChange={(e) => setFormData({...formData, umbral_co2: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
          <small style={{ color: '#6b7280' }}>El backend validará este umbral en cada refactorización de código.</small>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button type="submit" style={{ padding: '12px 25px', backgroundColor: '#4ade80', color: '#1e1e2f', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Guardar en Base de Datos
          </button>
          {guardado && <span style={{ color: '#4ade80', fontWeight: 'bold' }}>✓ Guardado en MySQL</span>}
        </div>
      </form>

      {/* SECCIÓN 2: SEGURIDAD DEL USUARIO ACTUAL (Bcrypt) */}
      <form onSubmit={handleCambiarPassword} style={{ backgroundColor: '#252536', padding: '30px', borderRadius: '8px', border: '1px solid #3a3a52' }}>
        <h3 style={{ marginTop: 0, color: 'white', borderBottom: '1px solid #3a3a52', paddingBottom: '10px' }}>Seguridad de la Cuenta ({currentUser?.email})</h3>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
          Por normativa de seguridad, las contraseñas se almacenan encriptadas con algoritmo Bcrypt. Puedes actualizar tu credencial de acceso aquí.
        </p>

        {pwdExito && <div style={{ backgroundColor: '#064e3b', color: '#34d399', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '14px' }}>{pwdExito}</div>}
        {pwdError && <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '14px' }}>{pwdError}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#a5b4fc', marginBottom: '5px', fontSize: '14px' }}>Contraseña Actual</label>
            <input type="password" required value={pwdData.actual} onChange={(e) => setPwdData({...pwdData, actual: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#a5b4fc', marginBottom: '5px', fontSize: '14px' }}>Nueva Contraseña Robusta</label>
            <input type="password" required value={pwdData.nueva} onChange={(e) => setPwdData({...pwdData, nueva: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
            <small style={{ color: '#6b7280', fontSize: '12px' }}>Debe tener de 8 a 16 caracteres, mayúsculas, minúsculas y números.</small>
          </div>
        </div>

        <button type="submit" disabled={pwdLoading} style={{ padding: '12px 25px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          {pwdLoading ? 'Encriptando...' : '🔒 Actualizar Contraseña'}
        </button>
      </form>
    </div>
  );
}