import { useState, useEffect } from 'react';

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);

  const fetchAlertas = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/alertas');
      const data = await res.json();
      setAlertas(data);
    } catch (error) {
      console.error("Error cargando alertas:", error);
    }
  };

  useEffect(() => {
    fetchAlertas();
    // Un polling simple para buscar alertas nuevas cada 5 segundos
    const interval = setInterval(fetchAlertas, 5000);
    return () => clearInterval(interval);
  }, []);

  const resolverAlerta = async (id) => {
    try {
      await fetch(`http://127.0.0.1:8000/alertas/${id}/resolver`, { method: 'PUT' });
      fetchAlertas(); // Recargamos la lista
    } catch (error) {
      console.error("Error resolviendo alerta:", error);
    }
  };

  return (
    <div style={{ padding: '30px', color: 'white', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#f59e0b' }}>🔔 Centro de Alertas Ambientales</h2>
      <p style={{ color: '#a5b4fc', marginBottom: '30px' }}>Notificaciones reales disparadas por el backend cuando la IA supera el umbral de CO2.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {alertas.length === 0 ? (
          <p style={{ color: '#888' }}>No hay alertas registradas. El consumo está dentro del umbral.</p>
        ) : (
          alertas.map((alerta) => (
            <div key={alerta.id} style={{ 
              backgroundColor: '#252536', padding: '20px', borderRadius: '8px', 
              borderLeft: `4px solid ${alerta.resuelta ? '#4ade80' : alerta.severidad === 'Alta' ? '#ef4444' : '#f59e0b'}`,
              opacity: alerta.resuelta ? 0.6 : 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: 'white' }}>
                    {alerta.severidad === 'Alta' ? '🚨' : '⚠️'} {alerta.mensaje}
                  </h4>
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}><strong>Sugerencia del Sistema:</strong> {alerta.recomendacion}</p>
                </div>
                {!alerta.resuelta ? (
                  <button 
                    onClick={() => resolverAlerta(alerta.id)}
                    style={{ padding: '8px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', minWidth: '170px' }}>
                    Marcar como Resuelta
                  </button>
                ) : (
                  <span style={{ color: '#4ade80', fontWeight: 'bold' }}>✓ Mitigada</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}