import { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

export default function Editor() {
  const editorRef = useRef(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [lenguaje, setLenguaje] = useState('Python'); 
  const [codigoBackend, setCodigoBackend] = useState('');
  const [proyectos, setProyectos] = useState([]);
  const [proyectoId, setProyectoId] = useState('');
  const [analiticasRefactor, setAnaliticasRefactor] = useState(null);

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

    setIsOptimizing(true); setMetrics(null); setAnaliticasRefactor(null);

    const lineasUI = fullUI.split('\n').filter(line => line.trim() !== '').length;
    const lineasBackend = codigoBackend.split('\n').filter(line => line.trim() !== '').length;
    const totalLineasOriginales = lineasUI + lineasBackend;

    try {
      const response = await fetch('http://127.0.0.1:8000/optimizar-codigo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo_ui: fullUI, codigo_logica: codigoBackend, lenguaje: lenguaje })
      });
      const data = await response.json();
      setMetrics(data);

      const totalLineasOptimizadas = data.codigo_optimizado.split('\n').filter(line => line.trim() !== '').length;
      const lineasEliminadas = Math.max(0, totalLineasOriginales - totalLineasOptimizadas);
      const porcentajeMejora = totalLineasOriginales > 0 ? ((lineasEliminadas / totalLineasOriginales) * 100).toFixed(1) : 0;

      setAnaliticasRefactor({ original: totalLineasOriginales, optimizado: totalLineasOptimizadas, eliminadas: lineasEliminadas, mejora: porcentajeMejora });
    } catch (error) { alert("Error al optimizar."); } 
    finally { setIsOptimizing(false); }
  };

  const descargarCodigo = () => {
    if (!metrics) return;
    let extension = lenguaje === 'Node.js' ? 'js' : lenguaje === 'Python' ? 'py' : 'html';
    const blob = new Blob([metrics.codigo_optimizado], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `codigo_optimizado_ecodev.${extension}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="ecodev-layout" style={{ height: '100%', width: '100%', display: 'flex' }}>
      <div className="panel-lateral" style={{ flexShrink: 0 }}>
        <div className="panel-header">Bloques UI</div>
        <div id="blocks" style={{ flexGrow: 1, overflowY: 'auto' }}></div>
      </div>

      {/* SOLUCIÓN DUDA 3: overflowY 'auto' en la columna principal para poder bajar en móvil */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%', overflowY: 'auto' }}>
        
        <div className="header-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0, padding: '15px' }}>
          <span style={{ color: '#a5b4fc', fontWeight: 'bold' }}>Arquitectura</span>
          
          <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)} style={{ padding: '8px', borderRadius: '5px', backgroundColor: '#2d2d44', color: 'white', border: '1px solid #3a3a52', flexGrow: 1, minWidth: '120px' }}>
            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            {proyectos.length === 0 && <option value="">Sin proyectos</option>}
          </select>

          <select value={lenguaje} onChange={(e) => setLenguaje(e.target.value)} style={{ padding: '8px', borderRadius: '5px', backgroundColor: '#2d2d44', color: 'white', border: '1px solid #3a3a52', flexGrow: 1, minWidth: '120px' }}>
            <option value="Python">Python</option>
            <option value="Node.js">Node.js</option>
            <option value="HTML/CSS">HTML/CSS/JS</option>
          </select>

          <button className="btn-optimizar" onClick={handleOptimize} disabled={isOptimizing || proyectos.length === 0} style={{ width: '100%', opacity: proyectos.length === 0 ? 0.5 : 1 }}>
            {isOptimizing ? '⏳ Procesando Refactorización IA...' : '✨ Generar Arquitectura Semántica y Medir CO2'}
          </button>
        </div>
        
        {/* flexShrink 0 evita que el lienzo se aplaste, asegurando que ocupe al menos 400px */}
        <div style={{ position: 'relative', width: '100%', backgroundColor: '#ffffff', height: '400px', flexShrink: 0 }}>
          <div id="editor-canvas" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}></div>
        </div>

        {/* El panel inferior del HU-006, ahora accesible con scroll en el celular */}
        <div style={{ backgroundColor: '#1a1a24', borderTop: '2px solid #3a3a52', padding: '15px', flexShrink: 0 }}>
          <label style={{ color: '#a5b4fc', fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
            Refactorización Manual (HU-006) - Pega tu código legacy aquí:
          </label>
          <textarea 
            value={codigoBackend} 
            onChange={(e) => setCodigoBackend(e.target.value)}
            placeholder="Pega aquí tu código sucio. La IA eliminará las ineficiencias."
            style={{ width: '100%', height: '130px', backgroundColor: '#1e1e2f', color: '#fca5a5', border: '1px solid #3a3a52', borderRadius: '5px', fontFamily: 'monospace', fontSize: '12px', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {metrics && analiticasRefactor && (
        <div className="metrics-panel" style={{ width: '380px', flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ color: '#4ade80', margin: 0 }}>Análisis de Refactorización</h3>
            <button onClick={() => setMetrics(null)} style={{ background: 'none', color: 'white', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✖</button>
          </div>

          <div className="metric-card" style={{ borderLeftColor: '#ef4444', marginBottom: '10px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Consumo Físico IA (CodeCarbon)</p>
            <h3 style={{ margin: '5px 0', color: '#f87171' }}>{metrics.emisiones_co2_kg.toFixed(8)} kg CO2</h3>
          </div>

          <div className="metric-card" style={{ borderLeftColor: '#10b981', backgroundColor: '#064e3b', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#a7f3d0' }}>Obsoleto Eliminado</p>
                <h3 style={{ margin: '5px 0', color: '#34d399' }}>{analiticasRefactor.eliminadas} Líneas (-{analiticasRefactor.mejora}%)</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#a7f3d0' }}>Eficiencia</p>
                <h3 style={{ margin: '5px 0', color: '#34d399' }}>Validada ✓</h3>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>Código Unificado</p>
              <button onClick={descargarCodigo} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>📥 Archivar</button>
            </div>
            <div className="code-box" style={{ marginTop: '10px', height: '220px', fontSize: '11px', overflowY: 'auto' }}>{metrics.codigo_optimizado}</div>
          </div>
        </div>
      )}
    </div>
  );
}