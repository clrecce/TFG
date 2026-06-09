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

  const [requisitos, setRequisitos] = useState([]);
  const [requisitoId, setRequisitoId] = useState('');
  const [promptArquitectura, setPromptArquitectura] = useState('');
  const [generandoBloques, setGenerandoBloques] = useState(false);
  const [impactoProyectado, setImpactoProyectado] = useState(null);
  const [contadorComponentes, setContadorComponentes] = useState(0); 

  const [sugerenciasAdicionales, setSugerenciasAdicionales] = useState(null);
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/proyectos'),
      fetch('http://127.0.0.1:8000/requisitos')
    ])
    .then(async ([resProj, resReq]) => {
      const dataProj = await resProj.json();
      const dataReq = await resReq.json();
      
      const enDesarrollo = dataProj.filter(p => p.estado === 'En Desarrollo');
      setProyectos(enDesarrollo);
      setRequisitos(dataReq);

      if (enDesarrollo.length > 0) {
        const initialProjId = enDesarrollo[0].id;
        setProyectoId(initialProjId);

        const reqsForProj = dataReq.filter(r => r.proyecto_id === initialProjId);
        if (reqsForProj.length > 0) {
          setRequisitoId(reqsForProj[0].id);
          setPromptArquitectura(reqsForProj[0].descripcion);
        }
      }
    })
    .catch(err => console.error("Error cargando contexto:", err));

    if (!editorRef.current) {
      editorRef.current = grapesjs.init({
        container: '#editor-canvas', fromElement: false, height: '100%', width: '100%', storageManager: false, panels: { defaults: [] },
        blockManager: {
          appendTo: '#blocks',
          blocks: [
            { id: 'eco-button', label: '<b>Botón Semántico</b> <br/> <small>0.3 kWh</small>', content: '<button style="padding:10px 20px; background:#4ade80; border:none; border-radius:5px; color:#1e1e2f; font-weight:bold; cursor:pointer; margin:5px;">Botón Eco</button>' },
            { id: 'eco-form', label: '<b>Formulario</b> <br/> <small>1.2 kWh</small>', content: '<form style="padding:20px; background:#f4f4f5; border-radius:8px; margin:5px;"><input type="text" placeholder="Ingresa datos..." style="padding:10px; width:80%; margin-bottom:10px;"/><br/><button style="padding:10px 20px; background:#4ade80; border:none; border-radius:5px;">Enviar</button></form>' },
            { id: 'api-rest', label: '<b>Lógica API</b> <br/> <small>1.5 kWh</small>', content: '<div style="padding:15px; background:#3b82f6; color:white; border-radius:5px; text-align:center; margin:5px;">Conexión a Entidad DER</div>' },
            { id: 'ml-model', label: '<b>Modelo ML</b> <br/> <small>2.1 kWh</small>', content: '<div style="padding:15px; background:#8b5cf6; color:white; border-radius:5px; text-align:center; margin:5px;">Optimización Gemma (Simulada)</div>' }
          ]
        }
      });

      editorRef.current.on('component:add', (model) => {
        const tagName = model.get('tagName') ? model.get('tagName').toLowerCase() : '';
        const styles = model.get('style') || {};
        
        if (tagName === 'div' && model.getClasses().length === 0) {
          alert('ALERTA ECO-DEV: Componente no reutilizable detectado. Estás insertando un contenedor genérico (<div>) sin definir clases. Para mejorar la eficiencia del DOM, usa etiquetas semánticas o clases CSS globales.');
        } 
        else if (Object.keys(styles).length > 2) {
          alert('ALERTA ECO-DEV: Exceso de estilos en línea detectado. Esto incrementa la carga del renderizado. Delega el diseño a tu hoja de estilos CSS.');
        }
      });
    }
    return () => { if (editorRef.current) { editorRef.current.destroy(); editorRef.current = null; } };
  }, []);

  const handleProyectoChange = (e) => {
    const pId = e.target.value;
    setProyectoId(pId);
    
    const reqsForProj = requisitos.filter(r => r.proyecto_id === Number(pId));
    if (reqsForProj.length > 0) {
      setRequisitoId(reqsForProj[0].id);
      setPromptArquitectura(reqsForProj[0].descripcion);
    } else {
      setRequisitoId('');
      setPromptArquitectura('');
    }
  };

  const handleRequisitoChange = (e) => {
    const rId = e.target.value;
    setRequisitoId(rId);
    
    const req = requisitos.find(r => r.id === Number(rId));
    if (req) {
      setPromptArquitectura(req.descripcion);
    }
  };

  const generarComponentesIA = async () => {
    if (!promptArquitectura) return;
    setGenerandoBloques(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/sugerir-componentes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptArquitectura })
      });
      const data = await res.json();
      const bm = editorRef.current.BlockManager;
      
      bm.getCategories().models.forEach(cat => {
        if (cat.get('id') === 'sugerencias-ia') cat.set('open', false);
      });

      let nuevoContador = contadorComponentes;

      data.bloques.forEach((htmlString, index) => {
        nuevoContador++;
        bm.add(`ia-block-${Date.now()}-${index}`, {
          label: `Componente ${nuevoContador}`,
          content: htmlString,
          category: 'Sugerencias IA (Green IT)',
          attributes: { class: 'gjs-block' }
        });
      });
      
      setContadorComponentes(nuevoContador);
      alert('La IA ha analizado el requisito y los componentes ecoeficientes ya están disponibles en tu panel lateral.');
    } catch (error) {
      console.error("Error al sugerir componentes:", error);
    } finally {
      setGenerandoBloques(false);
    }
  };

  const limpiarLienzo = () => {
    if (editorRef.current) {
      if (window.confirm('¿Estás seguro de que deseas vaciar todo el lienzo de diseño?')) {
        editorRef.current.setComponents(''); 
        setImpactoProyectado(null); 
      }
    }
  };

  const evaluarDisenoPreliminar = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.getHtml();
    const elementosDOM = (html.match(/</g) || []).length;
    const kwhCalculado = (elementosDOM * 0.000085).toFixed(6);
    setImpactoProyectado(kwhCalculado);
  };

  const handleOptimize = async () => {
    if (!editorRef.current) return;
    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();
    const fullUI = `<style>\n${css}\n</style>\n${html}`;

    setIsOptimizing(true); 
    setMetrics(null); 
    setAnaliticasRefactor(null);
    setSugerenciasAdicionales(null); 

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

  const obtenerSugerencias = async () => {
    if (!metrics) return;
    setCargandoSugerencias(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/sugerencias-mejora', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: metrics.codigo_optimizado, lenguaje: lenguaje })
      });
      const data = await res.json();
      setSugerenciasAdicionales(data.sugerencias);
    } catch (error) {
      console.error("Error pidiendo sugerencias:", error);
    } finally {
      setCargandoSugerencias(false);
    }
  };

  const descargarCodigo = () => {
    if (!metrics) return;
    let extension = lenguaje === 'Python' ? 'py' : 'html';
    const blob = new Blob([metrics.codigo_optimizado], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `codigo_optimizado_ecodev.${extension}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const requisitosFiltrados = requisitos.filter(r => r.proyecto_id === Number(proyectoId));

  return (
    <div className="ecodev-layout" style={{ height: '100%', width: '100%', display: 'flex' }}>
      <div className="panel-lateral" style={{ flexShrink: 0 }}>
        <div className="panel-header">Bloques UI</div>
        <div id="blocks" style={{ flexGrow: 1, overflowY: 'auto' }}></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%', overflowY: 'auto' }}>
        
        <div className="header-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0, padding: '15px' }}>
          <span style={{ color: '#a5b4fc', fontWeight: 'bold' }}>Arquitectura</span>
          
          <select value={proyectoId} onChange={handleProyectoChange} style={{ padding: '8px', borderRadius: '5px', backgroundColor: '#2d2d44', color: 'white', border: '1px solid #3a3a52', flexGrow: 1, minWidth: '120px' }}>
            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            {proyectos.length === 0 && <option value="">Sin proyectos</option>}
          </select>

          <select value={lenguaje} onChange={(e) => setLenguaje(e.target.value)} style={{ padding: '8px', borderRadius: '5px', backgroundColor: '#2d2d44', color: 'white', border: '1px solid #3a3a52', flexGrow: 1, minWidth: '120px' }}>
            <option value="Python">Python</option>
            <option value="HTML/CSS">HTML/CSS/JS</option>
          </select>

          <button className="btn-optimizar" onClick={handleOptimize} disabled={isOptimizing || proyectos.length === 0} style={{ width: '100%', opacity: proyectos.length === 0 ? 0.5 : 1 }}>
            {isOptimizing ? 'Procesando Refactorización IA...' : 'Generar refactorización y Medir CO2'}
          </button>
        </div>

        <div style={{ backgroundColor: '#1a1a24', padding: '15px', borderBottom: '1px solid #3a3a52', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
          
          <select 
            value={requisitoId} 
            onChange={handleRequisitoChange} 
            style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#2d2d44', color: '#fbbf24', border: '1px solid #3a3a52', minWidth: '150px', fontWeight: 'bold' }}
            disabled={requisitosFiltrados.length === 0}
          >
            {requisitosFiltrados.map(r => (
              <option key={r.id} value={r.id}>REQ-{r.id} (Prio: {r.prioridad})</option>
            ))}
            {requisitosFiltrados.length === 0 && <option value="">Sin requisitos</option>}
          </select>

          <input 
            type="text" 
            placeholder="Modifica o amplía el requisito..." 
            value={promptArquitectura} 
            onChange={(e) => setPromptArquitectura(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52' }}
          />
          
          <button 
            onClick={generarComponentesIA} 
            disabled={generandoBloques || !promptArquitectura}
            style={{ backgroundColor: generandoBloques ? '#4b5563' : '#8b5cf6', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: generandoBloques ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            {generandoBloques ? 'Analizando...' : 'Sugerir Componentes'}
          </button>
          
          <button 
            onClick={evaluarDisenoPreliminar}
            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Validar Diseño
          </button>

          <button 
            onClick={limpiarLienzo}
            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            title="Borrar todo el contenido visual del lienzo"
          >
            Limpiar Lienzo
          </button>

          {impactoProyectado && (
            <div style={{ backgroundColor: '#064e3b', color: '#34d399', padding: '10px 15px', borderRadius: '5px', fontWeight: 'bold', border: '1px solid #10b981' }}>
              Proyección: {impactoProyectado} kWh
            </div>
          )}
        </div>
        
        <div style={{ position: 'relative', width: '100%', backgroundColor: '#ffffff', height: '400px', flexShrink: 0 }}>
          <div id="editor-canvas" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}></div>
        </div>

        <div style={{ backgroundColor: '#1a1a24', borderTop: '2px solid #3a3a52', padding: '15px', flexShrink: 0 }}>
          <label style={{ color: '#a5b4fc', fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
            Refactorización Manual - Pega tu código aquí:
          </label>
          <textarea 
            value={codigoBackend} 
            onChange={(e) => setCodigoBackend(e.target.value)}
            placeholder="Pega aquí tu código. La IA eliminará las ineficiencias."
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
                <h3 style={{ margin: '5px 0', color: '#34d399' }}>Validada</h3>
              </div>
            </div>
          </div>

          <div className="metric-card" style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>Código Unificado</p>
              <button onClick={descargarCodigo} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Archivar</button>
            </div>
            <div className="code-box" style={{ marginTop: '10px', height: '150px', fontSize: '11px', overflowY: 'auto' }}>{metrics.codigo_optimizado}</div>
          </div>

          <div className="metric-card" style={{ borderLeftColor: '#8b5cf6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#a5b4fc', fontWeight: 'bold' }}>Revisión Arquitectónica</p>
              <button 
                onClick={obtenerSugerencias} 
                disabled={cargandoSugerencias}
                style={{ backgroundColor: cargandoSugerencias ? '#4b5563' : '#8b5cf6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: cargandoSugerencias ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: 'bold' }}
              >
                {cargandoSugerencias ? 'Consultando...' : 'Sugerir Mejoras'}
              </button>
            </div>
            
            {sugerenciasAdicionales && (
              <ul style={{ paddingLeft: '20px', color: '#d1d5db', fontSize: '12px', marginTop: '10px', marginBottom: 0 }}>
                {sugerenciasAdicionales.map((sug, i) => (
                  <li key={i} style={{ marginBottom: '5px' }}>
                    {sug.replace(/^[*\-\d.]+\s*/, '')}
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      )}
    </div>
  );
}