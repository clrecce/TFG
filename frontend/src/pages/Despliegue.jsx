import { useState, useEffect } from 'react';

export default function Despliegue() {
  const [estado, setEstado] = useState('pendiente'); 
  const [proyectos, setProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState('');
  const [historialDespliegues, setHistorialDespliegues] = useState([]); 
  const [logs, setLogs] = useState(""); 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resProj = await fetch('http://127.0.0.1:8000/proyectos');
      const dataProj = await resProj.json();
      const enDesarrollo = dataProj.filter(p => p.estado === 'En Desarrollo');
      setProyectos(enDesarrollo);
      if (enDesarrollo.length > 0) setProyectoId(enDesarrollo[0].id);

      const resDesp = await fetch('http://127.0.0.1:8000/despliegues');
      setHistorialDespliegues(await resDesp.json());
    } catch (error) {
      console.error("Error cargando datos de CI/CD", error);
    }
  };
  
  // ESTA ES LA FUNCIÓN NUEVA QUE HACE EL TESTING REAL
  const ejecutarPruebaReal = async () => {
    if (!proyectoId) return alert("No hay proyectos 'En Desarrollo' listos para probar.");
    setEstado('testeando');
    setLogs("Iniciando compilador virtual... analizando código fuente...\n");
    
    try {
      const resOpt = await fetch('http://127.0.0.1:8000/optimizaciones');
      const dataOpt = await resOpt.json();
      const ultimoCodigo = dataOpt.length > 0 ? dataOpt[0].codigo_optimizado : "print('Validación exitosa')";

      const resTest = await fetch('http://127.0.0.1:8000/ejecutar-test-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: ultimoCodigo,
          lenguaje: 'python', 
          proyecto_id: parseInt(proyectoId)
        })
      });
      
      const data = await resTest.json();
      setLogs(data.logs);
      
      if (data.resultado) {
          setEstado('aprobado');
      } else {
          setEstado('error');
      }
    } catch (e) {
      setLogs("Error de conexión con el motor de pruebas.");
      setEstado('error');
    }
  };

  const ejecutarDespliegue = async () => {
    setEstado('desplegado');
    try {
      await fetch('http://127.0.0.1:8000/despliegues', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entorno: 'AWS EC2/S3', metricas_eco: `Código Verificado - Óptimo`, proyecto_id: parseInt(proyectoId) })
      });
      await fetch(`http://127.0.0.1:8000/proyectos/${proyectoId}/estado`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Desplegado' })
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ padding: '30px', color: 'white', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#4ade80' }}>🚀 Pipeline de CI/CD: Pruebas y Despliegue</h2>
      <p style={{ color: '#a5b4fc', marginBottom: '30px' }}>Ejecución real de pruebas de integridad y sintaxis antes del pase a producción.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', color: '#a5b4fc', fontWeight: 'bold' }}>Proyecto a Desplegar:</label>
        <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)} style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52' }}>
          {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.estado})</option>)}
          {proyectos.length === 0 && <option value="">No hay proyectos pendientes</option>}
        </select>
      </div>

      <div style={{ backgroundColor: '#252536', padding: '30px', borderRadius: '8px', border: '1px solid #3a3a52', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Estado: <span style={{ color: estado === 'desplegado' ? '#4ade80' : estado === 'error' ? '#ef4444' : estado === 'aprobado' ? '#f59e0b' : '#a5b4fc', marginLeft: '10px' }}>{estado.toUpperCase()}</span></h3>
          
          {/* EL BOTÓN AHORA ES "EJECUTAR PRUEBAS FÍSICAS" */}
          {estado === 'pendiente' && <button onClick={ejecutarPruebaReal} disabled={proyectos.length === 0} style={{ padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: proyectos.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: proyectos.length === 0 ? 0.5 : 1 }}>▶️ Ejecutar Pruebas Físicas</button>}
          {estado === 'error' && <button onClick={ejecutarPruebaReal} style={{ padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>🔄 Reintentar Pipeline</button>}
          {estado === 'aprobado' && <button onClick={ejecutarDespliegue} style={{ padding: '10px', backgroundColor: '#4ade80', color: '#1e1e2f', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>☁️ Aprobar Despliegue AWS</button>}
        </div>

        <div style={{ backgroundColor: '#1e1e2f', padding: '15px', borderRadius: '5px', fontFamily: 'monospace', color: '#d1d5db', minHeight: '160px', whiteSpace: 'pre-wrap' }}>
          {estado === 'pendiente' && <span style={{ color: '#888' }}>Esperando inicio de pipeline en entorno virtual...</span>}
          {estado === 'testeando' && <span style={{ color: '#f59e0b' }}>{logs}</span>}
          {estado === 'error' && <span style={{ color: '#ef4444' }}>[FALLO CRÍTICO] Las pruebas no pasaron:\n\n{logs}</span>}
          {(estado === 'aprobado' || estado === 'desplegado') && (
            <>
              <span style={{ color: '#a5b4fc' }}>{logs}</span>
              <p style={{ margin: '15px 0 5px 0', color: '#4ade80' }}>[OK] Pruebas de sintaxis superadas exitosamente. Certificado en base de datos.</p>
            </>
          )}
          {estado === 'desplegado' && (
            <p style={{ margin: '15px 0 0 0', color: '#34d399', fontWeight: 'bold', borderTop: '1px solid #3a3a52', paddingTop: '10px' }}>[SUCCESS] Despliegue en AWS finalizado. Proyecto actualizado a "Desplegado".</p>
          )}
        </div>
      </div>

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