import { useState, useEffect } from "react";
import '../assets/styles/ProyectosListado.css';
import Loader from "./Cargando";
import FormularioPostulacion from './FormularioPostular';
import { Link } from "react-router-dom";
import {BotonPostulacion} from "./BotonPostularAbrir";

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
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [proyectosPostulados, setProyectosPostulados] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const estaPostulado = proyectoSeleccionado
    ? proyectosPostulados.includes(proyectoSeleccionado.id)
    : false;

  useEffect(() => {
    const API_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://pruebasitflex.onrender.com";

    // Obtener usuario actual
    fetch(`${API_URL}/api/user`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setUsuarioActual(data);

        // Obtener postulaciones del usuario
        if (data && data.id) {
          fetch(`${API_URL}/api/postulaciones/usuario/${data.id}`, { credentials: "include" })
            .then((res) => res.json())
            .then((postulaciones) => {
              const postuladosIds = postulaciones.map((p) => p.project_id);
              setProyectosPostulados(postuladosIds);
            })
            .catch((err) => {
              console.error("Error al obtener postulaciones:", err);
            });
        }
      })
      .catch((err) => console.error("Error al obtener usuario:", err));

    // Obtener proyectos
    fetch(`${API_URL}/api/proyectos`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setProyectos(data);
        if (data.length > 0) setProyectoSeleccionado(data[0]);
      })
      .catch((error) => {
        console.error("Error al cargar proyectos:", error);
      });
  }, []);

  if (proyectos.length === 0) return <Loader />;


   const abrirModal = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setMostrarModal(true);
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
  };

  return (
    <div className="proyectos-container">
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
              <span>
                <Link className="usuario" to={ usuarioActual && String(usuarioActual.id) === String(proyectoSeleccionado.client_id)
                  ? "/MiPerfil"
                  : `/perfil/${proyecto.client_id}`}>{proyectoSeleccionado.nombre_cliente || "Sin nombre"} </Link>
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
              <span>
                <Link className="usuario" to={ usuarioActual && String(usuarioActual.id) === String(proyectoSeleccionado.client_id)
                  ? "/MiPerfil"
                  : `/perfil/${proyectoSeleccionado.client_id}`}>{proyectoSeleccionado.nombre_cliente || "Sin nombre"} </Link>

              </span>
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
            <div
              className="tiempo"
              title={new Date(proyectoSeleccionado.created_at).toLocaleString()}
            >
              {tiempoRelativo(proyectoSeleccionado.created_at)}
            </div>
          </div>

          <div className="descripcion">
            <p>{proyectoSeleccionado.description || "Descripción no disponible"}</p>
          </div>

          {/* Mostrar botón para abrir formulario solo si usuario existe y no es el creador */}
           {usuarioActual &&
           usuarioActual.id !== proyectoSeleccionado.client_id &&
           !mostrarModal && (
            <BotonPostulacion
              onClick={() => abrirModal(proyectoSeleccionado)}
              disabled={estaPostulado}
              texto={estaPostulado ? "Postulado" : "Postularme"}
            />
          )}

          {/* Mostrar formulario solo si mostrarModal es true */}
          {mostrarModal && (
            <FormularioPostulacion
              proyecto={proyectoSeleccionado}
              usuarioActual={usuarioActual}
              postulados={proyectosPostulados}
              setPostulados={setProyectosPostulados}
              onClose={handleCerrarModal}
            />
          )}

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
