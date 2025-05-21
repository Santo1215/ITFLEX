import styles from '../assets/styles/HeroSection.module.css';
import video from '../assets/media/video-presentacion.mp4';

function HeroSection() {
    return (
        <div className={styles.container}>
        <div className={styles.videoSection}>
            <video autoPlay loop muted playsInline>
            <source src={video} type="video/mp4" />
            </video>
        </div>
        <div className={styles.textSection}>
            <h1>Bienvenido a ITFLEX</h1>
            <p>La plataforma ideal para conectar empresas con los mejores talentos.</p>
            <p>Ya sea que necesites un desarrollador de software, un experto en ciberseguridad o un ingeniero en redes, aquí encontrarás profesionales altamente calificados.</p>
            <div className={styles.buttons}>
            <button className={styles.primaryBtn}>Sé un freelancer</button>
            <button className={styles.secondaryBtn}>Contrata un freelancer</button>
            </div>
        </div>
        </div>
    );
}

export default HeroSection;