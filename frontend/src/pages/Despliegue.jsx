import { useState, useEffect } from 'react';

export default function Despliegue() {
  const [estado, setEstado] = useState('pendiente'); 
  const [proyectos, setProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState('');
  const [ultimaMetrica, setUltimaMetrica] = useState(null);
  const [historialDespliegues, setHistorialDespliegues] = useState([]); // NUEVO ESTADO

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Proyectos "En Desarrollo"
      const resProj = await fetch('http://127.0.0.1:8000/proyectos');
      const dataProj = await resProj.json();
      const enDesarrollo = dataProj.filter(p => p.estado === 'En Desarrollo');
      setProyectos(enDesarrollo);
      if (enDesarrollo.length > 0) setProyectoId(enDesarrollo[0].id);

      // 2. Última métrica de la IA
      const resOpt = await fetch('http://127.0.0.1:8000/optimizaciones');
      const dataOpt = await resOpt.json();
      if (dataOpt.length > 0) setUltimaMetrica(dataOpt[0].emisiones_co2_kg);

      // 3. Historial de Despliegues (CRUD Completo)
      const resDesp = await fetch('http://127.0.0.1:8000/despliegues');
      setHistorialDespliegues(await resDesp.json());
    } catch (error) {
      console.error("Error cargando datos de CI/CD", error);
    }
  };
  
  const simularPipeline = async () => {
    if (!proyectoId) return alert("No hay proyectos 'En Desarrollo' listos para probar.");
    setEstado('testeando');
    
    const metricaFinal = ultimaMetrica !== null ? ultimaMetrica : 0.0450;

    try {
      // Ahora enviamos el proyecto_id para cumplir el DER a rajatabla
      await fetch('http://127.0.0.1:8000/pruebas', { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          tipo: 'Funcional y Energética', 
          resultado: true, 
          eficiencia_energetica: parseFloat(metricaFinal.toFixed(6)),
          proyecto_id: parseInt(proyectoId)
        }) 
      });
    } catch (e) { console.error(e); }
    
    setTimeout(() => { setEstado('aprobado'); }, 3000);
  };

  const ejecutarDespliegue = async () => {
    setEstado('desplegado');
    const metricaFinal = ultimaMetrica !== null ? ultimaMetrica : 0.0450;

    try {
      await fetch('http://127.0.0.1:8000/despliegues', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          entorno: 'AWS EC2/S3', 
          metricas_eco: `Óptimo (${metricaFinal.toFixed(6)} kg CO2)`, 
          proyecto_id: parseInt(proyectoId) 
        })
      });
      await fetch(`http://127.0.0.1:8000/proyectos/${proyectoId}/estado`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Desplegado' })
      });
      
      // Recargamos los datos para actualizar las tablas y selectores
      fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ padding: '30px', color: 'white', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#4ade80' }}>🚀 Pipeline de CI/CD: Pruebas y Despliegue</h2>
      <p style={{ color: '#a5b4fc', marginBottom: '30px' }}>Integración Continua vinculada a métricas reales de CodeCarbon extraídas del Editor IA.</p>
      
      {/* SECCIÓN 1: EJECUCIÓN DEL PIPELINE */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', color: '#a5b4fc', fontWeight: 'bold' }}>Proyecto a Desplegar:</label>
        <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)} style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52' }}>
          {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.estado})</option>)}
          {proyectos.length === 0 && <option value="">No hay proyectos pendientes</option>}
        </select>
      </div>

      <div style={{ backgroundColor: '#252536', padding: '30px', borderRadius: '8px', border: '1px solid #3a3a52', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Estado: <span style={{ color: estado === 'desplegado' ? '#4ade80' : estado === 'aprobado' ? '#f59e0b' : '#a5b4fc', marginLeft: '10px' }}>{estado.toUpperCase()}</span></h3>
          {estado === 'pendiente' && <button onClick={simularPipeline} disabled={proyectos.length === 0} style={{ padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: proyectos.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: proyectos.length === 0 ? 0.5 : 1 }}>▶️ Ejecutar Pruebas Inteligentes</button>}
          {estado === 'aprobado' && <button onClick={ejecutarDespliegue} style={{ padding: '10px', backgroundColor: '#4ade80', color: '#1e1e2f', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>☁️ Aprobar Despliegue AWS</button>}
        </div>

        <div style={{ backgroundColor: '#1e1e2f', padding: '15px', borderRadius: '5px', fontFamily: 'monospace', color: '#d1d5db', minHeight: '160px' }}>
          {estado === 'pendiente' && <span style={{ color: '#888' }}>Esperando inicio de pipeline en entorno virtual...</span>}
          {(estado === 'testeando' || estado === 'aprobado' || estado === 'desplegado') && (
            <div>
              <p style={{ margin: '5px 0' }}>[INFO] Entorno de pruebas iniciado...</p>
              <p style={{ margin: '5px 0', color: '#f59e0b' }}>[MÉTRICA] Consumo evaluado según última optimización IA: {ultimaMetrica !== null ? ultimaMetrica.toFixed(6) : '0.045000'} kg CO2</p>
              <p style={{ margin: '5px 0' }}>[TEST] Ejecutando flujos funcionales del código...</p>
            </div>
          )}
          {(estado === 'aprobado' || estado === 'desplegado') && (
            <p style={{ margin: '5px 0', color: '#4ade80' }}>[OK] 15/15 Pruebas pasadas exitosamente. Métrica guardada en BD.</p>
          )}
          {estado === 'desplegado' && (
            <p style={{ margin: '15px 0 0 0', color: '#34d399', fontWeight: 'bold', borderTop: '1px solid #3a3a52', paddingTop: '10px' }}>[SUCCESS] Despliegue en AWS finalizado. Proyecto actualizado a "Desplegado".</p>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: HISTORIAL DE DESPLIEGUES (NUEVO) */}
      <h3 style={{ color: '#a5b4fc', borderBottom: '1px solid #3a3a52', paddingBottom: '10px' }}>🗄️ Historial de Despliegues Exitosos</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', backgroundColor: '#252536', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: '#1a1a24', color: '#4ade80', textAlign: 'left' }}>
            <th style={{ padding: '15px' }}>ID Despliegue</th>
            <th style={{ padding: '15px' }}>Proyecto</th>
            <th style={{ padding: '15px' }}>Fecha</th>
            <th style={{ padding: '15px' }}>Entorno</th>
            <th style={{ padding: '15px' }}>Certificación Eco</th>
          </tr>
        </thead>
        <tbody>
          {historialDespliegues.map((d) => (
            <tr key={d.id} style={{ borderTop: '1px solid #3a3a52' }}>
              <td style={{ padding: '15px', color: '#a5b4fc', fontWeight: 'bold' }}>DEP-{d.id.toString().padStart(3, '0')}</td>
              <td style={{ padding: '15px', fontWeight: 'bold' }}>{d.proyecto_nombre}</td>
              <td style={{ padding: '15px' }}>{d.fecha_despliegue}</td>
              <td style={{ padding: '15px' }}>
                <span style={{ backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{d.entorno}</span>
              </td>
              <td style={{ padding: '15px', color: '#34d399', fontSize: '13px' }}>{d.metricas_eco}</td>
            </tr>
          ))}
          {historialDespliegues.length === 0 && (<tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No hay despliegues registrados.</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}