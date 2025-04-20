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

    $(document).on("click", ".project-card", function () {
        $(".project-card").removeClass("selected");
        $(this).addClass("selected");
    
        const titulo = $(this).data("titulo");
        const ubicacion = $(this).data("ubicacion");
        const precio = $(this).data("precio");
        const descripcion = $(this).data("descripcion");
        const comentarios = $(this).data("comentarios");
    
        const detalles = `
            <h2>${titulo}</h2>
            <p>${ubicacion}</p>
            <p>${precio}</p>
            <p>${descripcion}</p>
            <!-- Botón para ver postulantes -->
                <button id="btn-ver-postulantes" class="btn">Ver Postulantes</button>

                <!-- Contenedor de postulantes (oculto por defecto) -->
                <div class="contenedor-postulantes" id="postulantes">
                        <!-- Sección de filtros -->
                    <!-- Filtro de mostrar/ocultar -->
                    <div class="mostrar-filtros">
                        <label class="label-filtro"for="filtros-toggle">
                        <input class="btn-filtro"type="checkbox" id="filtros-toggle">
                        </label>
                    </div>

                    <!-- Contenedor de filtros (ocultos por defecto) -->
                    <div class="filtros" id="filtros-container">
                        <input type="text" id="buscar-postulante" placeholder="Buscar postulante...">
                        <select id="ordenar-postulantes">
                            <option value="default">Ordenar por</option>
                            <option value="asc">Calificación: Menor a Mayor</option>
                            <option value="desc">Calificación: Mayor a Menor</option>
                        </select>
                        
                        <!-- Filtro de calificación -->
                        <div class="filtro-rango">
                            <label>Calificación:</label>
                            <input type="number" id="calificacion-minima" min="0" max="5" step="0.1" placeholder="Min">
                            <input type="number" id="calificacion-maxima" min="0" max="5" step="0.1" placeholder="Max">
                        </div>

                         <!-- Filtro de especialidades -->
                        <div class="checkBox-texto">
                        <label>Especialidades<label class="checkBox" for="mostrar-especialidades"><input type="checkbox" id="mostrar-especialidades"/><div class="transicion"></div></label></label>
                        </div>   

                        <div class="filtro-especialidades" id="especialidades">
                            <label>Desarrollo Web <label class="checkBox"><input type="checkbox" class="especialidad" value="Desarrollo Web" /><div class="transicion"></div></label></label>
                            <label>Ciberseguridad <label class="checkBox"><input type="checkbox" class="especialidad" value="Ciberseguridad" /><div class="transicion"></div></label></label>
                            <label>Big Data <label class="checkBox"><input type="checkbox" class="especialidad" value="Big Data" /><div class="transicion"></div></label></label>
                            <label>Inteligencia Artificial <label class="checkBox"><input type="checkbox" class="especialidad" value="Inteligencia Artificial" /><div class="transicion"></div></label></label>
                            <label>SEO <label class="checkBox"><input type="checkbox" class="especialidad" value="SEO" /><div class="transicion"></div></label></label>
                        </div>
                    </div>

                    <!-- Lista de postulantes -->
                    <div id="lista-postulantes">
                        <div class="postulante" data-calificacion="4.4" data-especialidades="Desarrollo Web, Big Data">Thomás Alejandro Peréz Rojas ⭐4.4 - Desarrollo Web, Big Data</div>
                        <div class="postulante" data-calificacion="4.0" data-especialidades="Big Data, Inteligencia Artificial">Esteban Alberto Suárez Díaz ⭐4.0 - Big Data, Inteligencia Artificial</div>
                        <div class="postulante" data-calificacion="3.8" data-especialidades="Inteligencia Artificial, SEO">Camila Fernández Gómez ⭐3.8 - Inteligencia Artificial, SEO</div>
                    </div>
                </div>
        `;
    
        $(".project-details").html(detalles);
    });

    // Evento para publicar un proyecto
    $(".btn-publicar").click(function () {
        agregarTrabajo();
    });

    actualizarCantidadProyectos(); // Inicializa el contador

});

$(document).ready(function () {
    // Mostrar/ocultar postulantes
    $(document).on("click", "#btn-ver-postulantes", function () {
        $("#postulantes").slideToggle(300);
    });


    // Mostrar/ocultar filtros
$(document).on("change", "#filtros-toggle", function () {
    if (this.checked) {
        $('#filtros-container').stop(true, true).slideDown(300);
    } else {
        $('#filtros-container').stop(true, true).slideUp(300);
    }
});

// Mostrar/ocultar especialidades
$(document).on("change", "#mostrar-especialidades", function () {
    if (this.checked) {
        $('#especialidades').stop(true, true).slideDown(300);
    } else {
        $('#especialidades').stop(true, true).slideUp(300);
    }
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

