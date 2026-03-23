import { useState, useEffect } from 'react';

export default function Historial() {
  const [optimizaciones, setOptimizaciones] = useState([]);

  useEffect(() => {
    const fetchOptimizaciones = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/optimizaciones');
        const data = await res.json();
        setOptimizaciones(data);
      } catch (error) {
        console.error("Error al obtener historial:", error);
      }
    };
    fetchOptimizaciones();
  }, []);

  return (
    <div style={{ padding: '30px', color: 'white', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ color: '#4ade80' }}>⏱️ Historial de Optimizaciones con IA</h2>
      <p style={{ color: '#a5b4fc', marginBottom: '30px' }}>Registro de las refactorizaciones de código Full-Stack realizadas por Gemma 2b y su costo energético real.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {optimizaciones.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#252536', borderRadius: '8px', border: '1px solid #3a3a52', color: '#888' }}>
            No hay optimizaciones registradas. Ve al Editor Full-Stack para generar código sostenible.
          </div>
        ) : (
          optimizaciones.map((opt) => (
            <div key={opt.id} style={{ backgroundColor: '#252536', borderRadius: '8px', border: '1px solid #3a3a52', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#1a1a24', padding: '15px 20px', borderBottom: '1px solid #3a3a52', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: '#a5b4fc', fontSize: '16px' }}>Refactorización #{opt.id}</span>
                  <span style={{ color: '#9ca3af', fontSize: '12px', marginLeft: '15px' }}>📅 {opt.fecha}</span>
                </div>
                <div style={{ backgroundColor: '#064e3b', padding: '5px 15px', borderRadius: '20px', border: '1px solid #10b981' }}>
                  <span style={{ color: '#34d399', fontWeight: 'bold' }}>⚡ Costo: {opt.emisiones_co2_kg.toFixed(8)} kg CO2</span>
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, padding: '20px', borderRight: '1px solid #3a3a52', backgroundColor: '#1e1e2f' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#fca5a5' }}>Código Base (Ineficiente)</h4>
                  <pre style={{ backgroundColor: '#111118', padding: '15px', borderRadius: '5px', fontSize: '12px', overflowX: 'auto', maxHeight: '300px', border: '1px solid #3f3f46', whiteSpace: 'pre-wrap' }}>
                    {opt.codigo_original}
                  </pre>
                </div>
                <div style={{ flex: 1, padding: '20px', backgroundColor: '#1e1e2f' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#4ade80' }}>Código Optimizado (Green Coding)</h4>
                  <pre style={{ backgroundColor: '#111118', padding: '15px', borderRadius: '5px', fontSize: '12px', overflowX: 'auto', maxHeight: '300px', border: '1px solid #3f3f46', whiteSpace: 'pre-wrap' }}>
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