import styles from '../assets/styles/Footer.module.css';

function Footer() {
    return (
        <footer className={styles.footer}>
        <div className={styles.footerContent}>
            <div className={styles.logoSection}>
            <p>Conectando talento con oportunidades</p>
            </div>
            
            <nav className={styles.navLinks}>
            <div className={styles.linkGroup}>
                <h3>Freelancers</h3>
                <a href="#">Buscar trabajo</a>
                <a href="#">Crear perfil</a>
                <a href="#">Cómo funciona</a>
            </div>
            
            <div className={styles.linkGroup}>
                <h3>Empresas</h3>
                <a href="#">Publicar proyecto</a>
                <a href="#">Encontrar talento</a>
                <a href="#">Solución empresarial</a>
            </div>
            
            <div className={styles.linkGroup}>
                <h3>Soporte</h3>
                <a href="#">Centro de ayuda</a>
                <a href="#">Contáctanos</a>
                <a href="#">Términos y condiciones</a>
            </div>
            </nav>
        </div>
        
        <div className={styles.copyright}>
            <p>© {new Date().getFullYear()} ITFLEX. Todos los derechos reservados.</p>
        </div>
        </footer>
    );
}

export default Footer;