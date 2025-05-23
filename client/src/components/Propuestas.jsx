import { useState, useEffect } from "react";
import '../assets/styles/ProyectosListado.css';
import Loader from "./Cargando";
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

const Propuestas = () => {
  const [recibidas, setRecibidas] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState(null);

  const API_URL = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://pruebasitflex.onrender.com";

  const crearONavegarChat = async (usuarioLogueadoId, usuarioPropuestaId, esFreelancer) => {
  try {
    console.log("crearONavegarChat parámetros:", { usuarioLogueadoId, usuarioPropuestaId, esFreelancer });

    const body = esFreelancer
      ? { freelancer_id: usuarioLogueadoId, cliente_id: usuarioPropuestaId }
      : { freelancer_id: usuarioPropuestaId, cliente_id: usuarioLogueadoId };

    console.log("crearONavegarChat body enviado:", body);

    const res = await fetch(`${API_URL}/api/chats/existing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const textoError = await res.text();
      throw new Error(`Error consultando chat existente: ${res.status} - ${textoError}`);
    }

    const data = await res.json();
    console.log("Respuesta chat existente:", data);

  } catch (error) {
    console.error(error);
  }
};


  useEffect(() => {
    fetch(`${API_URL}/api/invitaciones/recibidas`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar invitaciones');
        return res.json();
      })
      .then(data => setRecibidas(data))
      .catch(err => console.error(err))
      .finally(() => setCargando(false));
  }, [API_URL]);

  const aceptarInvitacion = async (invitacionId) => {
    try {
      const res = await fetch(`${API_URL}/api/invitaciones/aceptar/${invitacionId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Error al aceptar invitación');

      setRecibidas(prev =>
        prev.map(inv => inv.id === invitacionId ? { ...inv, status: 'Aceptada' } : inv)
      );

      setProyectoSeleccionado(prev =>
        prev && prev.id === invitacionId ? { ...prev, status: 'Aceptada' } : prev
      );

    } catch (err) {
      console.error(err);
    }
  };

  const rechazarInvitacion = async (invitacionId) => {
    try {
      const res = await fetch(`${API_URL}/api/invitaciones/rechazar/${invitacionId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Error al rechazar invitación');

      setRecibidas(prev => prev.filter(inv => inv.id !== invitacionId));

      setProyectoSeleccionado(prev =>
        prev && prev.id === invitacionId ? null : prev
      );

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const res = await fetch(`${API_URL}/api/perfil`, { credentials: 'include' });
        if (!res.ok) {
          if (res.status === 404) {
            console.error("Perfil no encontrado (404)");
            setUsuarioActual(null);
            return;
          }
          throw new Error('Error al cargar perfil');
        }
        const data = await res.json();
        setUsuarioActual(data.perfil || data);
      } catch (err) {
        console.error('Error cargando perfil:', err);
        setUsuarioActual(null);
      }
    };
    cargarPerfil();
  }, [API_URL]);
  console.log('usuarioActual:', usuarioActual);
console.log('proyectoSeleccionado:', proyectoSeleccionado);

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

            return (
              <div
                key={inv.id}
                className={`proyecto-card ${
                  proyectoSeleccionado?.id === inv.id ? "seleccionado" : ""
                }`}
                onClick={() => setProyectoSeleccionado(inv)}
              >
                <h3>{proyecto?.title || "Proyecto sin título"}</h3>
                <div className="proyecto-info">
                  <span>
                    <Link className="usuario" to={`/perfil/${inv.client_id || proyecto?.client_id || ""}`}>
                      {inv.emisor_name || proyecto?.nombre_cliente || "Sin nombre"}
                    </Link>
                  </span>
                  <span className="calificacion">
                    ★ {proyecto?.calificacion || "N/A"}
                  </span>
                </div>
                <div className="proyecto-info">
                  <span>{proyecto?.ubicacion || "Ubicación no disponible"}</span>
                  <span className="presupuesto">
                    ${proyecto?.budget?.toLocaleString() || 0}
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

      {proyectoSeleccionado && (
        <div className="proyecto-detalle">
          {proyectoSeleccionado.project ? (
            <>
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
            </>
          ) : (
            <p>Este proyecto ya no está disponible.</p>
          )}

          <div className="estado-invitacion">
            <p><strong>Estado:</strong> {proyectoSeleccionado.status || "Desconocido"}</p>

            {proyectoSeleccionado.status !== "Aceptada" ? (
              <div className="botones-edicion">
                <BotonCancelar
                  className="pequeno"
                  texto="Rechazar"
                  onClick={() => rechazarInvitacion(proyectoSeleccionado.id)}
                />
                <BotonGuardar
                  tamaño="pequeño"
                  texto="Aceptar"
                  onClick={() => aceptarInvitacion(proyectoSeleccionado.id)}
                />
              </div>
            ) : (
             usuarioActual && proyectoSeleccionado.emisor_id && (
              <div>
                <p>Invitación aceptada</p>
                <IrChat usuarioLogueadoId={proyectoSeleccionado.freelancer_id} usuarioPropuestaId={proyectoSeleccionado.emisor_id}/></div>
              
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Propuestas;
