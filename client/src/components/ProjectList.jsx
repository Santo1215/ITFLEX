import './ProjectList.css';

function ProjectList({ projects, selectedProjectId, onSelectProject, onRemoveProject }) {
    return (
        <div className="project-list">
        {projects.map(project => (
            <div 
            key={project.id} 
            className={`project-card ${selectedProjectId === project.id ? 'selected' : ''}`}
            onClick={() => onSelectProject(project)}
            >
            <button 
                className="btn-ocultar"
                onClick={(e) => {
                e.stopPropagation(); // Evitar que se seleccione el proyecto al hacer clic en el botón cerrar
                onRemoveProject(project.id);
                }}
            >
                <img src="/media/x-cerrar.png" alt="cerrar" className="icono" />
            </button>
            
            <h3>{project.title}</h3>
            <p>{project.freelancer} ⭐{project.rating}</p>
            <p>{project.location}</p>
            <p>{project.price}</p>
            <p>({project.timeAgo})</p>
            </div>
        ))}
        
        {projects.length === 0 && (
            <div className="no-projects">
            <p>No hay proyectos disponibles</p>
            <p>¡Publica un nuevo proyecto!</p>
            </div>
        )}
        </div>
    );
}

export default ProjectList;