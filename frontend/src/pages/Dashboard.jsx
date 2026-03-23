import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [requisitos, setRequisitos] = useState([]);
  const [metricas, setMetricas] = useState({ totalKwh: 0, totalRequisitos: 0, emisionesEstimadas: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/requisitos');
      const data = await res.json();
      
      // Formateamos los datos para el gráfico
      const dataGrafico = data.map(req => ({
        nombre: `REQ-${req.id.toString().padStart(3, '0')}`,
        consumo: req.kwh_estimado,
        prioridad: req.prioridad
      }));

      setRequisitos(dataGrafico);

      // Calculamos los totales
      const totalKwh = data.reduce((acc, curr) => acc + curr.kwh_estimado, 0);
      // Usamos el factor de emisión de Argentina (0.43 kg CO2/kWh) que definiste en tu Anexo 5
      const emisiones = totalKwh * 0.43;

      setMetricas({
        totalKwh: totalKwh.toFixed(2),
        totalRequisitos: data.length,
        emisionesEstimadas: emisiones.toFixed(2)
      });

    } catch (error) {
      console.error("Error obteniendo datos para el dashboard:", error);
    }
  };

  return (
    <div style={{ padding: '30px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#4ade80', marginBottom: '30px' }}>📊 Dashboard de Sostenibilidad</h2>
      
      {/* Tarjetas de Resumen (KPIs) */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <div style={{ flex: 1, backgroundColor: '#252536', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
          <p style={{ margin: 0, color: '#a5b4fc', fontSize: '14px' }}>Total Requisitos</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px' }}>{metricas.totalRequisitos}</h2>
        </div>
        
        <div style={{ flex: 1, backgroundColor: '#252536', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
          <p style={{ margin: 0, color: '#a5b4fc', fontSize: '14px' }}>Consumo Estimado (kWh)</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px', color: '#fbbf24' }}>{metricas.totalKwh}</h2>
        </div>

        <div style={{ flex: 1, backgroundColor: '#252536', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
          <p style={{ margin: 0, color: '#a5b4fc', fontSize: '14px' }}>Emisiones Proyectadas (kg CO2)</p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px', color: '#f87171' }}>{metricas.emisionesEstimadas}</h2>
        </div>
      </div>

      {/* Gráfico de Consumo */}
      <div style={{ backgroundColor: '#252536', padding: '20px', borderRadius: '8px', border: '1px solid #3a3a52', height: '400px' }}>
        <h3 style={{ marginTop: 0, color: '#a5b4fc', marginBottom: '20px' }}>Distribución de Consumo por Requisito</h3>
        {requisitos.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={requisitos} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a3a52" />
              <XAxis dataKey="nombre" stroke="#a5b4fc" />
              <YAxis stroke="#a5b4fc" />
              <Tooltip cursor={{fill: '#2d2d44'}} contentStyle={{backgroundColor: '#1a1a24', border: 'none', color: 'white'}} />
              <Legend />
              <Bar dataKey="consumo" name="Consumo (kWh)" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: 'center', color: '#888', marginTop: '100px' }}>No hay datos suficientes para graficar. Agrega requisitos primero.</p>
        )}
      </div>
    </div>
  );
}