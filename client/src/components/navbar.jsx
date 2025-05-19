import React, { useState, useEffect } from 'react';
import '../assets/styles/Navbar.css';
import logo from '../assets/media/logo.png';

function Navbar() {
  const [nombreUsuario, setNombreUsuario] = useState('Cargando...');

  useEffect(() => {
    // Usa la URL de la API según entorno
    const API_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : 'https://pruebasitflex.onrender.com';

    fetch(`${API_URL}/api/user`, {
      method: 'GET',
      credentials: 'include',  // para enviar cookies/sesión
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
      console.log('Respuesta API /api/user:', data);
      if (data.name) {
        const primerNombre = data.name.split(' ')[0];
        const nombreFormateado = 
          primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase();
        setNombreUsuario(nombreFormateado);
      } else {
        setNombreUsuario('Invitado');
      }
    })
    .catch(error => {
      console.error('Error al obtener usuario:', error);
      setNombreUsuario('Invitado');
    });

  }, []);
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(prev => !prev);
  };

  // Opcional: cerrar menú si clickeas afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-usuario')) {
        setMenuVisible(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <a href="/Home" className="logo">
        <img src={logo} alt="ITFLEX" />
      </a>

      <div className="search-bar">
        <input type="text" placeholder="Buscar proyectos, freelancers ..." />
        <button>
          <img
            src="https://cdn-icons-png.flaticon.com/512/622/622669.png"
            alt="buscar"
            className="icono"
          />
        </button>
      </div>

      <div className="menu-usuario">
        <span>
        <img
          src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
          alt="perfil"
          className="icono"
        />
        Hola, <span id="nombre-usuario">{nombreUsuario}</span>
        </span>
        <div className="menu">
          <a href="/Perfil">
            <div className="menu-item">Ver perfil</div>
          </a>
          <a href="#">
            <div className="menu-item">Ver propuestas</div>
          </a>
          <a href="/Proyectos">
            <div className="menu-item">Mis proyectos</div>
          </a>
          <a href="/Chats">
            <div className="menu-item">Chats</div>
          </a>
        </div>
      </div>

      <a href='/Publicar'> <button className="btn-publicar">
        Publicar un proyecto
      </button></a>
      

      <a href="/logout">
        <button className="Btn-cerrarsesion">
          <div className="sign">
            <svg viewBox="0 0 512 512">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
            </svg>
          </div>
          <div className="text">Salir</div>
        </button>
      </a>
    </nav>
  );
}

export default Navbar;