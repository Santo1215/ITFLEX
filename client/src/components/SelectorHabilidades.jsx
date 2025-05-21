import React, { useState } from "react";

function SelectorHabilidades({ listaHabilidades, habilidadesSeleccionadas = [], onCambiarHabilidades }) {
  const [mostrarSelect, setMostrarSelect] = useState(false);

  const seleccionadas = habilidadesSeleccionadas || [];

  const opcionesDisponibles = listaHabilidades.filter(
    (hab) => !seleccionadas.includes(hab.id)
  );

  const handleMostrarSelect = () => {
    setMostrarSelect(true);
  };

  const handleSeleccion = (e) => {
    const idSeleccionado = Number(e.target.value);
    if (!idSeleccionado) return;

    onCambiarHabilidades([...seleccionadas, idSeleccionado]);
    setMostrarSelect(false);
  };

  const handleQuitar = (id) => {
    const nuevas = seleccionadas.filter((hid) => hid !== id);
    onCambiarHabilidades(nuevas);
  };

  return (
    <div>
      <div>
        {seleccionadas.length > 0 ? (
          seleccionadas.map((id) => {
            const hab = listaHabilidades.find((h) => h.id === id);
            if (!hab) return null;
            return (
              <span key={id} style={{ marginRight: "8px" }}>
                {hab.name}{" "}
                <button onClick={() => handleQuitar(id)} style={{ cursor: "pointer" }}>
                  X
                </button>
              </span>
            );
          })
        ) : (
          <p>No hay habilidades añadidas.</p>
        )}
      </div>

      <div style={{ marginTop: "8px" }}>
        {mostrarSelect ? (
          <select onChange={handleSeleccion} defaultValue="">
            <option value="" disabled>
              Selecciona una habilidad
            </option>
            <optgroup label="Habilidades disponibles">
              {opcionesDisponibles.map((hab) => (
                <option key={hab.id} value={hab.id}>
                  {hab.name}
                </option>
              ))}
            </optgroup>
          </select>
        ) : (
          <button onClick={handleMostrarSelect} disabled={opcionesDisponibles.length === 0}>
            Añadir habilidad
          </button>
        )}

        {opcionesDisponibles.length === 0 && <p>No quedan habilidades para añadir.</p>}
      </div>
    </div>
  );
}


export default SelectorHabilidades;