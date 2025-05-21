import { useState, useEffect } from "react";
import '../assets/styles/ProyectosListado.css';
import Loader from "./Cargando";
import "../assets/styles/Postulantes.css";
import BtnVerPostu from "./BotonVerPostu";
import { Link } from 'react-router-dom';
import BotonCancelar from "./BotonCancelar";
import BotonGuardar from "./BotonGuardar";
import { IrChat } from './BotonPostularAbrir';

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

const MisProyectosListado = () => {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [habilidadesExpandida, setHabilidadesExpandida] = useState({});
  const toggleHabilidades = (postulacionId) => {
  setHabilidadesExpandida((prev) => ({
    ...prev,
    [postulacionId]: !prev[postulacionId],
  }));
};
  // Estados para postulaciones
  const [postulaciones, setPostulaciones] = useState([]);
  const [mostrarPostulantes, setMostrarPostulantes] = useState(false);
  const [cargandoPostulaciones, setCargandoPostulaciones] = useState(false);
  const [errorPostulaciones, setErrorPostulaciones] = useState(null);
  const manejarClickPostulantes = () => {
    if (!mostrarPostulantes) {
      // Si está oculto, cargo y muestro
      cargarPostulaciones(proyectoSeleccionado.id);
    } else {
      // Si está visible, solo oculto y limpio postulaciones
      setMostrarPostulantes(false);
      setPostulaciones([]);
    }
  };
  const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://pruebasitflex.onrender.com";

const aceptarPropuesta = async (postulacionId) => {
  try {
    const res = await fetch(`${API_URL}/api/postulaciones/${postulacionId}/aceptar`, {
      method: "PUT",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al aceptar propuesta");

    // Actualizar estado local para reflejar el cambio
    setPostulaciones((prev) =>
      prev.map((p) =>
        p.id === postulacionId ? { ...p, status: "Aceptada" } : p
      )
    );
  } catch (error) {
    console.error(error);
    alert("No se pudo aceptar la propuesta.");
  }
};

const rechazarPropuesta = async (postulacionId) => {
  try {
    const res = await fetch(`${API_URL}/api/postulaciones/${postulacionId}/rechazar`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al rechazar propuesta");

    // Eliminar del estado local
    setPostulaciones((prev) => prev.filter((p) => p.id !== postulacionId));
  } catch (error) {
    console.error(error);
    alert("No se pudo rechazar la propuesta.");
  }
};

  useEffect(() => {
    fetch(`${API_URL}/api/user`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('No autorizado');
      return res.json();
    })
    .then(data => setUsuarioActual(data))
    .catch(() => setUsuarioActual(null));
  }, []);

  useEffect(() => {
  fetch(`${API_URL}/api/mis-proyectos`, {
    credentials: 'include'
  })
    .then((res) => res.json())
    .then((data) => {
      setProyectos(data);
      if (data.length > 0) setProyectoSeleccionado(data[0]);
    })
    .catch((error) => {
      console.error("Error al cargar mis proyectos:", error);
    })
    .finally(() => {
      setCargando(false);
    });
}, []);

  // Función async para cargar postulaciones de un proyecto
  const cargarPostulaciones = async (projectId) => {
    setCargandoPostulaciones(true);
    setErrorPostulaciones(null);

    const API_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://pruebasitflex.onrender.com";

    try {
      const res = await fetch(`${API_URL}/api/postulaciones/proyecto/${projectId}`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error("Error al cargar postulaciones");

      const data = await res.json();
      setPostulaciones(data);
      setMostrarPostulantes(true);
    } catch (error) {
      console.error("Error al cargar postulaciones:", error);
      setErrorPostulaciones(error.message);
      setPostulaciones([]);
      setMostrarPostulantes(false);
    } finally {
      setCargandoPostulaciones(false);
    }
  };

  const manejarSeleccionProyecto = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setMostrarPostulantes(false);
    setPostulaciones([]);
  };

 if (cargando) return <Loader />;
 if (!cargando && proyectos.length === 0) return <p>No tienes proyectos publicados aún.</p>;

  return (
    <div className="proyectos-container">
      <div className="proyectos-listado-izquierdo">
        <h2>Mis Proyectos Publicados</h2>
        {proyectos.map((proyecto) => (
          <div
            key={proyecto.id}
            className={`proyecto-card ${proyectoSeleccionado?.id === proyecto.id ? "seleccionado" : ""}`}
            onClick={() => manejarSeleccionProyecto(proyecto)}
          >
            <h3>{proyecto.title}</h3>
            <div className="proyecto-info">
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
            <div className="proyecto-tiempo" title={new Date(proyecto.created_at).toLocaleString()}>
              {tiempoRelativo(proyecto.created_at)}
            </div>
          </div>
        ))}
      </div>

      {proyectoSeleccionado && (
        <div className="proyecto-detalle">
          <h2>{proyectoSeleccionado.title}</h2>
          <div className="detalle-header">
            <div>
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

          <BtnVerPostu texto={mostrarPostulantes ? "Ocultar postulantes" : "Ver postulantes"} onClick={manejarClickPostulantes} activo={mostrarPostulantes}/>

          {cargandoPostulaciones && <p>Cargando postulantes...</p>}
          {errorPostulaciones && <p style={{ color: 'red' }}>{errorPostulaciones}</p>}

          {mostrarPostulantes && (
            <div className="postulaciones-listado">
              <h3>Propuestas de Postulantes</h3>
              {postulaciones.length === 0 ? (
                <p>No hay postulaciones para este proyecto.</p>
              ) : (
                postulaciones.map((postulacion) => (
                  <div key={postulacion.id} className="postulacion-card">
                    <p><strong>Freelancer:</strong> <Link  class="usuario" to={`/perfil/${postulacion.freelancer_id}`}> {postulacion.freelancer_name || "Nombre no disponible"}</Link></p>
                    
                    {/* Mostrar habilidades */}
                    <div className="habilidades-linea">
                      <strong>Habilidades:</strong>
                      <div className="roles-con-colapsar">
                        {postulacion.habilidades
                          .slice(0, habilidadesExpandida[postulacion.id] ? undefined : 4)
                          .map((hab, index) => (
                            <div className="role" key={index}>{hab}</div>
                          ))}

                        {postulacion.habilidades.length > 4 && (
                          <div className="ver-mas-wrapper">
                            <button
                              className="ver-mas-btn"
                              onClick={() => toggleHabilidades(postulacion.id)}
                            >
                              {habilidadesExpandida[postulacion.id]
                                ? "Ver menos"
                                : `+${postulacion.habilidades.length - 4} más`}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p><strong>Propuesta:</strong> {postulacion.proposal_text}</p>
                    <p><strong>Presupuesto propuesto:</strong> ${postulacion.proposed_budget?.toLocaleString()}</p>
                    <p><strong>Días estimados:</strong> {postulacion.estimated_days}</p>
                    <p><strong>Estado:</strong> {postulacion.status}</p>
                    {postulacion.status !== "Aceptada" ? (
                      <div className="botones-edicion">
                        <BotonCancelar className="pequeno" texto="Rechazar" onClick={() => rechazarPropuesta(postulacion.id)} />
                        <BotonGuardar tamaño="pequeño" texto="Aceptar" onClick={() => aceptarPropuesta(postulacion.id)} />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><p>Propuesta aceptada</p> <IrChat usuarioLogueadoId={usuarioActual.id} usuarioPropuestaId={postulacion.freelancer_id}/></div>  
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MisProyectosListado;
