import React from 'react';
import styled from 'styled-components';

export const BotonGuardar = ({ onClick, tamaño = "normal", texto = "Guardar" }) => {
  return (
    <StyledWrapperGuardar>
      <button
        onClick={onClick}
        className={tamaño === "pequeño" ? "pequeno" : ""}
      >
        {texto}
      </button>
    </StyledWrapperGuardar>
  );
};

const StyledWrapperGuardar = styled.div`
  button {
    width: 9em;
    height: 3em;
    border-radius: 0.5em;
    font-size: 15px;
    font-family: inherit;
    border: none;
    position: relative;
    overflow: hidden;
    z-index: 1;
    box-shadow: 6px 6px 12px #c5c5c5,
                -6px -6px 12px #ffffff;
    background-color: white;
    cursor: pointer;
  }

  button::before {
    content: '';
    width: 0;
    height: 3em;
    border-radius: 0.5em;
    position: absolute;
    top: 0;
    left: 0;
    background-image: linear-gradient(to right, #0fd850 0%, #f9f047 100%);
    transition: .5s ease;
    display: block;
    z-index: -1;
  }

  button:hover::before {
    width: 9em;
  }

  /* Tamaño pequeño */
  .pequeno {
    width: 7em;
    height: 2.5em;
    font-size: 13px;
  }

  .pequeno::before {
    height: 2.5em;
  }
`;

// ----------------------------------------------------------------

export const BotonCancelar = ({ onClick, className = "" , texto = "Cancelar"}) => {
  return (
    <StyledWrapperCancelar>
      <button className={`boton-cancelar ${className}`} type="button" onClick={onClick}>
        <span className="texto">{texto}</span>
        <span className="icono">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"
              fill="#fff"
            />
          </svg>
        </span>
      </button>
    </StyledWrapperCancelar>
  );
};

const StyledWrapperCancelar = styled.div`
  .boton-cancelar {
    position: relative;
    width: 120px;
    height: 45px;
    background-color: #e50000;
    border: none;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
    overflow: hidden;
  }

  .texto {
    transition: opacity 0.3s ease;
  }

  .icono {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .boton-cancelar:hover .texto {
    opacity: 0;
  }

  .boton-cancelar:hover .icono {
    opacity: 1;
  }

  .boton-cancelar svg {
    width: 20px;
    height: 20px;
    fill: white;
  }

  .boton-cancelar:active {
    background-color: #b20000;
    transform: scale(0.97);
  }

  .boton-cancelar {
    width: 100px;
    height: 40px;
    font-size: 14px;
  }

  .boton-cancelar.pequeno {
    width: 80px;
    height: 30px;
    font-size: 12px;
  }
`;
