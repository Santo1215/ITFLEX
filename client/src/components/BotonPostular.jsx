import React from "react";
import styled from "styled-components";
import { API_URL } from '../constants';

export const BotonPostulacion = ({
  proyecto,
  usuarioActual,
  postulados,
  setPostulados,
  presupuesto,
  dias,
  descripcion,
  onPostular
}) => {
  const estaPostulado = postulados.includes(proyecto.id);

  const handleClick = async () => {
    try {

      const response = await fetch(`${API_URL}/api/postulaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          project_id: proyecto.id,
          freelancer_id: usuarioActual.id,
          proposal_text: descripcion,
          proposed_budget: presupuesto,
          estimated_days: dias,
        }),
      });

      if (!response.ok) throw new Error("Error al registrar la postulación");

      setPostulados([...postulados, proyecto.id]);

      if (onPostular) onPostular();

    } catch (error) {
      console.error(error);
      alert("Error al postularse");
    }
  };

  return (
    <StyledWrapperPostulacion>
      <button
        onClick={handleClick}
        disabled={estaPostulado}
        className={estaPostulado ? "postulado" : ""}
      >
        <span className="transition" />
        <span className="gradient" />
        <span className="label">{estaPostulado ? "Postulado" : "Postularme"}</span>
      </button>
    </StyledWrapperPostulacion>
  );
};

const StyledWrapperPostulacion = styled.div`
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
    background-color: #10b981;
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

// ------------------------------------------------------------------------

export const BtnVerPostu = ({ texto, onClick, activo = false }) => {
  return (
    <StyledWrapperVerPostu>
      <button onClick={onClick} className={activo ? "activo" : ""}>
        <span className="transition" />
        <span className="gradient" />
        <span className="label">{texto}</span>
      </button>
    </StyledWrapperVerPostu>
  );
};

const StyledWrapperVerPostu = styled.div`
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

  button.activo {
    background-color: #10b981; /* verde */
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
