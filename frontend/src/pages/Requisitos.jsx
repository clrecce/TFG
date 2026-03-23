import { useState, useEffect } from 'react';

export default function Requisitos() {
  const [requisitos, setRequisitos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [formData, setFormData] = useState({ descripcion: '', prioridad: 'Alta', kwh_estimado: 0, proyecto_id: '' });
  const [estimando, setEstimando] = useState(false);

  useEffect(() => {
    fetchRequisitos();
    fetchProyectos();
  }, []);

  const fetchRequisitos = async () => {
    const res = await fetch('http://127.0.0.1:8000/requisitos');
    setRequisitos(await res.json());
  };

  const fetchProyectos = async () => {
    const res = await fetch('http://127.0.0.1:8000/proyectos');
    const data = await res.json();
    setProyectos(data);
    if (data.length > 0) setFormData(prev => ({ ...prev, proyecto_id: data[0].id }));
  };

  const estimarConIA = () => {
    if (!formData.descripcion) return alert("Por favor, ingresa una descripción primero.");
    setEstimando(true);
    setTimeout(() => {
      let estimado = 0;
      if (formData.prioridad === 'Alta') estimado = 8.5 + (Math.random() * 2);
      if (formData.prioridad === 'Media') estimado = 5.0 + (Math.random() * 1.5);
      if (formData.prioridad === 'Baja') estimado = 2.0 + (Math.random() * 1);
      
      setFormData({ ...formData, kwh_estimado: parseFloat(estimado.toFixed(2)) });
      setEstimando(false);
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.kwh_estimado === 0) return alert("Debes estimar el consumo con la IA antes de guardar.");
    
    await fetch('http://127.0.0.1:8000/requisitos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ ...formData, descripcion: '', kwh_estimado: 0 }); 
    fetchRequisitos(); 
  };

  // NUEVO: Función para eliminar requisito
  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este requisito de forma permanente?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/requisitos/${id}`, { method: 'DELETE' });
      fetchRequisitos();
    } catch (error) { console.error("Error eliminando:", error); }
  };

  return (
    <div style={{ padding: '30px', color: 'white', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#4ade80' }}>📄 Recopilación de Requisitos con Métricas Energéticas</h2>
      
      <div style={{ backgroundColor: '#252536', padding: '20px', borderRadius: '8px', border: '1px solid #3a3a52' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <label style={{ fontWeight: 'bold', color: '#a5b4fc' }}>Vincular al Proyecto *</label>
          <select required value={formData.proyecto_id} onChange={(e) => setFormData({...formData, proyecto_id: parseInt(e.target.value)})} style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52' }}>
            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>

          <label style={{ fontWeight: 'bold', color: '#a5b4fc' }}>Descripción del Requisito *</label>
          <textarea required rows="3" style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52' }} value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} />

          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: 'bold', color: '#a5b4fc', marginBottom: '5px' }}>Prioridad *</label>
              <select value={formData.prioridad} onChange={(e) => setFormData({...formData, prioridad: e.target.value, kwh_estimado: 0})} style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52' }}>
                <option value="Alta">Alta</option><option value="Media">Media</option><option value="Baja">Baja</option>
              </select>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: 'bold', color: '#a5b4fc', marginBottom: '5px' }}>Estimación Inicial (kWh) *</label>
              <input type="number" readOnly value={formData.kwh_estimado} style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#1a1a24', color: '#f87171', border: '1px solid #3a3a52', cursor: 'not-allowed', fontWeight: 'bold' }} />
            </div>
          </div>

          <button type="button" onClick={estimarConIA} disabled={estimando} style={{ padding: '12px', backgroundColor: '#8b5cf6', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            {estimando ? '⏳ Analizando métricas...' : '✨ Integrar Métricas IA (Auto-sugerencias)'}
          </button>

          <button type="submit" style={{ padding: '12px', backgroundColor: '#4ade80', color: '#1e1e2f', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            ✓ Validar y Agregar
          </button>
        </form>
      </div>

      <h3 style={{ marginTop: '30px', color: '#a5b4fc' }}>📊 Vista Previa</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#252536', borderRadius: '8px', overflow: 'hidden' }}>
        <thead><tr style={{ backgroundColor: '#1a1a24', color: '#4ade80', textAlign: 'left' }}><th style={{ padding: '10px' }}>ID</th><th style={{ padding: '10px' }}>Proyecto</th><th style={{ padding: '10px' }}>Descripción</th><th style={{ padding: '10px' }}>kWh</th><th style={{ padding: '10px', textAlign:'center' }}>Acciones</th></tr></thead>
        <tbody>
          {requisitos.map((req) => (<tr key={req.id} style={{ borderTop: '1px solid #3a3a52' }}><td style={{ padding: '10px' }}>REQ-{req.id}</td><td style={{ padding: '10px', color: '#a5b4fc' }}>PRJ-{req.proyecto_id}</td><td style={{ padding: '10px' }}>{req.descripcion}</td><td style={{ padding: '10px', color: '#f87171', fontWeight: 'bold' }}>{req.kwh_estimado}</td><td style={{ padding: '10px', textAlign: 'center' }}><button onClick={() => handleDelete(req.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }} title="Eliminar Requisito">🗑️</button></td></tr>))}
          {requisitos.length === 0 && (<tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No hay requisitos cargados.</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}