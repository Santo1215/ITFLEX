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

document.addEventListener("DOMContentLoaded", () => {
    const imagen = document.getElementById("imagen-galeria");
    const titulo = document.getElementById("titulo");
    const texto = document.getElementById("texto");
    const descripcion = document.getElementById("descripcion");

    const personas = [
        {
            src: "/media/Jesus.png",
            nombre: "Jesus Santodomingo",
            texto: "Development Team",
            descripcion: "Estudiante de sexto semestre de Ingeniería de Sistemas en la Universidad Industrial de Santander. Participó activamente en el proyecto, destacándose como uno de los principales contribuyentes al desarrollo del mismo."
        },
        {
            src: "/media/Nicolas.png",
            nombre: "Nicolas Rivera",
            texto: "Product Owner",
            descripcion: "Estudiante de Ingeniería de Sistemas en la Universidad Industrial de Santander, miembro activo del semillero Hands on Computer Vision, donde desarrolla proyectos relacionados con visión por computador y aprendizaje automático."
        },
        {
            src: "/media/Sebastian.png",
            nombre: "Sebastian Diaz",
            texto: "Lobo Domesticado",
            descripcion: "Tu loco enamorado, Tu mascota fiel ,Tu lobo domesticado, Tu loco enamorado ,Siempre quiero ser"
        },
        {
            src: "/media/Equipo.png",
            nombre: "Nuestro equipo",
            texto: "Conectando talento con proyectos que inspiran.",
            descripcion: "En ITFLEX, creemos que los grandes proyectos nacen de la colaboración, la pasión y la diversidad de talentos. Nuestro equipo fundador combina innovación tecnológica y un compromiso compartido para transformar el futuro del trabajo independiente, conectando habilidades excepcionales con nuevas oportunidades."
        },
    ];

    let indice = 0;

    function actualizarGaleria(i) {
        const persona = personas[i];
        imagen.src = persona.src;
        titulo.textContent = persona.nombre;
        texto.textContent = persona.texto;
        descripcion.textContent = persona.descripcion;
    }

    document.getElementById("anterior").addEventListener("click", () => {
        indice = (indice - 1 + personas.length) % personas.length;
        actualizarGaleria(indice);
    });

    document.getElementById("siguiente").addEventListener("click", () => {
        indice = (indice + 1) % personas.length;
        actualizarGaleria(indice);
    });

    // 👇 Autoplay: cambiar cada 5 segundos
    setInterval(() => {
        indice = (indice + 1) % personas.length;
        actualizarGaleria(indice);
    }, 5000);

    actualizarGaleria(indice);
});