import { useState } from 'react';
import styles from '../assets/styles/AuthModal.module.css';

function AuthModal({ isOpen, type, onClose }) {
    const backendUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://itflex.onrender.com';
        
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombres: '',
        apellidos: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica de autenticación aquí
        onClose();
    };

    return (
        <div className={styles.modal}>
        <div className={styles.modalContent}>
            <span className={styles.close} onClick={onClose}>&times;</span>
            <h2>{type === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</h2>
            
            <div className={styles.btnContainer}>
            <a href={`${backendUrl}/auth/google`} className={`${styles.btnAuth} ${styles.btnGoogle}`}>
                <img src="https://pipedream.com/s.v0/app_m02hPO/logo/orig" alt="Google" />
            </a>
            <a href="/auth/github" className={`${styles.btnAuth} ${styles.btnGithub}`}>
                <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" />
            </a>
            </div>
            <br />
            
            <form onSubmit={handleSubmit}>
            {type === 'register' && (   
                <>
                <label>Nombres</label>
                <input 
                    type="text" 
                    name="nombres"
                    placeholder="Ingrese sus nombres" 
                    value={formData.nombres}
                    onChange={handleChange}
                />
                <label>Apellidos</label>
                <input 
                    type="text" 
                    name="apellidos"
                    placeholder="Ingrese sus apellidos" 
                    value={formData.apellidos}
                    onChange={handleChange}
                />
                </>
            )}
            
            <label>Email</label>
            <input 
                type="email" 
                name="email"
                placeholder={type === 'login' ? "Ingrese su email" : "Ingrese su email"} 
                value={formData.email}
                onChange={handleChange}
            />
            
            <label>Contraseña</label>
            <input 
                type="password" 
                name="password"
                placeholder={type === 'login' ? "Ingrese la contraseña" : "Establezca una contraseña"} 
                value={formData.password}
                onChange={handleChange}
            />
            
            <button type="submit">
                {type === 'login' ? 'Ingresar' : 'Registrarse'}
            </button>
            </form>
        </div>
        </div>
    );
}

export default AuthModal;