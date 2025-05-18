import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import HomePage from '../pages/HomePage';
import PublicarProyecto from '../pages/PublicarProyecto';
import NotFound from '../pages/NotFound';

function AppRoutes({ activeModal, onOpenModal, onCloseModal }) {
    // Aquí puedes definir las rutas de tu aplicació
    return (
        <Routes>
        <Route path="/" element={<LandingPage activeModal={activeModal} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />} />
        <Route path="/Home" element={<HomePage />} />
        <Route path="/Publicar" element={<PublicarProyecto />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoutes;
