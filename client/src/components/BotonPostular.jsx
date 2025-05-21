import React, { useState, useEffect } from "react";
import styled from "styled-components";

const BotonPostulacion = ({ proyecto, usuarioActual, postulados, setPostulados }) => {
  // Verificar si ya está postulado
  const estaPostulado = postulados.includes(proyecto.id);

  const handleClick = async () => {
    try {
      // Aquí llamas al backend para guardar la postulación
      const API_URL = window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://pruebasitflex.onrender.com";

      const response = await fetch(`${API_URL}/api/postulaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          project_id: proyecto.id,
          freelancer_id: usuarioActual.id,
          proposal_text: "Estoy interesado en este proyecto",
          proposed_budget: proyecto.budget,
          estimated_days: 15,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al registrar la postulación");
      }

      // Actualizamos el estado para que este botón cambie solo para este proyecto
      setPostulados([...postulados, proyecto.id]);

    } catch (error) {
      console.error(error);
      alert("Error al postularse");
    }
  };

  return (
    <StyledWrapper>
      <button
        onClick={handleClick}
        disabled={estaPostulado}
        className={estaPostulado ? "postulado" : ""}
      >
        <span className="transition" />
        <span className="gradient" />
        <span className="label">{estaPostulado ? "Postulado" : "Postularme"}</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  button {
    font-size: 17px;
    padding: 1em 2.7em;
    font-weight: 500;
    background: #1f2937;
    color: white;
    border: none;
    position: relative;
    overflow: hidden;
    border-radius: 0.6em;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button.postulado {
    background-color: #10b981; /* verde */
    cursor: default;
  }

  .gradient {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    border-radius: 0.6em;
    margin-top: -0.25em;
    background-image: linear-gradient(
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0.3)
    );
  }

  .label {
    position: relative;
    top: -1px;
  }

  .transition {
    transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
    transition-duration: 500ms;
    background-color: rgba(16, 185, 129, 0.6);
    border-radius: 9999px;
    width: 0;
    height: 0;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  button:hover .transition {
    width: 14em;
    height: 14em;
  }

  button:active {
    transform: scale(0.97);
  }
`;

export default BotonPostulacion;
