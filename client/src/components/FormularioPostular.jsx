import React, { useState } from 'react';
import styled from 'styled-components';
import { BotonPostulacion} from './BotonPostular';
import { API_URL, getUserId } from '../constants';

export const FormularioPostulacion = ({ proyecto, usuarioActual, postulados, setPostulados, onClose }) => {
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
                  min={1}  // Solo validar que sea positivo
                  type="number"
                  placeholder="Ingrese los días estimados para la entrega"
                  value={dias}
                  onChange={(e) => {
                    const valor = parseInt(e.target.value);
                    if (valor >= 1 || e.target.value === "") {
                      setDias(e.target.value);
                    }
                  }}
                  required
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

export const ModalPago = ({ isOpen, onClose, onPagoRealizado, projectId, receiverId }) => {
  const [monto, setMonto] = useState('');
  const [comentario, setComentario] = useState('');
  const [rating, setRating] = useState(0);
  const userId = getUserId();
  

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resFreelancer = await fetch(`${API_URL}/api/proyectos/${userId}/freelancer`);
    const dataFreelancer = await resFreelancer.json();
    const receiverId = dataFreelancer.freelancer_id;

    // Validar que el monto sea un número positivo
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      alert('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/proyectos/${projectId}/finalizar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ monto: montoNum, receiverId }),
      });

      if (!response.ok) throw new Error('Error al procesar el pago');
      
        const resReseña = await fetch(`${API_URL}/api/resenas` , {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            
            reviewer_id: userId,
            reviewed_id: receiverId,
            project_id: projectId,
            rating,
            comment: comentario
          })
        });
        
        if (!resReseña.ok) throw new Error('Error al registrar la reseña');

        alert('Pago y reseña realizados exitosamente');
        onPagoRealizado(projectId, montoNum, receiverId);
        onClose(); // Cierra el modal
      } catch (err) {
        console.error(err);
        alert('Ocurrió un error: ' + err.message);
      }
    };

  return (
    <StyledModalWrapper>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal__header">
            <span className="modal__title">Realizar Pago</span>
            <button className="button button--icon" onClick={onClose}>
              <svg width={24} height={24} viewBox="0 0 24 24">
                <path fill="none" d="M0 0h24v24H0V0z" />
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
              </svg>
            </button>
          </div>
          <form className="modal__body" onSubmit={handleSubmit}>
            <div className="input">
              <label className="input__label">Monto a pagar</label>
              <input
                className="input__field"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ingrese el monto"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
              />
            </div>
            <div className="input">
              <label className="input__label">Reseña</label>
              <textarea
                className="input__field"
                placeholder="Escribe una reseña sobre el freelancer..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                required
              />
            </div>

            <div className="input">
              <label className="input__label">Calificación</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      cursor: 'pointer',
                      color: star <= rating ? '#ffc107' : '#e4e5e9',
                      fontSize: '1.5rem'
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="modal__footer">
              <button className="button button--primary" type="submit">
                Pagar
              </button>
            </div>
          </form>
        </div>
      </div>
    </StyledModalWrapper>
  );
};

const StyledModalWrapper = styled.div`
  .button {
    appearance: none;
    font: inherit;
    border: none;
    background: none;
    cursor: pointer;
  }

  .button--primary {
    background-color: #007dab;
    color: #fff;
    padding: 0.75rem 1.5rem;
    border-radius: 0.25rem;
    font-weight: 700;
    transition: background-color 0.3s ease;
  }

  .button--primary:hover {
    background-color: #005f7f;
  }

  .modal {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 400px;
    background-color: #fff;
    box-shadow: 0 15px 30px rgba(0, 125, 171, 0.15);
    border-radius: 10px;
    transform: translateY(-20px);
    opacity: 0;
    animation: slideFadeIn 0.3s forwards;
  }

  @keyframes slideFadeIn {
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal__header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal__body {
    padding: 1rem 1.5rem;
  }

  .modal__footer {
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: flex-end;
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

  .input__label {
    font-weight: 700;
    font-size: 0.875rem;
  }

  .input__field {
    margin-top: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    padding: 0.75rem;
    font: inherit;
  }

  .input__field:focus {
    outline: none;
    border-color: #007dab;
    box-shadow: 0 0 0 1px #007dab, 0 0 0 4px rgba(0, 125, 171, 0.25);
  }
  
  .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.3);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
`;
