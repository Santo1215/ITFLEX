import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

// Botón postulación
export const BotonPostulacion = ({ onClick, disabled, texto }) => {
  return (
    <PostulacionWrapper>
      <button onClick={onClick} disabled={disabled} className={disabled ? "postulado" : ""}>
        <span className="transition" />
        <span className="gradient" />
        <span className="label">{texto}</span>
      </button>
    </PostulacionWrapper>
  );
};

const PostulacionWrapper = styled.div`
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

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://pruebasitflex.onrender.com';

export const IrChat = ({ usuarioLogueadoId, usuarioPropuestaId }) => {
  const navigate = useNavigate();

  const crearONavegarChat = async () => {
    try {
      // Consultar si ya existe un chat con estos usuarios
      const consultaResponse = await fetch(`${API_URL}/api/chats/existing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          freelancer_id: usuarioPropuestaId,
          cliente_id: usuarioLogueadoId,
        }),
      });

      if (!consultaResponse.ok) throw new Error('Error consultando chat existente');
      const chatExistente = await consultaResponse.json();

      if (chatExistente.exists) {
        // Si existe chat, navegar con la URL con IDs concatenados
        navigate(`/Chats/${usuarioLogueadoId}`);
      } else {
        // Crear chat nuevo
        const crearResponse = await fetch(`${API_URL}/api/chats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            freelancer_id: usuarioPropuestaId,
            cliente_id: usuarioLogueadoId,
          }),
        });

        if (!crearResponse.ok) throw new Error('Error creando chat');

        // Navegar igual al URL con los IDs concatenados
        navigate(`/Chats/${usuarioLogueadoId}`);
      }
    } catch (error) {
      console.error(error);
      alert('No se pudo acceder al chat');
    }
  };

  return (
    <ChatWrapper>
      <button className="cta" onClick={crearONavegarChat}>
        <span className="hover-underline-animation"> Ir a los chats</span>
        <svg
          id="arrow-horizontal"
          xmlns="http://www.w3.org/2000/svg"
          width={30}
          height={10}
          viewBox="0 0 46 16"
        >
          <path
            id="Path_10"
            data-name="Path 10"
            d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z"
            transform="translate(30)"
          />
        </svg>
      </button>
    </ChatWrapper>
  );
};

const ChatWrapper = styled.div`
  .cta {
    border: none;
    background: none;
    cursor: pointer;
  }

  .cta span {
    padding-bottom: 7px;
    letter-spacing: 4px;
    font-size: 14px;
    padding-right: 15px;
    text-transform: uppercase;
  }

  .cta svg {
    transform: translateX(-8px);
    transition: all 0.3s ease;
  }

  .cta:hover svg {
    transform: translateX(0);
  }

  .cta:active svg {
    transform: scale(0.9);
  }

  .hover-underline-animation {
    position: relative;
    color: black;
    padding-bottom: 20px;
  }

  .hover-underline-animation:after {
    content: "";
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: #000000;
    transform-origin: bottom right;
    transition: transform 0.25s ease-out;
  }

  .cta:hover .hover-underline-animation:after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }
`;

