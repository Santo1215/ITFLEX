import React, { useState } from "react";
import styled from "styled-components";

export const BtnEnviar = ({ onClick }) => (
  <StyledBtnEnviar onClick={onClick} type="button">
    <div className="svg-wrapper-1">
      <div className="svg-wrapper">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={24}
          height={24}
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            fill="currentColor"
            d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
          />
        </svg>
      </div>
    </div>
    <span>Enviar</span>
  </StyledBtnEnviar>
);

const StyledBtnEnviar = styled.button`
  font-family: inherit;
  font-size: 20px;
  background: linear-gradient(to bottom, #4dc7d9 0%, #66a6ff 100%);
  color: white;
  padding: 0.7em 1em;
  padding-left: 0.9em;
  display: flex;
  align-items: center;
  border: none;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;

  span {
    display: block;
    margin-left: 0.3em;
    transition: all 0.3s ease-in-out;
  }

  svg {
    display: block;
    transform-origin: center center;
    transition: transform 0.3s ease-in-out;
  }

  &:hover .svg-wrapper {
    animation: fly-1 0.6s ease-in-out infinite alternate;
  }

  &:hover svg {
    transform: translateX(1.2em) rotate(45deg) scale(1.1);
  }

  &:hover span {
    transform: translateX(5em);
  }

  &:active {
    transform: scale(0.95);
  }

  @keyframes fly-1 {
    from {
      transform: translateY(0.1em);
    }
    to {
      transform: translateY(-0.1em);
    }
  }
`;

export const InputMensaje = ({ value, onChange, onKeyDown }) => (
  <StyledInputMensaje>
    <input
      type="text"
      className="input"
      placeholder="Escribe un mensaje..."
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  </StyledInputMensaje>
);

const StyledInputMensaje = styled.div`
  flex: 1;

  .input {
    width: 97%;
    border: none;
    padding: 1rem;
    border-radius: 1rem;
    background: #e8e8e8;
    box-shadow: 20px 20px 60px #c5c5c5, -20px -20px 60px #ffffff;
    transition: 0.3s;
    text-align: left;
  }

  .input:focus {
    outline-color: #e8e8e8;
    background: #e8e8e8;
    box-shadow: inset 20px 20px 60px #c5c5c5, inset -20px -20px 60px #ffffff;
    transition: 0.3s;
  }
`;

export const ContenedorInputBtn = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
  align-items: center;
`;

export const ChatFooter = ({ onSend, value, onChange, onKeyDown }) => {
  const handleEnviar = () => {
    const texto = value.trim();
    if (!texto) return;
    onSend();
  };

  return (
    <ContenedorInputBtn>
      <InputMensaje
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <BtnEnviar onClick={handleEnviar} />
    </ContenedorInputBtn>
  );
};
