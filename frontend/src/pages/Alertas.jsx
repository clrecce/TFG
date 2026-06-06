import { useState, useEffect } from 'react';

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [feedback, setFeedback] = useState('');

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
    const interval = setInterval(fetchAlertas, 5000);
    return () => clearInterval(interval);
  }, []);

  const resolverAlerta = async (id) => {
    try {
      await fetch(`http://127.0.0.1:8000/alertas/${id}/resolver`, { method: 'PUT' });
      fetchAlertas();
    } catch (error) {
      console.error("Error resolviendo alerta:", error);
    }
  };

  const enviarFeedback = () => {
    if(!feedback) return;
    alert("✅ Feedback registrado: '"+ feedback + "'. Se considerará para la próxima iteración de optimización IA.");
    setFeedback('');
  };

  return (
    <div style={{ padding: '30px', color: 'white', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#f59e0b' }}>🔔 Centro de Alertas Ambientales</h2>
      <p style={{ color: '#a5b4fc', marginBottom: '30px' }}>Notificaciones disparadas por el backend cuando la IA supera el umbral de CO2.</p>

      {/* REQUISITO HU-008 PUNTO 4: Feedback de sostenibilidad
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#1e1e2f', borderRadius: '8px', border: '1px solid #4ade80' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4ade80' }}>Feedback para Iteración Sostenible</h4>
        <textarea 
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Describe la ineficiencia detectada o sugerencia para mejorar la IA..." 
          style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: 'white', border: '1px solid #3a3a52', borderRadius: '5px', boxSizing: 'border-box' }} 
        />
        <button 
          onClick={enviarFeedback}
          style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#4ade80', color: '#111', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Registrar Feedback para el motor IA
        </button>
      </div> */}

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