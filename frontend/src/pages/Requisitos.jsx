import { useState, useEffect } from 'react';

export default function Requisitos() {
  const [requisitos, setRequisitos] = useState([]);
  const [formData, setFormData] = useState({
    descripcion: '',
    prioridad: 'Alta',
    kwh_estimado: 0
  });

  // Cargar requisitos al iniciar
  useEffect(() => {
    fetchRequisitos();
  }, []);

  const fetchRequisitos = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/requisitos');
      const data = await res.json();
      setRequisitos(data);
    } catch (error) {
      console.error("Error obteniendo requisitos:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://127.0.0.1:8000/requisitos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setFormData({ descripcion: '', prioridad: 'Alta', kwh_estimado: 0 }); // Limpiar
      fetchRequisitos(); // Recargar lista
    } catch (error) {
      console.error("Error guardando requisito:", error);
    }
  };

  return (
    <div style={{ padding: '30px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#4ade80' }}>📄 Recopilación de Requisitos con Métricas Energéticas</h2>
      
      <div style={{ backgroundColor: '#252536', padding: '20px', borderRadius: '8px', border: '1px solid #3a3a52' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <label style={{ fontWeight: 'bold', color: '#a5b4fc' }}>Descripción del Requisito *</label>
          <textarea 
            required
            rows="4"
            style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52' }}
            placeholder="Describe el requisito funcional de la aplicación..."
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
          />

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: 'bold', color: '#a5b4fc', marginBottom: '5px' }}>Prioridad *</label>
              <select 
                style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52' }}
                value={formData.prioridad}
                onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: 'bold', color: '#a5b4fc', marginBottom: '5px' }}>Estimación de Consumo (kWh) *</label>
              <input 
                type="number" 
                step="0.1"
                required
                style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52' }}
                value={formData.kwh_estimado}
                onChange={(e) => setFormData({...formData, kwh_estimado: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={{ padding: '12px', backgroundColor: '#4ade80', color: '#1e1e2f', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
          >
            ✓ Validar y Agregar
          </button>
        </form>
      </div>

      <h3 style={{ marginTop: '40px', color: '#a5b4fc' }}>📊 Vista Previa de Requisitos</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', backgroundColor: '#252536', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: '#1a1a24', color: '#4ade80', textAlign: 'left' }}>
            <th style={{ padding: '15px' }}>ID</th>
            <th style={{ padding: '15px' }}>Descripción</th>
            <th style={{ padding: '15px' }}>Prioridad</th>
            <th style={{ padding: '15px' }}>kWh Estimado</th>
          </tr>
        </thead>
        <tbody>
          {requisitos.map((req) => (
            <tr key={req.id} style={{ borderTop: '1px solid #3a3a52' }}>
              <td style={{ padding: '15px' }}>REQ-{req.id.toString().padStart(3, '0')}</td>
              <td style={{ padding: '15px' }}>{req.descripcion}</td>
              <td style={{ padding: '15px' }}>{req.prioridad}</td>
              <td style={{ padding: '15px', color: '#f87171', fontWeight: 'bold' }}>{req.kwh_estimado}</td>
            </tr>
          ))}
          {requisitos.length === 0 && (
            <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No hay requisitos cargados aún.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}