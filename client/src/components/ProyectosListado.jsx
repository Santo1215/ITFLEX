import { useState, useEffect } from "react";
import '../assets/styles/ProyectosListado.css';

// Función para mostrar "Hace X tiempo"
function tiempoRelativo(fechaString) {
  const fecha = new Date(fechaString);
  const ahora = new Date();
  const diferencia = ahora - fecha; // milisegundos

  const segundos = Math.floor(diferencia / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (dias > 0) return `Hace ${dias} día${dias > 1 ? "s" : ""}`;
  if (horas > 0) return `Hace ${horas} hora${horas > 1 ? "s" : ""}`;
  if (minutos > 0) return `Hace ${minutos} minuto${minutos > 1 ? "s" : ""}`;
  return "Hace unos segundos";
}

const ProyectosListado = () => {
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

 useEffect(() => {
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://pruebasitflex.onrender.com";

  fetch(`${API_URL}/api/proyectos`, {
    credentials: 'include'
  })
    .then((res) => res.json())
    .then((data) => {
      setProyectos(data);
      if (data.length > 0) setProyectoSeleccionado(data[0]);
    })
    .catch((error) => {
      console.error("Error al cargar proyectos:", error);
    });
}, []);

  if (proyectos.length === 0) return <p>Cargando proyectos...</p>;

  return (
    <div className="proyectos-container">
      {/* Listado de proyectos (más a la izquierda) */}
      <div className="proyectos-listado-izquierdo">
        {proyectos.map((proyecto) => (
          <div
            key={proyecto.id}
            className={`proyecto-card ${
              proyectoSeleccionado?.id === proyecto.id ? "seleccionado" : ""
            }`}
            onClick={() => setProyectoSeleccionado(proyecto)}
          >
            <h3>{proyecto.title}</h3>
            <div className="proyecto-info">
              <span>{proyectoSeleccionado.nombre_cliente || "Sin nombre"}</span>
              <span className="calificacion">
                ★ {proyecto.calificacion || "N/A"}
              </span>
            </div>
            <div className="proyecto-info">
              <span>{proyecto.ubicacion || "Ubicación no disponible"}</span>
              <span className="presupuesto">
                ${proyecto.budget?.toLocaleString() || 0}
              </span>
            </div>
            <div
              className="proyecto-tiempo"
              title={new Date(proyecto.created_at).toLocaleString()}
            >
              {tiempoRelativo(proyecto.created_at)}
            </div>
          </div>
        ))}
      </div>

      {/* Detalle del proyecto (derecha) */}
      {proyectoSeleccionado && (
        <div className="proyecto-detalle">
          <h2>{proyectoSeleccionado.title}</h2>
          <div className="detalle-header">
            <div>
              <span>{proyectoSeleccionado.nombre_cliente || "Sin nombre"}</span>
              <span className="calificacion">
                ★ {proyectoSeleccionado.calificacion || "N/A"}
              </span>
            </div>
            <div>
              <span>{proyectoSeleccionado.ubicacion || "Ubicación no disponible"}</span>
              <span className="presupuesto">
                ${proyectoSeleccionado.budget?.toLocaleString() || 0}
              </span>
            </div>
            <div className="tiempo" title={new Date(proyectoSeleccionado.created_at).toLocaleString()}>
              {tiempoRelativo(proyectoSeleccionado.created_at)}
            </div>
          </div>

          <div className="descripcion">
            <p>{proyectoSeleccionado.description || "Descripción no disponible"}</p>
          </div>

          <button className="postularme-btn">Postularme</button>

          {proyectoSeleccionado.comentarios && (
            <div className="comentarios-section">
              <h3>Comentarios</h3>
              {proyectoSeleccionado.comentarios.map((comentario, index) => (
                <div key={index} className="comentario">
                  <div className="comentario-header">
                    <strong>{comentario.nombre}</strong>
                    <span className="calificacion">★ {comentario.calificacion}</span>
                  </div>
                  <p>{comentario.texto}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProyectosListado;