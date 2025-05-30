import styles from '../assets/styles/Header.module.css';
import logo from '../assets/media/logo.png'

function Header({ onOpenModal }) {
    return (    
    <header className={styles.header}>
        <div className={styles.logo}>
            <img src={logo} alt="ITFLEX" />
        </div>
    <nav>
        <a href="#" onClick={() => onOpenModal('login')}>Iniciar sesión</a>
        <a href="#" onClick={() => onOpenModal('register')}>Registrarse</a>
        <button className={styles.btnPublicar}>Publicar un proyecto</button>
    </nav>
    </header>
    );
}

export default Header;