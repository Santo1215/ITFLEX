import { useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import './assets/styles/App.css';

function App() {
    const [activeModal, setActiveModal] = useState(null);

    const openModal = (modalType) => {
    setActiveModal(modalType);
};

const closeModal = () => {
    setActiveModal(null);
};

return (
    <div className="app">
        <Header onOpenModal={openModal} />
        <main>
            <HeroSection />
            <FeaturesSection />
        </main>
        <Footer />
        <AuthModal 
            isOpen={activeModal !== null} 
            type={activeModal} 
            onClose={closeModal} 
        />
    </div>
    );
}

export default App;