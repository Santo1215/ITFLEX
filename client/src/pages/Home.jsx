import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import Footer from './components/Footer';
import './HomePage.css';

function HomePage() {
    const [projects, setProjects] = useState([
        {
        id: 1,
        title: "Creación de página web",
        freelancer: "Duván Yahir Sanabria Echeverry",
        rating: 4.2,
        location: "Bucaramanga, Santander",
        price: "$1'500.000",
        timeAgo: "Hace 1 min",
        description: "Realizar un segundo entregable (1B Parte 2) con el listado de funcionalidades esperadas del producto software...",
        comments: [
            { author: "Thomás Alejandro Peréz Rojas", rating: 4.4 },
            { author: "Esteban Alberto Suárez Díaz", rating: 4.0 }
        ]
        },
        {
        id: 2,
        title: "Mantenimiento a un servidor DNS",
        freelancer: "Jorge Leonardo Vargas Mayorga",
        rating: 3.5,
        location: "Bucaramanga, Santander",
        price: "$850.000",
        timeAgo: "Hace 2 h",
        description: "Se requiere mantenimiento a servidor DNS para mejorar rendimiento y seguridad...",
        comments: []
        },
        {
        id: 3,
        title: "Gestión de una base de datos",
        freelancer: "Eliana Martha Bonalde Marcano",
        rating: 4.5,
        location: "Bucaramanga, Santander",
        price: "$1'000.000",
        timeAgo: "Hace 3 sem",
        description: "Necesito optimizar consultas y la estructura de una base de datos PostgreSQL...",
        comments: []
        }
    ]);

    const [selectedProject, setSelectedProject] = useState(null);
    const [userName, setUserName] = useState("Cargando...");

    useEffect(() => {
        // Simular la obtención de datos del usuario
        const fetchUserData = async () => {
        try {
            // En una implementación real, esto sería una llamada a una API
            // const response = await fetch("/api/user");
            // const data = await response.json();
            
            // Por ahora simulamos una respuesta
            const data = { name: "María González" };
            
            if (data.name) {
            const firstName = data.name.split(" ")[0];
            const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
            setUserName(formattedName);
            } else {
            setUserName("Invitado");
            }
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            setUserName("Invitado");
        }
        };

        fetchUserData();
        
        // Seleccionar el primer proyecto por defecto
        if (projects.length > 0 && !selectedProject) {
        setSelectedProject(projects[0]);
        }
    }, [projects, selectedProject]);

    const handleSelectProject = (project) => {
        setSelectedProject(project);
    };

    const handleRemoveProject = (projectId) => {
        setProjects(projects.filter(project => project.id !== projectId));
        
        // Si se eliminó el proyecto seleccionado, seleccionar otro
        if (selectedProject && selectedProject.id === projectId) {
        const remainingProjects = projects.filter(project => project.id !== projectId);
        setSelectedProject(remainingProjects.length > 0 ? remainingProjects[0] : null);
        }
    };

    const handleAddProject = () => {
        const newProject = {
        id: Date.now(), // ID único basado en timestamp
        title: "Nuevo Proyecto",
        freelancer: "Usuario Anónimo",
        rating: 5.0,
        location: "Ubicación no especificada",
        price: "$500.000",
        timeAgo: "Hace unos segundos",
        description: "Descripción del nuevo proyecto...",
        comments: []
        };
        
        setProjects([newProject, ...projects]);
    };

    return (
        <div className="home-page">
        <Navbar userName={userName} onAddProject={handleAddProject} />
        
        <div className="container mt-4">
            <p className="total-proyectos">Total de proyectos: {projects.length}</p>
            
            <div className="row">
            <div className="col-md-3">
                <ProjectList 
                projects={projects} 
                selectedProjectId={selectedProject?.id}
                onSelectProject={handleSelectProject} 
                onRemoveProject={handleRemoveProject} 
                />
            </div>
            
            <div className="col-md-8">
                {selectedProject ? (
                <ProjectDetails project={selectedProject} />
                ) : (
                <div className="project-details">
                    <h3>Selecciona un proyecto para ver detalles</h3>
                </div>
                )}
            </div>
            </div>
        </div>
        
        <Footer />
        </div>
    );
}

export default HomePage;