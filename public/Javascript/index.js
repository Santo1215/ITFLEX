document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/user")
    .then(response => response.json())
    .then(data => {
        console.log(data); // Ver qué devuelve la API en la consola
        const nombreUsuario = document.getElementById("nombre-usuario");
        if (data.name) {
            nombreUsuario.textContent = data.name;
        } else {
            nombreUsuario.textContent = "Invitado";
        }
    })
    .catch(error => console.error("Error al obtener usuario:", error));
});