import React, { useState } from 'react';
import Navbar from '../components/navbar';
import MisProyectosListado from '../components/MisProyectos';
import MisTrabajos from '../components/MisTrabajos';
import SelectorOpciones from '../components/SelectorOpciones';

function MisProyectos() {
  const [opcion, setOpcion] = useState('proyectos');

  const opciones = [
    { valor: 'proyectos', texto: 'Mis Proyectos' },
    { valor: 'trabajos', texto: 'Trabajos' }
  ];

  return (
    <div>
      <Navbar />
      <SelectorOpciones
        opciones={opciones}
        opcionSeleccionada={opcion}
        onChange={setOpcion}
      />
      <div style={{ marginTop: '20px' }}>
        {opcion === 'proyectos' && <MisProyectosListado />}
        {opcion === 'trabajos' && <MisTrabajos />}
      </div>
    </div>
  );
}

export default MisProyectos;
