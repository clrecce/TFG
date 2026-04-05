import { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

export default function Editor() {
  const editorRef = useRef(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [metrics, setMetrics] = useState(null);
  // Por defecto lo ponemos en Python para que tu prueba no falle si te olvidas de cambiarlo
  const [lenguaje, setLenguaje] = useState('Python'); 
  const [codigoBackend, setCodigoBackend] = useState('');
  const [proyectos, setProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/proyectos')
      .then(res => res.json())
      .then(data => {
        const enDesarrollo = data.filter(p => p.estado === 'En Desarrollo');
        setProyectos(enDesarrollo);
        if (enDesarrollo.length > 0) setProyectoId(enDesarrollo[0].id);
      })
      .catch(err => console.error("Error cargando proyectos:", err));

    if (!editorRef.current) {
      editorRef.current = grapesjs.init({
        container: '#editor-canvas', fromElement: false, height: '100%', width: '100%', storageManager: false, panels: { defaults: [] },
        blockManager: {
          appendTo: '#blocks',
          blocks: [
            { id: 'eco-button', label: '<b>Botón Semántico</b> <br/> <small>⚡ 0.3 kWh</small>', content: '<button style="padding:10px 20px; background:#4ade80; border:none; border-radius:5px; color:#1e1e2f; font-weight:bold; cursor:pointer; margin:5px;">Botón Eco</button>' },
            { id: 'eco-form', label: '<b>Formulario</b> <br/> <small>⚡ 1.2 kWh</small>', content: '<form style="padding:20px; background:#f4f4f5; border-radius:8px; margin:5px;"><input type="text" placeholder="Ingresa datos..." style="padding:10px; width:80%; margin-bottom:10px;"/><br/><button style="padding:10px 20px; background:#4ade80; border:none; border-radius:5px;">Enviar</button></form>' },
            { id: 'api-rest', label: '<b>Lógica API</b> <br/> <small>⚡ 1.5 kWh</small>', content: '<div style="padding:15px; background:#3b82f6; color:white; border-radius:5px; text-align:center; margin:5px;">Conexión a Entidad DER</div>' },
            { id: 'ml-model', label: '<b>Modelo ML</b> <br/> <small>⚡ 2.1 kWh</small>', content: '<div style="padding:15px; background:#8b5cf6; color:white; border-radius:5px; text-align:center; margin:5px;">Optimización Gemma (Simulada)</div>' }
          ]
        }
      });
    }
    return () => { if (editorRef.current) { editorRef.current.destroy(); editorRef.current = null; } };
  }, []);

  const handleOptimize = async () => {
    if (!editorRef.current) return;
    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();
    const fullUI = `<style>\n${css}\n</style>\n${html}`;

    setIsOptimizing(true); setMetrics(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/optimizar-codigo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo_ui: fullUI, codigo_logica: codigoBackend, lenguaje: lenguaje })
      });
      setMetrics(await response.json());
    } catch (error) { alert("Error al optimizar."); } 
    finally { setIsOptimizing(false); }
  };

  const descargarCodigo = () => {
    if (!metrics) return;
    let extension = 'html';
    if (lenguaje === 'Node.js') extension = 'js';
    if (lenguaje === 'Python') extension = 'py';

    const blob = new Blob([metrics.codigo_optimizado], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codigo_optimizado_ecodev.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ecodev-layout" style={{ height: '100%', width: '100%', display: 'flex' }}>
      <div className="panel-lateral">
        <div className="panel-header">Bloques de UI</div>
        <div id="blocks" style={{ flexGrow: 1, overflowY: 'auto' }}></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
        <div className="header-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#a5b4fc', fontWeight: 'bold' }}>Arquitectura Full-Stack</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '15px', borderLeft: '1px solid #3a3a52', paddingLeft: '15px' }}>
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>Proyecto:</span>
            <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)} style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: '#2d2d44', color: 'white', border: '1px solid #3a3a52', maxWidth: '200px' }}>
              {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              {proyectos.length === 0 && <option value="">Sin proyectos en desarrollo</option>}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>Lenguaje:</span>
            <select value={lenguaje} onChange={(e) => setLenguaje(e.target.value)} style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: '#2d2d44', color: 'white', border: '1px solid #3a3a52' }}>
              <option value="Python">Python (Lógica/DER)</option>
              <option value="Node.js">Node.js (Lógica)</option>
              <option value="HTML/CSS">HTML/CSS/JS</option>
            </select>
          </div>

          <button className="btn-optimizar" onClick={handleOptimize} disabled={isOptimizing || proyectos.length === 0} style={{ marginLeft: 'auto', opacity: proyectos.length === 0 ? 0.5 : 1 }}>
            {isOptimizing ? '⏳ Green Coding Gemma 2b...' : '✨ Generar Arquitectura Semántica y Medir CO2'}
          </button>
        </div>
        
        <div style={{ position: 'relative', flexGrow: 1, width: '100%', backgroundColor: '#ffffff', minHeight: '350px' }}>
          <div id="editor-canvas" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}></div>
        </div>

        <div style={{ height: '200px', backgroundColor: '#1a1a24', borderTop: '2px solid #3a3a52', padding: '15px' }}>
          <label style={{ color: '#a5b4fc', fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
            Lógica de Backend/DER (Opcional - {lenguaje})
          </label>
          <textarea 
            value={codigoBackend} 
            onChange={(e) => setCodigoBackend(e.target.value)}
            placeholder="Pega aquí tu código de Python o Node.js que conecta con el DER para que la IA lo optimice."
            style={{ width: '100%', height: '150px', backgroundColor: '#1e1e2f', color: '#fca5a5', border: '1px solid #3a3a52', borderRadius: '5px', fontFamily: 'monospace', fontSize: '12px', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {metrics && (
        <div className="metrics-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ color: '#4ade80', margin: 0 }}>Dashboard Ambiental</h3>
            <button onClick={() => setMetrics(null)} style={{ background: 'none', color: 'white', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✖</button>
          </div>
          <div className="metric-card" style={{ borderLeftColor: '#ef4444' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>Costo Energético (CodeCarbon)</p>
            <h2 style={{ margin: '5px 0', color: '#f87171' }}>{metrics.emisiones_co2_kg.toFixed(8)} kg CO2</h2>
          </div>
          <div className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>Refactorización Unificada ({lenguaje})</p>
              <button onClick={descargarCodigo} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                📥 Descargar Archivo
              </button>
            </div>
            <div className="code-box" style={{ marginTop: '10px', height: '300px' }}>{metrics.codigo_optimizado}</div>
          </div>
        </div>
      )}
    </div>
  );
}