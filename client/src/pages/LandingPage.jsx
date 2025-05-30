import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';

function LandingPage({ activeModal, onOpenModal, onCloseModal }) {
    return (
        <div className="app">
        <Header onOpenModal={onOpenModal} />
        <main>
            <HeroSection />
            <FeaturesSection />
        </main>
        <Footer />
        <AuthModal 
            isOpen={activeModal !== null} 
            type={activeModal} 
            onClose={onCloseModal} 
        />
        </div>
    );
    }

export default LandingPage;
