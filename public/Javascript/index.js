document.addEventListener("DOMContentLoaded", () => {
    fetch("https://itflex.onrender.com/api/user")
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

$(document).ready(function () {
    function actualizarCantidadProyectos() {
        let totalProyectos = $(".project-card").length;
        $("#cantidad-proyectos").text(`Total de proyectos: ${totalProyectos}`);
    }

    // Efecto hover para mostrar/ocultar el menú de usuario
    $(".menu-usuario").hover(
        function () {
            $(this).find(".menu").stop(true, true).slideDown(200);
        },
        function () {
            $(this).find(".menu").stop(true, true).slideUp(200);
        }
    );

    // Delegación de eventos para ocultar proyectos (funciona en nuevos y existentes)
    $(document).on("click", ".btn-ocultar", function (event) {
        event.preventDefault();
        $(this).closest(".project-card").fadeOut(300, function () {
            $(this).remove();
            actualizarCantidadProyectos();
        });
    });

    $(document).on("click", ".project-card", function () {
        $(".project-card").removeClass("selected"); // Quita la selección de los demás
        $(this).addClass("selected"); // Agrega la selección solo a este
    });

    // Función para agregar un nuevo post
    function agregarTrabajo() {
        let nuevoPost = `
            <div class="project-card">
                <a href="#" class="btn-ocultar">
                    <img src="/media/x-cerrar.png" alt="editar" class="icono">
                </a>
                <h3>Nuevo Proyecto</h3>
                <p>Usuario Anónimo ⭐5.0</p>
                <p>Ubicación no especificada</p>
                <p>$500.000</p>
                <p>(Hace unos segundos)</p>
            </div>
        `;
        $(".project-list").prepend(nuevoPost);
        actualizarCantidadProyectos();
    }

    // Evento para publicar un proyecto
    $(".post-project").click(function () {
        agregarTrabajo();
    });

    actualizarCantidadProyectos(); // Inicializa el contador

});



