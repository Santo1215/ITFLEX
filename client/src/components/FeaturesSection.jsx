import styles from '../assets/styles/FeaturesSection.module.css';

function FeaturesSection() {
    return (
        <div className={styles.container}>
        <div className={styles.textSection}>
            <h1>Contrata a los mejores</h1>
            <p>Explora una amplia variedad de profesionales confiables examinando sus portafolios detallados y conociendo su experiencia a través de los comentarios y valoraciones compartidas en sus perfiles.</p>
            <p>De esta manera, podrás tomar decisiones informadas al elegir el experto que mejor se adapte a tus necesidades.</p>
            <button 
            className={styles.ctaButton}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
            Ver freelancers disponibles
            </button>
        </div>
        <div className={styles.imageSection}>
            <img 
            src="https://plus.unsplash.com/premium_photo-1661400100934-1ba03c96cc14?fm=jpg&q=60&w=3000" 
            alt="Oficina con personas trabajando" 
            loading="lazy"
            />
        </div>
        </div>
    );
}

export default FeaturesSection;