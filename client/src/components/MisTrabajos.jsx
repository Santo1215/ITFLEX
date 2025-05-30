import { useState, useEffect } from "react";
import Loader from "./Cargando";
import "../assets/styles/ProyectosListado.css";
import { Link } from 'react-router-dom';
import { API_URL } from '../constants';

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

const MisTrabajos = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [trabajoSeleccionado, setTrabajoSeleccionado] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/mis-trabajos`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTrabajos(data);
        } else {
          console.error("Datos recibidos no son un arreglo:", data);
          setTrabajos([]);
        }
      })
      .catch((err) => {
        console.error("Error al cargar trabajos aceptados:", err);
        setTrabajos([]);
      })
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Loader />;
  if (!cargando && trabajos.length === 0) return <p>No tienes trabajos aceptados aún.</p>;

  return (
    <div className="proyectos-container">
      <div className="proyectos-listado-izquierdo">
        <h2>Mis Trabajos</h2>
        {trabajos.map((trabajo) => (
          <div
            key={trabajo.id}
            className={`proyecto-card ${trabajoSeleccionado?.id === trabajo.id ? "seleccionado" : ""}`}
            onClick={() => setTrabajoSeleccionado(trabajo)}
            style={{ cursor: "pointer" }}
          >
            <h3>{trabajo.title}</h3>
            <p className="descripcion">{trabajo.description}</p>
            <div className="proyecto-info">
              <span><strong>Cliente:</strong> <Link className="usuario" to={`/perfil/${trabajo.cliente_id}`}>{trabajo.cliente_name}</Link></span>
              <span><strong>Presupuesto:</strong> ${trabajo.budget?.toLocaleString()}</span>
              <span><strong>Estado:</strong> {trabajo.status}</span>
            </div>
            <div className="proyecto-tiempo" title={new Date(trabajo.created_at).toLocaleString()}>
              {tiempoRelativo(trabajo.created_at)}
            </div>
          </div>
        ))}
      </div>

      {trabajoSeleccionado && (
        <div className="proyecto-detalle">
          <h2>{trabajoSeleccionado.title}</h2>
          <div className="detalle-header">
            <div>
              <span className="calificacion">
                ★ {trabajoSeleccionado.calificacion ?? "N/A"}
              </span>
            </div>
            <div>
              <span>{trabajoSeleccionado.ubicacion ?? "Ubicación no disponible"}</span>
              <span className="presupuesto">
                ${trabajoSeleccionado.budget?.toLocaleString() ?? 0}
              </span>
            </div>
            <div className="tiempo" title={new Date(trabajoSeleccionado.created_at).toLocaleString()}>
              {tiempoRelativo(trabajoSeleccionado.created_at)}
            </div>
          </div>

          <div className="descripcion">
            <p>{trabajoSeleccionado.description ?? "Descripción no disponible"}</p>
          </div>

          {/* Mostrar detalles según estado */}
          {(trabajoSeleccionado.status === "Abierto" || trabajoSeleccionado.status === "En desarrollo") && (
            <>
              <p>Estado: {trabajoSeleccionado.status}</p>
              {/* Aquí podrías agregar botones u otras acciones para proyectos en desarrollo */}
            </>
          )}

          {trabajoSeleccionado.status === "Finalizado" && (
            <>
              <h3>Comentarios</h3>
              {trabajoSeleccionado.comentarios && trabajoSeleccionado.comentarios.length > 0 ? (
                <ul>
                  {trabajoSeleccionado.comentarios.map((comentario, i) => (
                    <li key={i}>{comentario.texto}</li>
                  ))}
                </ul>
              ) : (
                <p>No hay comentarios disponibles.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MisTrabajos;
