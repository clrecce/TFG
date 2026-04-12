import { useState, useEffect } from 'react';

export default function Requisitos() {
  const [requisitos, setRequisitos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  
  // Estados del Formulario
  const [proyectoId, setProyectoId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('Media');
  
  // Estados de Estimación Ambiental (HU-001)
  const [kwhEstimado, setKwhEstimado] = useState(0);
  const [alertaAmbiental, setAlertaAmbiental] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resReq, resProj] = await Promise.all([
        fetch('http://127.0.0.1:8000/requisitos'),
        fetch('http://127.0.0.1:8000/proyectos')
      ]);
      setRequisitos(await resReq.json());
      
      const dataProj = await resProj.json();
      setProyectos(dataProj);
      if (dataProj.length > 0) setProyectoId(dataProj[0].id);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  // MOTOR HEURÍSTICO DE ESTIMACIÓN (Responde a la Duda A y B)
  const analizarImpactoAmbiental = (texto) => {
    setDescripcion(texto);
    
    // 1. VALIDACIÓN DE FALTA DE INFORMACIÓN (Responde a la Duda B)
    if (texto.trim().length < 20) {
      setAlertaAmbiental('⚠️ Falta contexto técnico. La descripción es muy corta para estimar el impacto ambiental (Mín. 20 caracteres).');
      setKwhEstimado(0);
      return;
    }
    
    setAlertaAmbiental(''); // Limpiamos la alerta si cumple la longitud

    // 2. ALGORITMO DE ESTIMACIÓN (Responde a la Duda A)
    let consumoBase = 1.5; // Todo requerimiento gasta un mínimo de 1.5 kWh en horas de desarrollo/test
    
    const textoLower = texto.toLowerCase();
    
    // Penalizaciones por complejidad arquitectónica (Simulación de NLP)
    if (textoLower.includes('video') || textoLower.includes('streaming') || textoLower.includes('imagen')) consumoBase += 15.0;
    if (textoLower.includes('inteligencia artificial') || textoLower.includes('ia') || textoLower.includes('machine learning')) consumoBase += 25.0;
    if (textoLower.includes('tiempo real') || textoLower.includes('socket')) consumoBase += 8.0;
    if (textoLower.includes('base de datos') || textoLower.includes('crud') || textoLower.includes('reporte')) consumoBase += 3.5;
    if (textoLower.includes('email') || textoLower.includes('notificación')) consumoBase += 1.0;

    // Multiplicador por nivel de prioridad
    let multiplicadorPrioridad = 1;
    if (prioridad === 'Alta') multiplicadorPrioridad = 1.5; // Alta prioridad suele implicar código menos optimizado por el apuro
    if (prioridad === 'Baja') multiplicadorPrioridad = 0.8;

    // Fórmula final
    const calculoFinal = consumoBase * multiplicadorPrioridad;
    setKwhEstimado(parseFloat(calculoFinal.toFixed(2)));
  };

  // Efecto para recalcular si cambian la prioridad después de escribir
  useEffect(() => {
    if (descripcion.length >= 20) {
      analizarImpactoAmbiental(descripcion);
    }
  }, [prioridad]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (kwhEstimado === 0) return alert("No se puede guardar un requerimiento sin información suficiente para la estimación ambiental.");

    try {
      await fetch('http://127.0.0.1:8000/requisitos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion,
          prioridad,
          kwh_estimado: kwhEstimado,
          proyecto_id: parseInt(proyectoId)
        })
      });
      setDescripcion('');
      setKwhEstimado(0);
      fetchData();
    } catch (error) {
      console.error("Error guardando requisito:", error);
    }
  };

  const eliminarRequisito = async (id) => {
    if (window.confirm('¿Eliminar este requisito?')) {
      try {
        await fetch(`http://127.0.0.1:8000/requisitos/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (error) { console.error(error); }
    }
  };

  return (
    <div style={{ padding: '30px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#4ade80' }}>📝 Recopilación de Requisitos (Green IT)</h2>
      <p style={{ color: '#a5b4fc', marginBottom: '30px' }}>Ingresa las historias de usuario. El sistema estimará automáticamente la huella energética proyectada de la arquitectura.</p>

      {/* FORMULARIO DE INGRESO (HU-001) */}
      <div style={{ backgroundColor: '#252536', padding: '25px', borderRadius: '8px', border: '1px solid #3a3a52', marginBottom: '40px' }}>
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#a5b4fc', fontWeight: 'bold' }}>Proyecto Vinculado</label>
              <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52' }} required>
                {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                {proyectos.length === 0 && <option value="">Debes crear un proyecto primero</option>}
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#a5b4fc', fontWeight: 'bold' }}>Prioridad de Ejecución</label>
              <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52' }}>
                <option value="Baja">Baja (Desarrollo Optimizado)</option>
                <option value="Media">Media (Estándar)</option>
                <option value="Alta">Alta (Desarrollo Acelerado)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#a5b4fc', fontWeight: 'bold' }}>Descripción Técnica de la Historia de Usuario</label>
            <textarea 
              value={descripcion} 
              onChange={(e) => analizarImpactoAmbiental(e.target.value)}
              placeholder="Ej: El sistema debe permitir a los usuarios subir un video en tiempo real y guardarlo en la base de datos..."
              style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }}
              required
            />
          </div>

          {/* PANEL DE ESTIMACIÓN Y ALERTAS */}
          <div style={{ backgroundColor: '#1a1a24', padding: '15px', borderRadius: '5px', borderLeft: alertaAmbiental ? '4px solid #f59e0b' : '4px solid #4ade80', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#9ca3af', fontSize: '13px', display: 'block' }}>Estimación Proyectada por el Analizador:</span>
              {alertaAmbiental ? (
                <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '14px' }}>{alertaAmbiental}</span>
              ) : (
                <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '18px' }}>Estructura válida. Consumo estimado:</span>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ margin: 0, color: alertaAmbiental ? '#6b7280' : '#fbbf24', fontSize: '32px' }}>{kwhEstimado} <small style={{ fontSize: '16px' }}>kWh</small></h2>
            </div>
          </div>

          <button type="submit" disabled={kwhEstimado === 0 || proyectos.length === 0} style={{ padding: '12px 25px', backgroundColor: kwhEstimado === 0 ? '#4b5563' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '5px', cursor: kwhEstimado === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', width: '100%' }}>
            ➕ Guardar Requisito en Backlog
          </button>
        </form>
      </div>

      {/* TABLA DE REQUISITOS */}
      <h3 style={{ color: '#a5b4fc', borderBottom: '1px solid #3a3a52', paddingBottom: '10px' }}>📋 Backlog de Requisitos del Sistema</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', backgroundColor: '#252536', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: '#1a1a24', color: '#4ade80', textAlign: 'left' }}>
            <th style={{ padding: '15px' }}>ID</th>
            <th style={{ padding: '15px' }}>Descripción</th>
            <th style={{ padding: '15px' }}>Prioridad</th>
            <th style={{ padding: '15px' }}>Impacto Est. (kWh)</th>
            <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {requisitos.map((r) => (
            <tr key={r.id} style={{ borderTop: '1px solid #3a3a52' }}>
              <td style={{ padding: '15px', color: '#a5b4fc', fontWeight: 'bold' }}>REQ-{r.id}</td>
              <td style={{ padding: '15px', fontSize: '14px' }}>{r.descripcion}</td>
              <td style={{ padding: '15px' }}>
                <span style={{ color: r.prioridad === 'Alta' ? '#ef4444' : r.prioridad === 'Media' ? '#f59e0b' : '#34d399', fontWeight: 'bold' }}>{r.prioridad}</span>
              </td>
              <td style={{ padding: '15px', color: '#fbbf24', fontWeight: 'bold' }}>{r.kwh_estimado}</td>
              <td style={{ padding: '15px', textAlign: 'center' }}>
                <button onClick={() => eliminarRequisito(r.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Eliminar</button>
              </td>
            </tr>
          ))}
          {requisitos.length === 0 && (<tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No hay requisitos cargados.</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}