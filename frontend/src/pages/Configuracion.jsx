import { useState, useEffect } from 'react';

export default function Configuracion() {
  const [guardado, setGuardado] = useState(false);
  const [formData, setFormData] = useState({ nombre_completo: '', email: '', motor_ia: 'gemma:2b', umbral_co2: 0.05 });
  
  // Estados para la sección de Seguridad
  const [pwdData, setPwdData] = useState({ actual: '', nueva: '' });
  const [pwdExito, setPwdExito] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Estados exclusivos para el Alta de Usuarios por el Administrador
  const [regData, setRegData] = useState({ nombre: '', email: '', password: '', rol: 'Desarrollador' });
  const [regExito, setRegExito] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

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
    } catch (err) { console.error(err); }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setPwdLoading(true); setPwdError(''); setPwdExito('');
    
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,16}$/;
    if (!regex.test(pwdData.nueva)) {
      setPwdError('La nueva contraseña debe tener entre 8 y 16 caracteres, e incluir mayúsculas, minúsculas y números.');
      setPwdLoading(false); return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/cambiar-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser?.email,
          actual: pwdData.actual,
          nueva: pwdData.nueva
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPwdExito('Contraseña actualizada con éxito.');
        setPwdData({ actual: '', nueva: '' });
      } else {
        setPwdError(data.detail || 'Error al cambiar la contraseña.');
      }
    } catch (err) {
      setPwdError('Error de conexión con el servidor.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleRegistroAdminSubmit = async (e) => {
    e.preventDefault();
    setRegLoading(true); setRegError(''); setRegExito('');
    
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,16}$/;
    if (!regex.test(regData.password)) {
      setRegError('La contraseña debe tener entre 8 y 16 caracteres, e incluir mayúsculas, minúsculas y números.');
      setRegLoading(false); return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/registro', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setRegExito(`Usuario creado con éxito con el rol de ${regData.rol}.`);
        setRegData({ nombre: '', email: '', password: '', rol: 'Desarrollador' });
      } else {
        setRegError(data.detail || 'Error al registrar el usuario.');
      }
    } catch (error) {
      setRegError("Error de conexión con el servidor MySQL.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', color: 'white', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <h2 style={{ color: '#8b5cf6', margin: 0 }}>Configuración del Sistema y Seguridad</h2>
      
      <form onSubmit={handleGuardarConfig} style={{ backgroundColor: '#252536', padding: '30px', borderRadius: '8px', border: '1px solid #3a3a52' }}>
        <h3 style={{ marginTop: 0, color: 'white', borderBottom: '1px solid #3a3a52', paddingBottom: '10px' }}>Parámetros de la Plataforma</h3>
        {guardado && <div style={{ backgroundColor: '#064e3b', color: '#34d399', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '14px' }}>Cambios guardados correctamente en la base de datos.</div>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#a5b4fc', marginBottom: '5px', fontSize: '14px' }}>Nombre de la Organización</label>
            <input type="text" value={formData.nombre_completo} onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#a5b4fc', marginBottom: '5px', fontSize: '14px' }}>Motor de Inteligencia Artificial Predeterminado</label>
            <select value={formData.motor_ia} onChange={(e) => setFormData({...formData, motor_ia: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }}>
              <option value="gemma:2b">Gemma 2B (Local & Eco-Friendly)</option>
              <option value="llama3:8b">Llama 3 8B (Local Heavy)</option>
              <option value="code_gemma">CodeGemma (Specialized)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: '#a5b4fc', marginBottom: '5px', fontSize: '14px' }}>Umbral de Tolerancia Máxima de CO2 (kg por proceso)</label>
            <input type="number" step="0.001" value={formData.umbral_co2} onChange={(e) => setFormData({...formData, umbral_co2: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
          </div>
        </div>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4ade80', color: '#1e1e2f', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar Configuración</button>
      </form>

      <form onSubmit={handleCambiarPassword} style={{ backgroundColor: '#252536', padding: '30px', borderRadius: '8px', border: '1px solid #3a3a52' }}>
        <h3 style={{ marginTop: 0, color: 'white', borderBottom: '1px solid #3a3a52', paddingBottom: '10px' }}>Gestión de Credenciales Personales</h3>
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
        <button type="submit" disabled={pwdLoading} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          {pwdLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </button>
      </form>

      {currentUser?.rol === 'Administrador' && (
        <form onSubmit={handleRegistroAdminSubmit} style={{ backgroundColor: '#252536', padding: '30px', borderRadius: '8px', border: '1px solid #3a3a52' }}>
          <h3 style={{ marginTop: 0, color: '#8b5cf6', borderBottom: '1px solid #3a3a52', paddingBottom: '10px' }}>Panel de Alta de Usuarios (Privilegio Root)</h3>
          
          {regExito && <div style={{ backgroundColor: '#064e3b', color: '#34d399', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '14px' }}>{regExito}</div>}
          {regError && <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '14px' }}>{regError}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#a5b4fc', marginBottom: '5px', fontSize: '14px' }}>Nombre Completo</label>
              <input type="text" required value={regData.nombre} onChange={(e) => setRegData({...regData, nombre: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a5b4fc', marginBottom: '5px', fontSize: '14px' }}>Correo Electrónico Institucional</label>
              <input type="email" required value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a5b4fc', marginBottom: '5px', fontSize: '14px' }}>Contraseña Inicial Provisoria</label>
              <input type="password" required value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
              <small style={{ color: '#6b7280', fontSize: '12px' }}>Debe tener de 8 a 16 caracteres, mayúsculas, minúsculas y números.</small>
            </div>
            <div>
              <label style={{ display: 'block', color: '#a5b4fc', marginBottom: '5px', fontSize: '14px' }}>Asignación de Rol Operativo</label>
              <select value={regData.rol} onChange={(e) => setRegData({...regData, rol: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }}>
                <option value="Desarrollador">Desarrollador</option>
                <option value="Arquitecto de Software">Arquitecto de Software</option>
                <option value="Gerente de Proyecto">Gerente de Proyecto</option>
                <option value="Ingeniero de Operaciones">Ingeniero de Operaciones</option>
                <option value="Administrador">Administrador (Root)</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={regLoading} style={{ padding: '10px 20px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {regLoading ? 'Registrando en MySQL...' : 'Crear Cuenta de Usuario'}
          </button>
        </form>
      )}
    </div>
  );
}