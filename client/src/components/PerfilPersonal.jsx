import React, { useEffect, useState } from "react";
import "../assets/styles/PerfilPersonal.css";
import BotonEdición from "./BotonEditar";
import {BotonGuardar,BotonCancelar} from "./BotonGuardar";
import SelectorHabilidades from "./SelectorHabilidades";
import Loader from "./Cargando";
import { API_URL } from '../constants';

function PerfilPersonal() {
  const [listaHabilidades, setListaHabilidades] = useState([]);
  const formatearUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return "https://" + url;
};
  const DEFAULT_PROFILE_IMAGE =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  const [perfilData, setPerfilData] = useState({
    perfil: {
      nombre: "",
      email: "",
      bio: "",
      fecha_nacimiento: "",
      location: "",
      hourly_rate: "",
      profile_image: "",
      website_url: "",
      enlaces_sociales: [],
      habilidades: [],
    },
    habilidades: [],
  });

  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfilData((prev) => ({
      ...prev,
      perfil: { ...prev.perfil, [name]: value },
    }));
  };

  const handleEnlacePlatformChange = (index, value) => {
  setPerfilData(prevState => {
    const nuevosEnlaces = [...prevState.perfil.enlaces_sociales];
    nuevosEnlaces[index] = {
      ...nuevosEnlaces[index],
      platform: value,
    };
    return {
      ...prevState,
      perfil: {
        ...prevState.perfil,
        enlaces_sociales: nuevosEnlaces,
      },
    };
  });
};

const handleEnlaceChange = (index, value) => {
  setPerfilData(prevState => {
    const nuevosEnlaces = [...prevState.perfil.enlaces_sociales];
    nuevosEnlaces[index] = {
      ...nuevosEnlaces[index],
      url: value,
    };
    return {
      ...prevState,
      perfil: {
        ...prevState.perfil,
        enlaces_sociales: nuevosEnlaces,
      },
    };
  });
};

  const agregarEnlace = () => {
  setPerfilData(prevState => ({
    ...prevState,
    perfil: {
      ...prevState.perfil,
      enlaces_sociales: [
        ...prevState.perfil.enlaces_sociales,
        { platform: "", url: "" },
      ],
    },
  }));
};
 const cargarPerfil = async () => {
  try {
    const res = await fetch(`${API_URL}/api/perfil`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error cargando perfil");

    const data = await res.json();
    // Extraer los skill_ids de las relaciones usuario-habilidad
    const habilidadesUsuario = data.habilidades.map((h) => h.id);

    setPerfilData({
      perfil: {
        ...data.perfil,
        website_url: data.perfil.website,
        enlaces_sociales: data.enlaces_sociales || [],
        habilidades: habilidadesUsuario,
      },
    });

    // También puedes obtener el catálogo completo de habilidades si es necesario en otra llamada
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
    cargarPerfil();
  }, []);

  if (loading) return <Loader/>;

  const { perfil } = perfilData;
  const habilidadesCompletas = listaHabilidades.filter((hab) =>
    perfil.habilidades.includes(hab.id)
  );
  // Función para actualizar habilidades desde SelectorHabilidades
  const actualizarHabilidades = (nuevasHabilidades) => {
    setPerfilData((prev) => ({
      ...prev,
      perfil: {
        ...prev.perfil,
        habilidades: nuevasHabilidades,
      },
    }));
  };

  const guardarCambios = async () => {
  const { perfil } = perfilData;

  const enlacesValidos = perfil.enlaces_sociales.every(
    (enlace) => enlace.url.trim() !== "" && enlace.platform.trim() !== ""
  );

  if (!enlacesValidos) {
    alert("Todos los campos de enlaces sociales deben estar completos.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/perfil`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(perfil), // Enviamos perfilData.perfil
    });

    if (!res.ok) throw new Error("Error guardando perfil");

    const updatedRes = await fetch(`${API_URL}/api/perfil`, {
      method: "GET",
      credentials: "include",
    });

    if (!updatedRes.ok) throw new Error("Error recargando perfil");

    const updatedData = await updatedRes.json();

    const habilidadesUsuario = updatedData.habilidades.map((h) => h.id); 

    setPerfilData({
      perfil: {
        ...updatedData.perfil,
        enlaces_sociales: updatedData.enlaces_sociales || [],
        habilidades: habilidadesUsuario,
      },
      habilidades: updatedData.habilidades || [],
    });

    setEditando(false);
    alert("Perfil actualizado correctamente");
  } catch (err) {
    console.error(err.message);
    alert("Error guardando o recargando perfil");
  }
};

  const cancelarEdicion = async () => {
    setLoading(true);
    await cargarPerfil();
    setEditando(false);
  };
  return (
    <div className="container">
      <div className="header">
        <h2>Datos Personales</h2>
        {editando ? (
          <div className="botones-edicion">
            <BotonCancelar onClick={cancelarEdicion} className="pequeno" />
            <BotonGuardar onClick={guardarCambios} tamaño="pequeño" />
          </div>
        ) : (
          <BotonEdición onClick={() => setEditando(true)} />
        )}
      </div>

      <div
        className="profile-pic"
        style={{
          backgroundImage: `url(${perfil.profile_image || DEFAULT_PROFILE_IMAGE})`,
        }}
      ></div>

      <div className="fields">
        <div className="field">
          <label>Nombre</label>
          <input
            name="nombre"
            type="text"
            value={perfil.nombre || ""}
            readOnly={!editando}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label>Correo</label>
          <input
            name="email"
            type="email"
            value={perfil.email || ""}
            readOnly={!editando}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label>Ubicación</label>
          <input
            name="location"
            type="text"
            value={perfil.location || ""}
            readOnly={!editando}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label>Tarifa por hora</label>
          <input
            name="hourly_rate"
            type="number"
            min="0"
            step="0.01"
            value={perfil.hourly_rate || ""}
            readOnly={!editando}
            onChange={handleChange}
          />
        </div>
      </div>

      <h3>Especialidades</h3>
<div className="roles">
  {editando ? (
    <SelectorHabilidades
      listaHabilidades={listaHabilidades}
      habilidadesSeleccionadas={perfil.habilidades}
      onCambiarHabilidades={actualizarHabilidades}
    />
  ) : habilidadesCompletas.length > 0 ? (
    habilidadesCompletas.map((hab) => (
      <div className="role" key={hab.id}>
        {hab.name}
      </div>
    ))
  ) : (
    <div className="empty-msg">No han sido añadidas especialidades.</div>
  )}
</div>
<div className="field">
      <label>Página web</label>
      {editando ? (
        <input
          type="url"
          name="website"
          value={perfil.website || ""}
          onChange={handleChange}
          placeholder="https://ejemplo.com"
        />
      ) : perfil.website ? (
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
        {editando ? (
          <textarea
            name="bio"
            value={perfil.bio || ""}
            onChange={handleChange}
            rows={5}
          />
        ) : (
          perfil.bio?.split("\n").map((p, i) => <p key={i}>{p}</p>)
        )}
      </div>

      <h3>Información de contacto</h3>
      <div className="contact-info">
        {editando ? (
          <>
            {(perfil.enlaces_sociales || []).map((enlace, i) => (
              <div className="enlace-social" key={i}>
                <input type="text" placeholder="Plataforma (e.g. GitHub)" value={enlace.platform} onChange={(e) => handleEnlacePlatformChange(i, e.target.value)}/>
                <input type="url" placeholder="URL" value={enlace.url} onChange={(e) => handleEnlaceChange(i, e.target.value)}/>
              </div>
            ))}
              <button className="btn-agregar" onClick={agregarEnlace}>Agregar enlace</button></>
        ) : perfil.enlaces_sociales && perfil.enlaces_sociales.length > 0 ? (
              perfil.enlaces_sociales.map((enlace, index) => (
                <div key={index}>
                 <strong>{enlace.platform}:</strong> <a style={{ textDecoration: 'none' }} href={enlace.url} target="_blank" rel="noopener noreferrer">{enlace.url}</a>
                </div>
             ))
            ) : (
            <div className="empty-msg">No hay enlaces sociales añadidos.</div>
            )}
            </div>
            </div>
            );
            }

export default PerfilPersonal;