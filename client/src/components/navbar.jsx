import { useState } from 'react';
import './styles/Navbar.css';

function Navbar({ userName, onAddProject }) {
    const [showMenu, setShowMenu] = useState(false);
    
    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };
    
    const closeMenu = () => {
        setShowMenu(false);
    };

    return (
        <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
            {/* Logo */}
            <a className="navbar-brand d-flex logo" href="/">
            <img src="/media/logo.png" alt="ITFLEX" />
            </a>
            
            {/* Barra de búsqueda */}
            <form className="d-flex mx-auto search-bar">
            <input 
                className="form-control custom-input" 
                type="text" 
                placeholder="Buscar proyectos, freelancers ..." 
            />
            <button type="button">
                <img 
                src="https://cdn-icons-png.flaticon.com/512/622/622669.png" 
                alt="buscar" 
                className="icono" 
                />
            </button>
            </form>
            
            {/* Menú de usuario + acciones */}
            <ul className="navbar-nav ms-auto align-items-center">
            {/* Usuario */}
            <li 
                className="nav-item dropdown menu-usuario"
                onMouseEnter={toggleMenu}
                onMouseLeave={closeMenu}
            >
                <a 
                className="nav-link dropdown-toggle d-flex align-items-center" 
                href="#" 
                role="button"
                >
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" 
                    alt="perfil" 
                    className="icono me-1" 
                />
                <span>Hola, {userName}</span>
                </a>
                {showMenu && (
                <ul className="dropdown-menu dropdown-menu-end menu show">
                    <li>
                    <a className="dropdown-item menu-item" href="/perfil">
                        Ver perfil
                    </a>
                    </li>
                    <li>
                    <a className="dropdown-item menu-item" href="/propuestas">
                        Ver propuestas
                    </a>
                    </li>
                    <li>
                    <a className="dropdown-item menu-item" href="/proyectos">
                        Mis proyectos
                    </a>
                    </li>
                    <li>
                    <a className="dropdown-item menu-item" href="/chats">
                        Chats
                    </a>
                    </li>
                </ul>
                )}
            </li>
            
            {/* Botón publicar */}
            <li className="nav-item mx-2">
                <button className="btn-publicar" onClick={onAddProject}>
                Publicar un proyecto
                </button>
            </li>
            
            {/* Botón salir */}
            <li className="nav-item">
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
            </li>
            </ul>                       
        </div>
        </nav>
    );
}

export default Navbar;