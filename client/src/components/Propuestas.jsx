import { useState, useEffect } from "react";
import '../assets/styles/ProyectosListado.css';
import Loader from "./Cargando";
import { Link } from 'react-router-dom';

function tiempoRelativo(fechaString) {
  const fecha = new Date(fechaString);
  const ahora = new Date();
  const diferencia = ahora - fecha;

  const segundos = Math.floor(diferencia / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (dias > 0) return `Hace ${dias} día${dias > 1 ? "s" : ""}`;
  if (horas > 0) return `Hace ${horas} hora${horas > 1 ? "s" : ""}`;
  if (minutos > 0) return `Hace ${minutos} minuto${minutos > 1 ? "s" : ""}`;
  return "Hace unos segundos";
}

const Propuestas = () => {
  const [recibidas, setRecibidas] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const API_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://pruebasitflex.onrender.com";

    fetch(`${API_URL}/api/invitaciones/recibidas`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar invitaciones');
        return res.json();
      })
      .then(data => setRecibidas(data))
      .catch(err => console.error(err))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Loader />;

  return (
    <div className="proyectos-container">
      <div className="proyectos-listado-izquierdo">
        <h2>Invitaciones recibidas</h2>
        {recibidas.length === 0 ? (
          <p>No tienes invitaciones recibidas.</p>
        ) : (
          recibidas.map((inv) => {
            const proyecto = inv.project;
            if (!proyecto) return null;

            return (
              <div
                key={inv.id}
                className={`proyecto-card ${
                  proyectoSeleccionado?.project?.id === proyecto.id ? "seleccionado" : ""
                }`}
                onClick={() => setProyectoSeleccionado(inv)}
              >
                <h3>{proyecto.title}</h3>
                <div className="proyecto-info">
                  <span>
                    <Link className="usuario" to={`/perfil/${inv.client_id || proyecto.client_id || ""}`}>
                      {inv.emisor_name || proyecto.nombre_cliente || "Sin nombre"}
                    </Link>
                  </span>
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
                  title={new Date(inv.created_at || inv.sent_at).toLocaleString()}
                >
                  {tiempoRelativo(inv.created_at || inv.sent_at)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detalle del proyecto (derecha) */}
      {proyectoSeleccionado && proyectoSeleccionado.project ? (
        <div className="proyecto-detalle">
            <h2>{proyectoSeleccionado.project.title}</h2>
            <div className="detalle-header">
            <div>
                <span>
                <Link
                    className="usuario"
                    to={`/perfil/${proyectoSeleccionado.client_id || ""}`}
                >
                    {proyectoSeleccionado.emisor_name || proyectoSeleccionado.project.nombre_cliente || "Sin nombre"}
                </Link>
                </span>
                <span className="calificacion">
                ★ {proyectoSeleccionado.project.calificacion || "N/A"}
                </span>
            </div>
            <div>
                <span>{proyectoSeleccionado.project.ubicacion || "Ubicación no disponible"}</span>
                <span className="presupuesto">
                ${proyectoSeleccionado.project.budget?.toLocaleString() || 0}
                </span>
            </div>
            <div
                className="tiempo"
                title={new Date(proyectoSeleccionado.created_at || proyectoSeleccionado.sent_at).toLocaleString()}
            >
                {tiempoRelativo(proyectoSeleccionado.created_at || proyectoSeleccionado.sent_at)}
            </div>
            </div>

            <div className="descripcion">
            <p>{proyectoSeleccionado.project.description || "Descripción no disponible"}</p>
            </div>
        </div>
        ) : proyectoSeleccionado ? (
        <p>Detalles del proyecto no disponibles.</p>
        ) : null}
    </div>
  );
};

export default Propuestas;

