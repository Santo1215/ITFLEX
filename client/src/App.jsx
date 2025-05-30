import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './assets/styles/App.css';

function App() {
    const [activeModal, setActiveModal] = useState(null);

    const openModal = (modalType) => setActiveModal(modalType);
    const closeModal = () => setActiveModal(null);

    return (
        <Router>
            <AppRoutes
                activeModal={activeModal}
                onOpenModal={openModal}
                onCloseModal={closeModal}
            />
        </Router>
    );
}

export default App;
