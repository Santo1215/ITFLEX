import './styles/ProjectDetails.css';

function ProjectDetails({ project }) {
    return (
        <div className="project-details">
        <h2>{project.title}</h2>
        <p>{project.freelancer} ⭐{project.rating}</p>
        <p>{project.location}</p>
        <p>{project.price}</p>
        
        <button className="btn btn-primary mb-3">Postularme</button>
        
        <p className="project-description">{project.description}</p>
        
        <h3>Comentarios</h3>
        {project.comments && project.comments.length > 0 ? (
            project.comments.map((comment, index) => (
            <p key={index}>✔ {comment.author} - Calificó con ⭐{comment.rating}</p>
            ))
        ) : (
            <p className="no-comments">No hay comentarios para este proyecto</p>
        )}
        </div>
    );
}

export default ProjectDetails;