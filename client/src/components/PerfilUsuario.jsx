import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../assets/styles/PerfilPersonal.css";
import Loader from "./Cargando";
import {BtnEnviar} from "./BtnEnviar";

function PerfilPublico() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [perfilData, setPerfilData] = useState({
    perfil: {
      nombre: "",
      email: "",
      bio: "",
      fecha_nacimiento: "",
      location: "",
      hourly_rate: "",
      profile_image: "",
      website: "",
      enlaces_sociales: [],
      habilidades: [],
    },
  });
  const [listaHabilidades, setListaHabilidades] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [proyectosCliente, setProyectosCliente] = useState([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("");
  const [invitacionEnviada, setInvitacionEnviada] = useState(false);
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://pruebasitflex.onrender.com";

  const DEFAULT_PROFILE_IMAGE =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  const formatearUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return "https://" + url;
  };

  const cargarPerfil = async () => {
    try {
      const res = await fetch(`${API_URL}/api/perfil/${id}`);
      if (!res.ok) throw new Error("Error cargando perfil");

      const data = await res.json();
      const habilidadesUsuario = data.habilidades.map((h) => h.id);

      setPerfilData({
        perfil: {
          ...data.perfil,
          website: data.perfil.website,
          enlaces_sociales: data.enlaces_sociales || [],
          habilidades: habilidadesUsuario,
        },
      });
    } catch (err) {
      console.error(err.message);
      alert("Error cargando el perfil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/habilidades`)
      .then((res) => res.json())
      .then((data) => setListaHabilidades(data))
      .catch((err) => console.error("Error cargando habilidades:", err));
  }, []);

  useEffect(() => {
  fetch(`${API_URL}/api/user`, { credentials: "include" })
    .then(res => res.json())
    .then(data => setUsuarioActual(data))
    .catch(err => console.error("Error cargando usuario actual", err));
}, []);
 useEffect(() => {
  if (!usuarioActual) return; // Esperar a que se cargue usuarioActual

  fetch(`${API_URL}/api/invitaciones/proyectos-invitables/${id}`, { credentials: "include" })
    .then((res) => res.json())
    .then((proyectos) => {
      setProyectosCliente(proyectos);
    })
    .catch((err) => console.error("Error obteniendo proyectos invitables:", err));
}, [usuarioActual, id]);

    const manejarInvitacion = () => {
    console.log("Click en enviar invitación");
    if (!proyectoSeleccionado) return alert("Selecciona un proyecto primero");

    fetch(`${API_URL}/api/invitaciones`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
        project_id: proyectoSeleccionado,
        freelancer_id: id, // id del perfil
        }),
    })
        .then((res) => {
        if (!res.ok) throw new Error("Error al enviar la invitación");
        setInvitacionEnviada(true);
        })
        .catch((err) => {
        console.error(err.message);
        alert("No se pudo enviar la invitación");
        });
    };
  useEffect(() => {
    cargarPerfil();
  }, [id]);

  if (loading) return <Loader />;

  const { perfil } = perfilData;
  const habilidadesCompletas = listaHabilidades.filter((hab) =>
    perfil.habilidades.includes(hab.id)
  );
    console.log("Datos del perfil:", perfil);   
  return (
    <div className="container">
      <div className="header">
        <h2>Perfil de {perfil.nombre}</h2>
      </div>

      <div
        className="profile-pic"
        style={{
          backgroundImage: `url(${perfil.profile_image || DEFAULT_PROFILE_IMAGE})`,
        }}
      ></div>

      <div className="fields">
        <div className="field"><label>Correo</label><p>{perfil.email}</p></div>
        <div className="field"><label>Ubicación</label><p>{perfil.location}</p></div>
        <div className="field"><label>Tarifa por hora</label><p>{perfil.hourly_rate}</p></div>
      </div>

      <h3>Especialidades</h3>
      <div className="roles">
        {habilidadesCompletas.length > 0 ? (
          habilidadesCompletas.map((hab) => (
            <div className="role" key={hab.id}>{hab.name}</div>
          ))
        ) : (
          <div className="empty-msg">No hay especialidades registradas.</div>
        )}
      </div>

      <div className="field">
        <label>Página web</label>
        {perfil.website ? (
          <a
            href={formatearUrl(perfil.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            {perfil.website}
          </a>
        ) : (
          <div className="empty-msg">No se ha añadido página web.</div>
        )}
      </div>

      <h3>Biografía</h3>
      <div className="description">
        {perfil.bio?.split("\n").map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <h3>Información de contacto</h3>
      <div className="contact-info">
        {perfil.enlaces_sociales && perfil.enlaces_sociales.length > 0 ? (
          perfil.enlaces_sociales.map((enlace, index) => (
            <div key={index}>
              <strong>{enlace.platform}:</strong>{" "}
              <a href={formatearUrl(enlace.url)} target="_blank" rel="noopener noreferrer">
                {enlace.url}
              </a>
            </div>
          ))
        ) : (
          <div className="empty-msg">No hay enlaces sociales añadidos.</div>
        )}
      </div>
      {usuarioActual && usuarioActual.id !== id && (
  <div className="invitacion-proyecto">
  <h3>Invitar a un proyecto</h3>
  {proyectosCliente.length > 0 ? (
    <>
      <div className="select-btn-wrapper">
        <select
          value={proyectoSeleccionado}
          onChange={(e) => setProyectoSeleccionado(e.target.value)}
        >
          <option value="">Selecciona un proyecto</option>
          {proyectosCliente.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <BtnEnviar onClick={manejarInvitacion}/>
      </div>
      {invitacionEnviada && <p className="invitacion-exito">¡Invitación enviada!</p>}
    </>
  ) : (
    <p>No tienes proyectos disponibles para invitar.</p>
  )}
</div>
)}
    </div>
  );
}

export default PerfilPublico;
