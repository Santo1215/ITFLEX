import React, { useState, useEffect, useRef } from 'react';
import '../assets/styles/Navbar.css';
import logo from '../assets/media/logo.png';
import { Link } from 'react-router-dom';
import { BotonGuardar,BotonCancelar } from './BotonGuardar';
import SelectorOpciones from './SelectorOpciones';
import { ModalPago } from './FormularioPostular';

function ModalBalance({ balance, onClose, onActualizarBalance }) {
    const [modalPagoOpen, setModalPagoOpen] = useState(false);
    const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://pruebasitflex.onrender.com';

  const [monto, setMonto] = useState('');
  const [tipoOperacion, setTipoOperacion] = useState('deposito');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const handleConfirmarClick = (e) => {
    e.preventDefault();
    manejarSubmit(e);
  };

  const manejarSubmit = async (e) => {
  e.preventDefault();
  setError(null);

  const montoNum = parseFloat(monto);
  if (isNaN(montoNum) || montoNum <= 0) {
    setError('Ingrese un monto válido mayor que 0');
    return;
  }

  setCargando(true);

  try {
    // Si es retiro, enviamos monto negativo
    const montoEnviar = tipoOperacion === 'deposito' ? montoNum : -montoNum;

    // Llamada al backend
    const respuesta = await fetch(`${API_URL}/api/balance/actualizar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ monto: montoEnviar }),
      credentials: 'include' // si usas cookies para auth
    });

    if (!respuesta.ok) {
      const errorData = await respuesta.json();
      throw new Error(errorData.error || 'Error actualizando balance');
    }

    const data = await respuesta.json();
    onActualizarBalance(data.balance); // actualiza balance en frontend con el nuevo valor
    onClose();
  } catch (err) {
    setError(err.message || 'Error al actualizar el balance');
  } finally {
    setCargando(false);
  }
};

  const opcionesOperacion = [
    { valor: 'deposito', texto: 'Depositar' },
    { valor: 'retiro', texto: 'Retirar' }
  ];

  return (
    <div className="modal-fondo" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 9999,
    }}>
      <div className="modal-contenido">
        <h2>Actualizar Balance</h2>
        <SelectorOpciones opciones={opcionesOperacion} opcionSeleccionada={tipoOperacion} onChange={(valor) => setTipoOperacion(valor)}/>
        <form onSubmit={manejarSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Monto:
              <input
                type="number"
                step="0.01"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                disabled={cargando}
                min="0.01"
              />
            </label>
          </div>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <ModalPago/>
            <BotonCancelar className="pequeno" texto="Cancelar" onClick={onClose} disabled={cargando}/>
            <BotonGuardar tamaño="pequeño" texto={cargando ? 'Procesando...' : 'Confirmar'} onClick={handleConfirmarClick} disabled={cargando}/>
          </div>
        </form>
      </div>
    </div>
  );
}

function Navbar() {
  const [nombreUsuario, setNombreUsuario] = useState('Cargando...');
  const [balance, setBalance] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const debounceTimeout = useRef(null);
  const [modalBalanceVisible, setModalBalanceVisible] = useState(false);
  const [tipoOperacion, setTipoOperacion] = useState('deposito');
  const [cargando, setCargando] = useState(false);

  
  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://pruebasitflex.onrender.com';

  // Obtener usuario y balance
  useEffect(() => {
    fetch(`${API_URL}/api/user`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      return response.json();
    })
    .then(data => {
      if (data.name) {
        const primerNombre = data.name.split(' ')[0];
        const nombreFormateado = 
          primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase();
        setNombreUsuario(nombreFormateado);
      } else {
        setNombreUsuario('Invitado');
      }
      setUsuarioActual(data);

      // Si tenemos user id, obtener balance
      if (data.id) {
        fetch(`${API_URL}/api/balance/usuario/${data.id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        })
        .then(res => {
          if (!res.ok) throw new Error('Error al obtener balance');
          return res.json();
        })
        .then(balanceData => {
          if (balanceData.balance !== undefined) {
            setBalance(balanceData.balance);
          } else {
            setBalance(0);
          }
        })
        .catch(err => {
          console.error("Error al obtener balance:", err);
          setBalance(0);
        });
      }
    })
    .catch(() => {
      setNombreUsuario('Invitado');
      setBalance(0);
    });
  }, [API_URL]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-usuario')) {
        setMenuVisible(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMenu = () => setMenuVisible(prev => !prev);

  // Nueva función que hace la búsqueda con debounce
  const handleChangeBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);

    // Si hay un timeout pendiente, lo limpiamos
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Solo buscamos si hay texto (evita búsquedas vacías)
    if (valor.trim().length > 0) {
      debounceTimeout.current = setTimeout(() => {
        hacerBusqueda(valor);
      }, 300); // 300 ms de espera antes de buscar
    } else {
      setResultados([]);
      setMostrarDropdown(false);
    }
  };

  const hacerBusqueda = async (query) => {
    try {
      const response = await fetch(`${API_URL}/api/buscar?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Error en la búsqueda');
      const data = await response.json();

      setResultados(data);
      setMostrarDropdown(true);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setResultados([]);
      setMostrarDropdown(false);
    }
  };

  // Función para buscar al presionar Enter o al hacer click (opcional)
  const handleBuscar = () => {
    if (busqueda.trim().length > 0) {
      hacerBusqueda(busqueda);
    }
  };

  return (
    <nav className="navbar">
      <a href="/Home" className="logo">
        <img src={logo} alt="ITFLEX" />
      </a>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar proyectos, freelancers ..."
          value={busqueda}
          onChange={handleChangeBusqueda}
          onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
        />
        <button onClick={handleBuscar}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/622/622669.png"
            alt="buscar"
            className="icono"
          />
        </button>

        {mostrarDropdown && resultados.length > 0 && (
          <div className="dropdown-resultados">
            {resultados.map((item, index) => (
              <div key={index} className="dropdown-item">
                <strong>{item.tipo.toUpperCase()}</strong>:{' '}
                {item.tipo === 'usuario' ? (<Link className="usuario" to={ 
                  usuarioActual && String(usuarioActual.id) === String(item.id)? "/MiPerfil": `/perfil/${item.id}`}>
                  {item.nombre}</Link>) : (item.nombre)}


                {item.tipo === 'usuario' && item.habilidades && item.habilidades.length > 0 && (
                  <div className="extra-info">
                    Habilidades: {item.habilidades}
                  </div>
                )}

                {item.extra_info && item.tipo !== 'usuario' && (
                  <div className="extra-info">{item.extra_info}</div>
                )}
              </div>
            ))}
          </div>
        )}

</div>

      <div className="menu-usuario">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '8px' }}>
          <span>
            <img
              src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
              alt="perfil"
              className="icono"
              style={{ verticalAlign: 'middle', marginRight: '6px' }}
            />
            Hola, <span id="nombre-usuario">{nombreUsuario}</span>
          </span>
          {balance !== null && (
            <span
              className="balance-usuario"
              style={{ cursor: 'pointer' }}
              onClick={() => setModalBalanceVisible(true)}
              title="Haz clic para actualizar tu balance"
            >
              Balance: ${Number(balance).toFixed(2)}
            </span>
          )}
        </div>
        <div className="menu">
          <a href="/MiPerfil">
            <div className="menu-item">Ver perfil</div>
          </a>
          <a href="/VerPropuestas">
            <div className="menu-item">Ver propuestas</div>
          </a>
          <a href="/MisProyectos">
            <div className="menu-item">Mis proyectos</div>
          </a>
          {usuarioActual && usuarioActual.id ? (
              <Link to={`/Chats/${usuarioActual.id}`}>
                <div className="menu-item">Chats</div>
              </Link>
            ) : (
              <div className="menu-item">Chats</div>
            )}
        </div>
      </div>

      <a href='/Publicar'> <button className="btn-publicar">
        Publicar un proyecto
      </button></a>
      

      <a href="/">
        <button className="Btn-cerrarsesion">
          <div className="sign">
            <svg viewBox="0 0 512 512">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
            </svg>
          </div>
          <div className="text">Salir</div>
        </button>
      </a>

      {modalBalanceVisible && (
        <ModalBalance balance={balance} onClose={() => setModalBalanceVisible(false)} onActualizarBalance={(nuevoBalance) => setBalance(nuevoBalance)}/>
      )}

    </nav>
  );
}

export default Navbar;