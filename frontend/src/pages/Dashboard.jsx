import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [dataGrafico, setDataGrafico] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/dashboard-metrics');
        const data = await res.json();
        setMetrics(data);

        // Preparamos datos para un gráfico comparativo del DER (Tesis)
        setDataGrafico([
          { nombre: 'Pruebas Exitosas', valor: data.resumen.calidad.exitosas },
          { nombre: 'Despliegues', valor: data.resumen.infraestructura.total_despliegues },
          { nombre: 'Alertas Activas', valor: data.resumen.alertas.activas }
        ]);
      } catch (error) { console.error("Error cargando dashboard analítico:", error); }
    };
    fetchData();
  }, []);

  if (!metrics) return <div style={{ color: 'white', padding: '30px' }}>⏳ Cargando métricas reales de MySQL...</div>;

  const cardStyle = { backgroundColor: '#252536', padding: '20px', borderRadius: '8px', border: '1px solid #3a3a52', flex: 1 };
  const labelStyle = { color: '#a5b4fc', fontSize: '14px', margin: 0 };
  const valueStyle = { color: 'white', fontSize: '32px', margin: '10px 0 0 0', fontWeight: 'bold' };

  return (
    <div style={{ padding: '30px', color: 'white', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#4ade80' }}>📊 Panel de Operaciones Sostenibles (Métrica Ejecutiva DER)</h2>
      <p style={{ color: '#a5b4fc', marginBottom: '30px' }}>Visión unificada de todas las entidades del Diagrama Entidad-Relación y Medición CodeCarbon Total.</p>

      {/* FILA 1: KPIs Principales */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{...cardStyle, borderLeft: '4px solid #4ade80'}}>
          <p style={labelStyle}>Total Proyectos</p>
          <h2 style={valueStyle}>{metrics.resumen.proyectos.total}</h2>
          <small style={{color: '#888'}}>{metrics.resumen.proyectos.activos} en desarrollo</small>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>Requisitos Recopilados</p>
          <h2 style={valueStyle}>{metrics.resumen.requisitos.total} REQ</h2>
        </div>
        <div style={{...cardStyle, borderLeft: '4px solid #ef4444'}}>
          <p style={labelStyle}>Alertas Activas</p>
          <h2 style={{...valueStyle, color: '#f87171'}}>{metrics.resumen.alertas.activas} Alertas</h2>
        </div>
      </div>

      {/* FILA 2: Impacto Ambiental Real y Calidad */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        {/* IMPACTO AMBIENTAL REAL TOTAL (CodeCarbon de todas las optis) */}
        <div style={{ backgroundColor: '#1a1a24', padding: '25px', borderRadius: '8px', border: '1px solid #3a3a52', flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ backgroundColor: '#064e3b', color: '#34d399', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>HU-005: Dashboard Analítico Real</span>
            <h3 style={{ margin: '15px 0 10px 0', color: 'white', fontSize: '20px' }}>Impacto Ambiental Total de Generación con IA</h3>
            <p style={{ margin: 0, color: '#d1d5db', fontSize: '14px' }}>Métrica unificada de todas las ejecuciones de Gemma 2b medidas con CodeCarbon.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ color: '#fbbf24', fontSize: '48px', margin: 0 }}>{metrics.impacto_ambiental.co2_total_generacion_kg.toFixed(6)}</h1>
            <strong style={{ color: '#fbbf24', fontSize: '18px' }}>kg CO2 Total</strong>
            <p style={{color: '#888', margin: 0}}>{metrics.impacto_ambiental.total_optimizaciones_ia} ejecuciones</p>
          </div>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Cobertura de Pruebas</p>
          <h2 style={valueStyle}>{metrics.resumen.calidad.total_pruebas} Pruebas</h2>
          <strong style={{color: '#4ade80'}}>{metrics.resumen.calidad.exitosas} pasadas exitosamente</strong>
        </div>
      </div>

      {/* FILA 3: Gráfico y Resumen DER */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 2, backgroundColor: '#252536', padding: '20px', borderRadius: '8px', border: '1px solid #3a3a52', height: '350px' }}>
          <h4 style={{ margin: '0 0 20px 0', color: 'white' }}>Comparativa Operativa del DER</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a3a52" />
              <XAxis dataKey="nombre" stroke="#a5b4fc" fontSize={12} />
              <YAxis stroke="#a5b4fc" />
              <Tooltip cursor={{fill: '#1a1a24'}} contentStyle={{backgroundColor: '#1a1a24', border: 'none', color: 'white'}} />
              <Bar dataKey="valor" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={cardStyle}>
          <h4 style={{ margin: '0 0 20px 0', color: 'white' }}>Estado de Infraestructura (AWS)</h4>
          <p style={{...valueStyle, fontSize: '24px'}}>{metrics.resumen.infraestructura.total_despliegues}</p>
          <p style={labelStyle}>Despliegues Exitosos (HU-008)</p>
          <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#1a1a24', borderRadius: '4px', borderLeft: '3px solid #3b82f6'}}>
            <small style={{color: '#3b82f6'}}>Métrica de Sostenibilidad AWS EC2/S3 (Simulada)</small>
            <p style={{margin: '5px 0 0 0', color: '#4ade80'}}><strong>Óptimo</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}