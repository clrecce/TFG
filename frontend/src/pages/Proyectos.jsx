import { useState, useEffect } from 'react';

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', estado: 'En Planificación' });

  useEffect(() => { fetchProyectos(); }, []);

  const fetchProyectos = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/proyectos');
      setProyectos(await res.json());
    } catch (error) { console.error("Error:", error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://127.0.0.1:8000/proyectos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setFormData({ nombre: '', estado: 'En Planificación' });
      fetchProyectos();
    } catch (error) { console.error("Error:", error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este proyecto y sus requisitos?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/proyectos/${id}`, { method: 'DELETE' });
      fetchProyectos();
    } catch (error) { console.error("Error:", error); }
  };

  return (
    <div style={{ padding: '20px', color: 'white', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#4ade80' }}>📁 Gestión de Proyectos</h2>
      <p style={{ color: '#a5b4fc', marginBottom: '20px' }}>Iniciativa y registro de nuevos proyectos tecnológicos sostenibles.</p>
      
      <div style={{ backgroundColor: '#252536', padding: '20px', borderRadius: '8px', border: '1px solid #3a3a52' }}>
        {/* RESPONSIVE FORM: flexWrap permite apilar los inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 250px' }}>
            <label style={{ display: 'block', color: '#a5b4fc', marginBottom: '5px', fontWeight: 'bold' }}>Nombre del Proyecto</label>
            <input type="text" required placeholder="Ej: Sistema Hospitalario" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', color: '#a5b4fc', marginBottom: '5px', fontWeight: 'bold' }}>Estado</label>
            <select value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #3a3a52', boxSizing: 'border-box' }}>
              <option value="En Planificación">En Planificación</option>
              <option value="En Desarrollo">En Desarrollo</option>
              <option value="Desplegado">Desplegado</option>
            </select>
          </div>
          <button type="submit" style={{ padding: '11px 20px', backgroundColor: '#4ade80', color: '#1e1e2f', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer', flex: '1 1 150px' }}>
            + Crear Proyecto
          </button>
        </form>
      </div>

      {/* RESPONSIVE TABLE WRAPPER: Permite scroll horizontal en móvil */}
      <div style={{ overflowX: 'auto', marginTop: '30px', borderRadius: '8px', border: '1px solid #3a3a52' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#252536', minWidth: '600px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1a1a24', color: '#4ade80', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>ID</th>
              <th style={{ padding: '15px' }}>Nombre</th>
              <th style={{ padding: '15px' }}>Fecha</th>
              <th style={{ padding: '15px' }}>Estado</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.map((p) => (
              <tr key={p.id} style={{ borderTop: '1px solid #3a3a52' }}>
                <td style={{ padding: '15px', color: '#a5b4fc' }}>PRJ-{p.id}</td>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{p.nombre}</td>
                <td style={{ padding: '15px' }}>{p.fecha_inicio}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ backgroundColor: p.estado === 'Desplegado' ? '#064e3b' : '#1e3a8a', color: p.estado === 'Desplegado' ? '#34d399' : '#93c5fd', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{p.estado}</span>
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}