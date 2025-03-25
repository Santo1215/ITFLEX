function abrirModal(id) {
    let modal = document.getElementById(id);
    if (modal) {
        modal.style.display = "flex";
    }
}

function cerrarModal(id) {
    let modal = document.getElementById(id);
    if (modal) {
        modal.style.display = "none";
    }
}

// Cerrar modal si el usuario hace clic fuera del contenido
window.onclick = function(event) {
    let modales = document.getElementsByClassName("modal");
    for (let i = 0; i < modales.length; i++) {
        if (event.target === modales[i]) {
            modales[i].style.display = "none";
        }
    }
};