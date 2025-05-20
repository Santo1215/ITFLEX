import React from 'react';
import styled from 'styled-components';

const BotonCancelar = ({ onClick, className = "" }) => {
  return (
    <StyledWrapper>
      <button className={`boton-cancelar ${className}`} type="button" onClick={onClick}>
        <span className="texto">Cancelar</span>
        <span className="icono">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"
              fill="#fff"
            />
          </svg>
        </span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
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



export default BotonCancelar;
