import { useState, useEffect } from "react";
import '../assets/styles/ProyectosListado.css';
import Loader from "./Cargando";
import "../assets/styles/Postulantes.css";
import { BtnVerPostu }  from "./BotonPostular";
import { Link } from 'react-router-dom';
import {BotonGuardar,BotonCancelar} from "./BotonGuardar";
import { IrChat } from './BotonPostularAbrir';
import { ModalPago } from "./FormularioPostular";
import { useBalance } from '../context/BalanceContext';
import { API_URL, getUserId } from '../constants';
const userId = getUserId();

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
  const { balanceUsuario, setBalanceUsuario } = useBalance();
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [habilidadesExpandida, setHabilidadesExpandida] = useState({});
  const [modalPagoVisible, setModalPagoVisible] = useState(false);
  
const confirmarPagoYFinalizar = async (id, monto, receiverId) => {
  if (balanceUsuario < monto) {
    alert("No tienes suficiente saldo para realizar este pago.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/proyectos/${id}/finalizar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monto, receiverId })
    });

    if (response.ok) {
      alert("Proyecto finalizado exitosamente.");
      setModalPagoVisible(false);

      // Actualizar balance
      const res = await fetch(`${API_URL}/api/balance/usuario/${userId}`);
      const data = await res.json();
      setBalanceUsuario(data.balanceUsuario);

      // Actualizar localmente el proyecto finalizado dentro del array proyectos
      setProyectos((prevProyectos) =>
        prevProyectos.map((proyecto) =>
          proyecto.id === id ? { ...proyecto, status: "Finalizado" } : proyecto
        )
      );

      // También actualizamos el proyecto seleccionado para que el detalle se vea actualizado
      if (proyectoSeleccionado?.id === id) {
        setProyectoSeleccionado((prev) => ({ ...prev, status: "Finalizado" }));
      }
    } else {
      const data = await response.json();
      console.error("Error al finalizar:", data);
      alert("Error al confirmar el pago.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Hubo un problema al conectar con el servidor.");
  }
};

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
  const postulacionAceptada = postulaciones.find(p => p.status === "Aceptada") || null;
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

const aceptarPropuesta = async (postulacionId) => {
  try {
    const res = await fetch(`${API_URL}/api/postulaciones/${postulacionId}/aceptar`, {
      method: "PUT",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al aceptar propuesta");

    // Actualizar postulaciones
    setPostulaciones((prev) =>
      prev.map((p) =>
        p.id === postulacionId ? { ...p, status: "Aceptada" } : p
      )
    );

    // Cambiar el estado del proyecto a "En desarrollo"
    setProyectos((prev) =>
      prev.map((p) =>
        p.id === proyectoSeleccionado.id ? { ...p, status: "En desarrollo" } : p
      )
    );
    setProyectoSeleccionado((prev) => ({ ...prev, status: "En desarrollo" }));

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

  if (proyecto.status === "Finalizado") {
    cargarPostulaciones(proyecto.id);
  }
};

 if (cargando) return <Loader />;
 if (!cargando && proyectos.length === 0) return <p>No tienes proyectos publicados aún.</p>;
 
  return (
    <div className="proyectos-container">
      <div className="proyectos-listado-izquierdo">
        <h2>Mis Proyectos</h2>
        {proyectos.map((proyecto) => {
          const estaFinalizado = proyecto.status === "Finalizado";

          return (
            <div
              key={proyecto.id}
              className={`proyecto-card 
                ${proyectoSeleccionado?.id === proyecto.id ? "seleccionado" : ""} 
                ${estaFinalizado ? "finalizado" : ""}`}
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

              {/* Mostrar el estado */}
              <div className="proyecto-estado">
                Estado: <strong>{proyecto.status || "Desconocido"}</strong>
              </div>

              {/* Si finalizado, superponer texto */}
              {estaFinalizado && (
                <div className="overlay-finalizado">
                  FINALIZADO
                </div>
              )}
            </div>
          );
        })}

      </div>
    <ModalPago isOpen={modalPagoVisible} onClose={() => setModalPagoVisible(false)} onPagoRealizado={confirmarPagoYFinalizar} 
    projectId={proyectoSeleccionado.id} receiverId={proyectoSeleccionado.freelancer_id} />
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
                
          {proyectoSeleccionado.status !== "Finalizado" && (
            <BtnVerPostu
              texto={mostrarPostulantes ? "Ocultar postulantes" : "Ver postulantes"}
              onClick={manejarClickPostulantes}
              activo={mostrarPostulantes}
            />
          )}       
          {proyectoSeleccionado.status === "Finalizado" && postulacionAceptada ? (
            <div className="postulacion-card">
              <h3>Freelancer seleccionado</h3>
              <p><strong>Freelancer:</strong> <Link className="usuario" to={`/perfil/${postulacionAceptada.freelancer_id}`}>{postulacionAceptada.freelancer_name || "Nombre no disponible"}</Link></p>
              <div className="habilidades-linea">
                <strong>Habilidades:</strong>
                <div className="roles-con-colapsar">
                  {postulacionAceptada.habilidades.map((hab, index) => (
                    <div className="role" key={index}>{hab}</div>
                  ))}
                </div>
              </div>
              <p><strong>Presupuesto propuesto:</strong> ${postulacionAceptada.proposed_budget?.toLocaleString()}</p>
              <p><strong>Días estimados:</strong> {postulacionAceptada.estimated_days}</p>
            </div>
          ) : proyectoSeleccionado.status === "Finalizado" ? (
            <p>No fue aceptada ninguna propuesta para este proyecto.</p>
          ) : null}


          {proyectoSeleccionado.status === "En desarrollo" && (
          <div style={{ marginTop: '1rem' }}>
            <BotonGuardar
              texto="Finalizar proyecto"
              onClick={() => setModalPagoVisible(true)}
            />
          </div>
        )}
          {cargandoPostulaciones && <p>Cargando postulantes...</p>}
          {errorPostulaciones && <p style={{ color: 'red' }}>{errorPostulaciones}</p>}

          {mostrarPostulantes && proyectoSeleccionado.status !=="Finalizado" &&(
            <div className="postulaciones-listado">
              <h3>Propuestas de Postulantes</h3>
              {postulaciones.length === 0 ? (
                <p>No hay postulaciones para este proyecto.</p>
              ) : (
                postulaciones.map((postulacion) => (
                  <div key={postulacion.id} className="postulacion-card">
                    <p><strong>Freelancer:</strong> <Link  className="usuario" to={`/perfil/${postulacion.freelancer_id}`}> {postulacion.freelancer_name || "Nombre no disponible"}</Link></p>
                    
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
