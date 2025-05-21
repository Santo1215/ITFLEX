import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import HomePage from '../pages/HomePage';
import PublicarProyecto from '../pages/PublicarProyecto';
import MiPerfil from '../pages/PerfilPersonal';
import NotFound from '../pages/NotFound';
import MisProyectos from '../pages/MisProyectos';
import PerfilUsuario from "../pages/PerfilUsuario";
import VerPropuestas from '../pages/VerPropuestas';
import Chats from '../pages/Chats';

function AppRoutes({ activeModal, onOpenModal, onCloseModal }) {
    // Aquí puedes definir las rutas de tu aplicación
    return (
        <Routes>
        <Route path="/" element={<LandingPage activeModal={activeModal} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />} />
        <Route path="/Home" element={<HomePage />} />
        <Route path="/Publicar" element={<PublicarProyecto />} />
        <Route path="/MisProyectos" element={<MisProyectos />} />
        <Route path="/VerPropuestas" element={<VerPropuestas />} />
        <Route path="/MiPerfil" element={<MiPerfil />} />
        <Route path="/Perfil/:id" element={<PerfilUsuario />} />
        <Route path="/Chats/:id" element={<Chats />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoutes;
