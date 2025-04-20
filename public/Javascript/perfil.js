document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/user")  // Asegúrate de que esta URL te devuelva los datos correctos
        .then(response => response.json())
        .then(data => {
            const campoNombre = document.getElementById("nombre-usuario");

        if (data.name) {
                const primerNombre = data.name.split(" ")[0];

                const nombreFormateado = primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase();

                campoNombre.textContent = nombreFormateado;
        

                // Mostrar datos en el perfil
                const nombreCompleto = data.name.trim().split(" ");
                const nombre = nombreCompleto[0];
                const apellidos = nombreCompleto.slice(1).join(" ");

                // Asignar los valores a los campos del perfil
                document.getElementById("nombre-usuario-perfil").value = nombre;  // Solo el nombre
                document.getElementById("apellidos-usuario").value = apellidos || "No disponible";  // Los apellidos

                // Asignar otros datos si están disponibles
                document.getElementById("fecha-usuario").value = data.birthDate || "No disponible";  // Fecha de nacimiento
                document.getElementById("ciudad-usuario").value = data.city || "No disponible";  // Ciudad
                document.getElementById("pais-usuario").value = data.country || "No disponible";  // País

                // Cambiar la foto de perfil si existe
                const profilePic = document.querySelector(".profile-pic");
                if (data.photo) {
                    profilePic.style.backgroundImage = `url(${data.photo})`;
                }
            } else {
                alert("No estás autenticado");
            }
        })
        .catch(error => {
            console.error("Error al obtener los datos del usuario:", error);
        });
});

$(document).ready(function () {
    // Efecto hover para mostrar/ocultar el menú de usuario
    $(".menu-usuario").hover(
        function () {
            $(this).find(".menu").stop(true, true).slideDown(200);
        },
        function () {
            $(this).find(".menu").stop(true, true).slideUp(200);
        }
    );

});
