document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/user")
    .then(response => response.json())
    .then(data => {
        const campoNombre = document.getElementById("nombre-usuario");

        if (data.name) {
            const primerNombre = data.name.split(" ")[0];

            const nombreFormateado = primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase();

            campoNombre.textContent = nombreFormateado;
        } else {
            campoNombre.textContent = "Invitado";
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
        $(".project-card").removeClass("selected");
        $(this).addClass("selected");
    
        const titulo = $(this).data("titulo");
        const usuario = $(this).data("usuario");
        const ubicacion = $(this).data("ubicacion");
        const precio = $(this).data("precio");
        const descripcion = $(this).data("descripcion");
        const comentarios = $(this).data("comentarios");
    
        const detalles = `
            <h2>${titulo}</h2>
            <p>${usuario}</p>
            <p>${ubicacion}</p>
            <p>${precio}</p>
            <button id="btnPostular" class="btn-postular">
                    <span class="transition"></span>
                    <span class="gradient"></span>
                    <span class="label">Postularme</span>
                  </button>
            <p>${descripcion}</p>
            <h3>Comentarios</h3>
            <p>${comentarios}</p>
        `;
    
        $(".project-details").html(detalles);
    });
    // Función para agregar un nuevo post
    let contadorProyectos = $(".project-card").length;
    function agregarTrabajo() {
        contadorProyectos++;
    
        let nuevoPost = `
            <div class="project-card" data-titulo="Proyecto ${contadorProyectos}" data-usuario="Usuario Anónimo ⭐5.0" data-ubicacion="Bucaramanga, Santander" data-precio="$500.000" data-descripcion="Descripción del proyecto" data-comentarios='✔ Usuario - Calificó con ⭐0.0'>
                <a href="#" class="btn-ocultar"><img src="/media/x-cerrar.png" alt="cerrar" class="icono"></a>
                <h3>Proyecto ${contadorProyectos}</h3>
                <p>Usuario Anónimo ⭐5.0</p>
                <p>Ubicación no especificada</p>
                <p>$500.000</p>
                <p>(Hace unos segundos)</p>
            </div>
        `;
    
        $(".project-list").prepend(nuevoPost);
        actualizarCantidadProyectos();
    }

    $(document).on('click', '#btnPostular', function () {
        const label = $(this).find('.label');
        label.text("Postulado");
        $(this).addClass('postulado');
        $(this).prop('disabled', true);
    });

    // Evento para publicar un proyecto
    $(".btn-publicar").click(function () {
        agregarTrabajo();
    });

    actualizarCantidadProyectos(); // Inicializa el contador

});



