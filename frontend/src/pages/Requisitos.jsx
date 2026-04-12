import { useState, useEffect } from 'react';

export default function Requisitos() {
  const [requisitos, setRequisitos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('Media');
  const [kwhEstimado, setKwhEstimado] = useState(0);
  const [alertaAmbiental, setAlertaAmbiental] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [resReq, resProj] = await Promise.all([fetch('http://127.0.0.1:8000/requisitos'), fetch('http://127.0.0.1:8000/proyectos')]);
      setRequisitos(await resReq.json());
      const dataProj = await resProj.json();
      setProyectos(dataProj);
      if (dataProj.length > 0) setProyectoId(dataProj[0].id);
    } catch (error) { console.error("Error:", error); }
  };

  const analizarImpactoAmbiental = (texto) => {
    setDescripcion(texto);
    if (texto.trim().length < 20) {
      setAlertaAmbiental('⚠️ Falta contexto técnico. (Mín. 20 caracteres).');
      setKwhEstimado(0); return;
    }
    setAlertaAmbiental('');
    let consumoBase = 1.5; 
    const textoLower = texto.toLowerCase();
    if (textoLower.includes('video') || textoLower.includes('streaming') || textoLower.includes('imagen')) consumoBase += 15.0;
    if (textoLower.includes('inteligencia artificial') || textoLower.includes('ia') || textoLower.includes('machine learning')) consumoBase += 25.0;
    if (textoLower.includes('tiempo real') || textoLower.includes('socket')) consumoBase += 8.0;
    if (textoLower.includes('base de datos') || textoLower.includes('crud')) consumoBase += 3.5;
    
    let multiplicadorPrioridad = prioridad === 'Alta' ? 1.5 : prioridad === 'Baja' ? 0.8 : 1;
    setKwhEstimado(parseFloat((consumoBase * multiplicadorPrioridad).toFixed(2)));
  };

  useEffect(() => { if (descripcion.length >= 20) analizarImpactoAmbiental(descripcion); }, [prioridad]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (kwhEstimado === 0) return;
    try {
      await fetch('http://127.0.0.1:8000/requisitos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ descripcion, prioridad, kwh_estimado: kwhEstimado, proyecto_id: parseInt(proyectoId) }) });
      setDescripcion(''); setKwhEstimado(0); fetchData();
    } catch (error) { console.error(error); }
  };

  const eliminarRequisito = async (id) => {
    if (window.confirm('¿Eliminar este requisito?')) {
      await fetch(`http://127.0.0.1:8000/requisitos/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  return (
    <div style={{ padding: '20px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#4ade80' }}>📝 Recopilación de Requisitos (Green IT)</h2>
      <p style={{ color: '#a5b4fc', marginBottom: '20px' }}>Ingresa las historias de usuario y el sistema estimará la huella energética.</p>

      <div style={{ backgroundColor: '#252536', padding: '20px', borderRadius: '8px', border: '1px solid #3a3a52', marginBottom: '30px' }}>
        <form onSubmit={handleSubmit}>
          {/* RESPONSIVE FORM */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '15px' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#a5b4fc', fontWeight: 'bold' }}>Proyecto</label>
              <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52' }} required>
                {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#a5b4fc', fontWeight: 'bold' }}>Prioridad</label>
              <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52' }}>
                <option value="Baja">Baja (Optimizado)</option><option value="Media">Media (Estándar)</option><option value="Alta">Alta (Acelerado)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#a5b4fc', fontWeight: 'bold' }}>Descripción Técnica</label>
            <textarea value={descripcion} onChange={(e) => analizarImpactoAmbiental(e.target.value)} style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} required />
          </div>

          {/* PANEL DE IMPACTO RESPONSIVE */}
          <div style={{ backgroundColor: '#1a1a24', padding: '15px', borderRadius: '5px', borderLeft: alertaAmbiental ? '4px solid #f59e0b' : '4px solid #4ade80', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
            <div>
              <span style={{ color: '#9ca3af', fontSize: '12px', display: 'block' }}>Estimación Proyectada:</span>
              <span style={{ color: alertaAmbiental ? '#f59e0b' : '#4ade80', fontWeight: 'bold', fontSize: '14px' }}>{alertaAmbiental || "Estructura válida"}</span>
            </div>
            <h2 style={{ margin: 0, color: alertaAmbiental ? '#6b7280' : '#fbbf24', fontSize: '28px' }}>{kwhEstimado} <small style={{ fontSize: '14px' }}>kWh</small></h2>
          </div>

          <button type="submit" disabled={kwhEstimado === 0} style={{ padding: '12px', backgroundColor: kwhEstimado === 0 ? '#4b5563' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '5px', cursor: kwhEstimado === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', width: '100%' }}>➕ Guardar Requisito</button>
        </form>
      </div>

      {/* RESPONSIVE TABLE WRAPPER */}
      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #3a3a52' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#252536', minWidth: '600px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1a1a24', color: '#4ade80', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>ID</th>
              <th style={{ padding: '15px' }}>Descripción</th>
              <th style={{ padding: '15px' }}>Prioridad</th>
              <th style={{ padding: '15px' }}>Impacto (kWh)</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {requisitos.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid #3a3a52' }}>
                <td style={{ padding: '15px', color: '#a5b4fc' }}>REQ-{r.id}</td>
                <td style={{ padding: '15px', fontSize: '13px' }}>{r.descripcion}</td>
                <td style={{ padding: '15px', color: r.prioridad === 'Alta' ? '#ef4444' : '#34d399' }}>{r.prioridad}</td>
                <td style={{ padding: '15px', color: '#fbbf24', fontWeight: 'bold' }}>{r.kwh_estimado}</td>
                <td style={{ padding: '15px', textAlign: 'center' }}><button onClick={() => eliminarRequisito(r.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px' }}>Borrar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}