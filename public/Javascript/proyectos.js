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
        $("#cantidad-proyectos").text(`Proyectos activos: ${totalProyectos}`);
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
                    <a href="#" class="btn-ocultar"><img src="/media/x-cerrar.png" alt="editar" class="icono"></a>
                </a>
                <h3>Nuevo Proyecto</h3>
                <p>Bucaramanga, Santander</p>
                <p>$500.000</p>
                <p>(Hace unos segundos)</p>
            </div>
        `;
        $(".project-list").prepend(nuevoPost);
        actualizarCantidadProyectos();
    }

    // Evento para publicar un proyecto
    $(".btn-publicar").click(function () {
        agregarTrabajo();
    });

    actualizarCantidadProyectos(); // Inicializa el contador

});

$(document).ready(function () {
    // Mostrar/ocultar postulantes
    $("#btn-ver-postulantes").click(function () {
        $("#postulantes").slideToggle(300);
    });


    // Función para mostrar/ocultar los filtros
    document.getElementById("filtros-toggle").addEventListener("change", function() {
        // Si el checkbox está marcado, mostramos los filtros
        if (this.checked) {
            // Mostrar las especialidades con efecto de deslizamiento
            $('#filtros-container').stop(true, true).slideDown(300); // SlideDown con animación
        } else {
            // Ocultar las especialidades con efecto de deslizamiento
            $('#filtros-container').stop(true, true).slideUp(300); // SlideUp con animación
        }

        // Función para mostrar u ocultar especialidades
        $('#mostrar-especialidades').change(function() {
            if (this.checked) {
                // Mostrar las especialidades con efecto de deslizamiento
                $('#especialidades').stop(true, true).slideDown(300); // SlideDown con animación
            } else {
                // Ocultar las especialidades con efecto de deslizamiento
                $('#especialidades').stop(true, true).slideUp(300); // SlideUp con animación
            }
        });
    });

    // Resto del código para los filtros, sin cambios
    const buscarInput = document.getElementById("buscar-postulante");
    const ordenarSelect = document.getElementById("ordenar-postulantes");
    const calificacionMinInput = document.getElementById("calificacion-minima");
    const calificacionMaxInput = document.getElementById("calificacion-maxima");
    const especialidadCheckboxes = document.querySelectorAll(".especialidad");
    const listaPostulantes = document.getElementById("lista-postulantes");

    function filtrarPostulantes() {
        const textoFiltro = buscarInput.value.toLowerCase();
        const calificacionMinima = parseFloat(calificacionMinInput.value) || 0;
        const calificacionMaxima = parseFloat(calificacionMaxInput.value) || 5;
        const especialidadesSeleccionadas = Array.from(especialidadCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        const postulantes = listaPostulantes.querySelectorAll(".postulante");

        postulantes.forEach(postulante => {
            const nombre = postulante.textContent.toLowerCase();
            const calificacion = parseFloat(postulante.getAttribute("data-calificacion"));
            const especialidades = postulante.getAttribute("data-especialidades").split(", ");

            const coincideTexto = nombre.includes(textoFiltro);
            const coincideCalificacion = calificacion >= calificacionMinima && calificacion <= calificacionMaxima;
            const coincideEspecialidad = especialidadesSeleccionadas.length === 0 || especialidadesSeleccionadas.some(especialidad => especialidades.includes(especialidad));

            postulante.style.display = (coincideTexto && coincideCalificacion && coincideEspecialidad) ? "block" : "none";
        });
    }

    // Evento de búsqueda
    buscarInput.addEventListener("input", filtrarPostulantes);

    // Evento de filtro por calificación
    calificacionMinInput.addEventListener("input", filtrarPostulantes);
    calificacionMaxInput.addEventListener("input", filtrarPostulantes);

    // Evento de filtro por especialidades
    especialidadCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", filtrarPostulantes);
    });

    // Ordenar postulantes por calificación
    ordenarSelect.addEventListener("change", function () {
        let postulantes = Array.from(listaPostulantes.children);
        const orden = ordenarSelect.value;

        if (orden !== "default") {
            postulantes.sort((a, b) => {
                const calificacionA = parseFloat(a.getAttribute("data-calificacion"));
                const calificacionB = parseFloat(b.getAttribute("data-calificacion"));

                return orden === "asc" ? calificacionA - calificacionB : calificacionB - calificacionA;
            });

            listaPostulantes.innerHTML = "";
            postulantes.forEach(postulante => listaPostulantes.appendChild(postulante));
        }
    });
});

