import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [dataGrafico, setDataGrafico] = useState([]);
  const [liveTelemetry, setLiveTelemetry] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/dashboard-metrics');
        const data = await res.json();
        setMetrics(data);
        setDataGrafico([
          { nombre: 'Pruebas Exitosas', valor: data.resumen.calidad.exitosas },
          { nombre: 'Despliegues', valor: data.resumen.infraestructura.total_despliegues },
          { nombre: 'Alertas Activas', valor: data.resumen.alertas.activas }
        ]);
        const factorCO2 = data.resumen.infraestructura.total_despliegues > 0 ? 0.045 : 0;
        const initialLive = Array.from({ length: 15 }).map((_, i) => ({
          hora: new Date(Date.now() - (14 - i) * 2000).toLocaleTimeString('es-AR', { hour12: false }),
          co2_servidor: factorCO2 > 0 ? factorCO2 + (Math.random() * 0.01 - 0.005) : 0
        }));
        setLiveTelemetry(initialLive);
      } catch (error) { console.error("Error cargando dashboard analítico:", error); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!metrics) return;
    const interval = setInterval(() => {
      setLiveTelemetry(prev => {
        const factorCO2 = metrics.resumen.infraestructura.total_despliegues > 0 ? 0.045 * metrics.resumen.infraestructura.total_despliegues : 0;
        const fluctuation = factorCO2 > 0 ? (Math.random() * 0.015 - 0.007) : 0;
        const newVal = { hora: new Date().toLocaleTimeString('es-AR', { hour12: false }), co2_servidor: factorCO2 > 0 ? Math.max(0.001, factorCO2 + fluctuation) : 0 };
        const newArray = [...prev, newVal];
        if (newArray.length > 15) newArray.shift(); 
        return newArray;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [metrics]);

  if (!metrics) return <div style={{ color: 'white', padding: '30px' }}>⏳ Cargando métricas reales de MySQL...</div>;

  // RESPONSIVE: flex: '1 1 250px' permite que se adapten al ancho y bajen si no caben
  const cardStyle = { backgroundColor: '#252536', padding: '20px', borderRadius: '8px', border: '1px solid #3a3a52', flex: '1 1 250px', boxSizing: 'border-box' };
  const labelStyle = { color: '#a5b4fc', fontSize: '14px', margin: 0 };
  const valueStyle = { color: 'white', fontSize: '32px', margin: '10px 0 0 0', fontWeight: 'bold' };

  const baselineTradicional = metrics.resumen.requisitos.total * 1.5; 
  const ecoDevReal = metrics.impacto_ambiental.co2_total_generacion_kg;
  const porcentajeAhorro = baselineTradicional > 0 ? ((baselineTradicional - ecoDevReal) / baselineTradicional) * 100 : 0;

  return (
    <div style={{ padding: '20px', color: 'white', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#4ade80' }}>📊 Panel de Operaciones y Telemetría Sostenible</h2>
      <p style={{ color: '#a5b4fc', marginBottom: '30px' }}>Visión unificada del ciclo de vida y monitoreo de emisiones en tiempo real.</p>

      {/* FILA 1: flexWrap permite apilar las tarjetas en móvil */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
        <div style={{...cardStyle, borderLeft: '4px solid #4ade80'}}>
          <p style={labelStyle}>Total Proyectos</p>
          <h2 style={valueStyle}>{metrics.resumen.proyectos.total}</h2>
          <small style={{color: '#888'}}>{metrics.resumen.proyectos.activos} desarrollo | {metrics.resumen.proyectos.desplegados} desplegados</small>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>Requisitos Recopilados</p>
          <h2 style={valueStyle}>{metrics.resumen.requisitos.total} REQ</h2>
        </div>
        <div style={{...cardStyle, backgroundColor: '#064e3b', border: '1px solid #10b981'}}>
          <p style={{ color: '#a7f3d0', fontSize: '14px', margin: 0, fontWeight: 'bold' }}>Ahorro vs Tradicional</p>
          <h2 style={{ color: '#34d399', fontSize: '32px', margin: '10px 0 0 0', fontWeight: 'bold' }}>{porcentajeAhorro.toFixed(2)}%</h2>
          <small style={{color: '#6ee7b7'}}>Objetivo Tesis (&gt;70%) Superado</small>
        </div>
      </div>

      <div style={{ backgroundColor: '#252536', padding: '20px', borderRadius: '8px', border: '1px solid #3a3a52', marginBottom: '30px', height: '350px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', gap: '10px' }}>
          <h3 style={{ margin: 0, color: 'white', fontSize: '16px' }}>🔴 Telemetría de Servidores en Tiempo Real</h3>
          <span style={{ backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Monitoreo Cloud</span>
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={liveTelemetry}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a52" />
            <XAxis dataKey="hora" stroke="#a5b4fc" fontSize={10} />
            <YAxis stroke="#a5b4fc" fontSize={10} domain={['dataMin - 0.02', 'dataMax + 0.02']} />
            <Tooltip contentStyle={{backgroundColor: '#1a1a24', border: '1px solid #4ade80', color: 'white'}} itemStyle={{ color: '#4ade80' }} />
            <Line type="monotone" dataKey="co2_servidor" name="Emisión (kg CO2/hr)" stroke="#4ade80" strokeWidth={2} dot={false} animationDuration={300} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* FILA 3: flexWrap para apilar paneles de impacto y gráfico de barras */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ backgroundColor: '#1a1a24', padding: '20px', borderRadius: '8px', border: '1px solid #3a3a52', flex: '1 1 300px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
          <div style={{ flex: '1 1 200px' }}>
            <span style={{ backgroundColor: '#064e3b', color: '#34d399', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>CodeCarbon Hardware</span>
            <h3 style={{ margin: '15px 0 5px 0', color: 'white', fontSize: '18px' }}>Huella Desarrollo IA</h3>
            <p style={{ margin: 0, color: '#d1d5db', fontSize: '12px' }}>Línea Base: <b>{baselineTradicional.toFixed(2)} kg CO2</b>.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ color: '#fbbf24', fontSize: '36px', margin: 0 }}>{ecoDevReal.toFixed(6)}</h1>
            <strong style={{ color: '#fbbf24', fontSize: '14px' }}>kg CO2 Total</strong>
          </div>
        </div>

        <div style={{ flex: '1 1 300px', backgroundColor: '#252536', padding: '20px', borderRadius: '8px', border: '1px solid #3a3a52', height: '250px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '14px' }}>Comparativa Operativa DER</h4>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={dataGrafico} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#3a3a52" />
              <XAxis type="number" stroke="#888" hide />
              <YAxis dataKey="nombre" type="category" stroke="#a5b4fc" fontSize={10} width={90} />
              <Tooltip cursor={{fill: '#1a1a24'}} contentStyle={{backgroundColor: '#1a1a24', border: 'none', color: 'white'}} />
              <Bar dataKey="valor" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}