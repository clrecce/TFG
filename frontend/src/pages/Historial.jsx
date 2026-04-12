import { useState, useEffect } from 'react';

export default function Historial() {
  const [optimizaciones, setOptimizaciones] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/optimizaciones')
      .then(res => res.json())
      .then(data => setOptimizaciones(data))
      .catch(error => console.error("Error:", error));
  }, []);

  return (
    <div style={{ padding: '20px', color: 'white', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ color: '#4ade80' }}>⏱️ Historial de Optimizaciones con IA</h2>
      <p style={{ color: '#a5b4fc', marginBottom: '30px' }}>Registro de las refactorizaciones de código realizadas por Gemma 2b.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {optimizaciones.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#252536', borderRadius: '8px', color: '#888' }}>No hay optimizaciones registradas.</div>
        ) : (
          optimizaciones.map((opt) => (
            <div key={opt.id} style={{ backgroundColor: '#252536', borderRadius: '8px', border: '1px solid #3a3a52', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#1a1a24', padding: '15px', borderBottom: '1px solid #3a3a52', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: '#a5b4fc' }}>Refactorización #{opt.id}</span>
                  <span style={{ color: '#9ca3af', fontSize: '12px', marginLeft: '10px' }}>📅 {opt.fecha}</span>
                </div>
                <div style={{ backgroundColor: '#064e3b', padding: '5px 15px', borderRadius: '20px', border: '1px solid #10b981' }}>
                  <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '13px' }}>⚡ {opt.emisiones_co2_kg.toFixed(8)} kg CO2</span>
                </div>
              </div>
              
              {/* RESPONSIVE CODE BLOCKS: flexWrap y minWidth evitan el aplastamiento */}
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px', padding: '15px', borderRight: '1px solid #3a3a52', backgroundColor: '#1e1e2f', boxSizing: 'border-box' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#fca5a5', fontSize: '14px' }}>Código Base (Ineficiente)</h4>
                  <pre style={{ backgroundColor: '#111118', padding: '10px', borderRadius: '5px', fontSize: '11px', overflowX: 'auto', maxHeight: '250px', border: '1px solid #3f3f46', whiteSpace: 'pre-wrap' }}>
                    {opt.codigo_original}
                  </pre>
                </div>
                <div style={{ flex: '1 1 300px', padding: '15px', backgroundColor: '#1e1e2f', boxSizing: 'border-box' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#4ade80', fontSize: '14px' }}>Código Optimizado (Green)</h4>
                  <pre style={{ backgroundColor: '#111118', padding: '10px', borderRadius: '5px', fontSize: '11px', overflowX: 'auto', maxHeight: '250px', border: '1px solid #3f3f46', whiteSpace: 'pre-wrap' }}>
                    {opt.codigo_optimizado}
                  </pre>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}