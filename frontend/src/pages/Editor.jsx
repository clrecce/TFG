import { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';

export default function Editor() {
  const editorRef = useRef(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = grapesjs.init({
        container: '#editor-canvas',
        fromElement: true,
        height: '100%',
        width: 'auto',
        storageManager: false,
        panels: { defaults: [] },
        blockManager: {
          appendTo: '#blocks',
          blocks: [
            { id: 'eco-button', label: '<b>Botón</b> <br/> <small>⚡ 0.3 kWh</small>', category: 'UI Components', content: '<button style="padding:10px 20px; background:#4ade80; border:none; border-radius:5px; color:#1e1e2f; font-weight:bold; cursor:pointer; margin:5px;">Botón Eco</button>' },
            { id: 'eco-form', label: '<b>Formulario</b> <br/> <small>⚡ 1.2 kWh</small>', category: 'UI Components', content: '<form style="padding:20px; background:#f4f4f5; border-radius:8px; margin:5px;"><input type="text" placeholder="Ingresa datos..." style="padding:10px; width:80%; margin-bottom:10px;"/><br/><button style="padding:10px 20px; background:#4ade80; border:none; border-radius:5px;">Enviar</button></form>' },
            { id: 'api-rest', label: '<b>API REST</b> <br/> <small>⚡ 1.5 kWh</small>', category: 'Data & APIs', content: '<div style="padding:15px; background:#3b82f6; color:white; border-radius:5px; text-align:center; margin:5px;">Conexión API REST (Backend)</div>' },
            { id: 'ml-model', label: '<b>Modelo ML</b> <br/> <small>⚡ 2.1 kWh</small>', category: 'IA Modules', content: '<div style="padding:15px; background:#8b5cf6; color:white; border-radius:5px; text-align:center; margin:5px;">Optimizador IA (Gemma 2b)</div>' }
          ]
        }
      });
    }

    // Limpiamos la instancia de GrapesJS al cambiar de pestaña para evitar duplicados
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  const handleOptimize = async () => {
    if (!editorRef.current) return;
    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();
    const fullCode = `<style>${css}</style>\n${html}`;

    setIsOptimizing(true);
    setMetrics(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/optimizar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: fullCode })
      });
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error al optimizar.");
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="ecodev-layout">
      <div className="panel-lateral">
        <div className="panel-header">Bloques de Diseño</div>
        <div id="blocks"></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div className="header-actions">
          <span style={{ color: '#a5b4fc', fontWeight: 'bold' }}>Arquitectura Low-Code</span>
          <button className="btn-optimizar" onClick={handleOptimize} disabled={isOptimizing}>
            {isOptimizing ? '⏳ Evaluando IA...' : '✨ Generar Código y Medir CO2'}
          </button>
        </div>
        <div id="editor-canvas" style={{ flexGrow: 1, position: 'relative' }}>
          <div style={{ padding: '50px', textAlign: 'center', color: '#888' }}>
            <h2>Arrastra componentes aquí para diseñar tu arquitectura</h2>
          </div>
        </div>
      </div>

      {metrics && (
        <div className="metrics-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#4ade80' }}>Dashboard Ambiental</h3>
            <button onClick={() => setMetrics(null)} style={{ background: 'none', color: 'white', border: 'none', cursor: 'pointer' }}>✖</button>
          </div>
          <div className="metric-card" style={{ borderLeftColor: '#ef4444' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>Costo de Generación</p>
            <h2 style={{ margin: '5px 0', color: '#f87171' }}>{metrics.emisiones_co2_kg.toFixed(8)} kg CO2</h2>
          </div>
          <div className="metric-card">
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>Código Refactorizado</p>
            <div className="code-box" style={{ marginTop: '10px' }}>{metrics.codigo_optimizado}</div>
          </div>
        </div>
      )}
    </div>
  );
}