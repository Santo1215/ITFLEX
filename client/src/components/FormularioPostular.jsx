import React, { useState } from 'react';
import styled from 'styled-components';
import BotonPostulacion from './BotonPostular';

const FormularioPostulacion = ({ proyecto, usuarioActual, postulados, setPostulados, onClose }) => {
  const [presupuesto, setPresupuesto] = useState("");
  const [dias, setDias] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const presupuestoMaximo = proyecto.budget * 2;

  const [presupuestoEstimado, setPresupuestoEstimado] = useState("");

  const handlePresupuestoChange = (e) => {
    const valor = e.target.value;
    if (valor <= presupuestoMaximo) {
      setPresupuestoEstimado(valor);
    } else {
      alert(`El presupuesto máximo permitido es $${presupuestoMaximo.toLocaleString()}`);
    }
  };

  return (
    <StyledWrapper>
      <div className="container">
        <div className="modal">
          <div className="modal__header">
            <span className="modal__title">Postulación</span>
            <button className="button button--icon" onClick={onClose}>
              <svg width={24} height={24} viewBox="0 0 24 24">
                <path fill="none" d="M0 0h24v24H0V0z" />
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
              </svg>
            </button>
          </div>
          <div className="modal__body">
            <div className="input">
              <label className="input__label">Presupuesto</label>
                <input className="input__field"
                    type="number"
                    value={presupuestoEstimado}
                    onChange={handlePresupuestoChange}
                    min={0}
                    max={presupuestoMaximo}
                    placeholder={`Hasta $${presupuestoMaximo.toLocaleString()}`}
                    required
                />
            </div>
            <div className="input">
              <label className="input__label">Días estimados</label>
              <input
                className="input__field"
                type="number"
                placeholder="Ingrese los días estimados para la entrega"
                value={dias}
                onChange={(e) => setDias(e.target.value)} required
              />
            </div>
            <div className="input">
              <label className="input__label">Descripción</label>
              <textarea
                className="input__field input__field--textarea"
                placeholder="Ingrese una descripción de su propuesta"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
          </div>
          <div className="modal__footer">
            <BotonPostulacion
              proyecto={proyecto}
              usuarioActual={usuarioActual}
              postulados={postulados}
              setPostulados={setPostulados}
              presupuesto={presupuestoEstimado}
              dias={dias}
              descripcion={descripcion}
              onPostular={onClose}
            />
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button {
    appearance: none;
    font: inherit;
    border: none;
    background: none;
    cursor: pointer;
  }

  .container {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
  }

  .modal {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 500px;
    background-color: #fff;
    box-shadow: 0 15px 30px rgba(0, 125, 171, 0.15);
    border-radius: 10px;
  }

  .modal__header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal__body {
    padding: 1rem;
  }

  .modal__footer {
    padding: 0 1.5rem 1.5rem;
  }

  .modal__title {
    font-weight: 700;
    font-size: 1.25rem;
  }

  .button--icon {
    width: 2.5rem;
    height: 2.5rem;
    background-color: transparent;
    border-radius: 0.25rem;
  }

  .button--icon:hover {
    background-color: #ededed;
  }

  .input {
    display: flex;
    flex-direction: column;
  }

  .input + .input {
    margin-top: 1.75rem;
  }

  .input__label {
    font-weight: 700;
    font-size: 0.875rem;
  }

  .input__field {
    margin-top: 0.5rem;
    border: 1px solid #DDD;
    border-radius: 0.25rem;
    padding: 0.75rem;
  }

  .input__field:focus {
    outline: none;
    border-color: #007dab;
    box-shadow: 0 0 0 1px #007dab, 0 0 0 4px rgba(0, 125, 171, 0.25);
  }

  .input__field--textarea {
    font: inherit;
    min-height: 100px;
    resize: vertical;
  }
`;

export default FormularioPostulacion;
