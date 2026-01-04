/**
 * Al cargar el documento, detectamos si estamos en la página del listado
 * o en la del formulario para ejecutar la función correspondiente.
 */
document.addEventListener("DOMContentLoaded", function() {
    var tabla = document.getElementById("tbodyCitas");
    var formulario = document.getElementById("formCita");

    // Si existe la tabla en el HTML, cargamos los datos
    if (tabla) {
        cargarTabla();
    }

    // Si existe el formulario, miramos si es para editar o crear
    if (formulario) {
        comprobarEdicion();
        formulario.addEventListener("submit", gestionarFormulario);
    }
});

/**
 * Función para leer las citas guardadas en el LocalStorage.
 * Si no hay nada, devuelve un array vacío [].
 */
function obtenerCitas() {
    var datosStorage = localStorage.getItem("citas");
    if (datosStorage == null) {
        return [];
    } else {
        return JSON.parse(datosStorage);
    }
}

/**
 * Recoge los datos del formulario, los valida y los guarda.
 * Si el ID ya existe, actualiza la cita; si no, crea una nueva.
 */
function gestionarFormulario(e) {
    e.preventDefault();
    limpiarErrores();

    // Recogemos todos los campos en un objeto
    var datos = {
        id: document.getElementById("idCita").value,
        fecha: {
            dia: document.getElementById("dia").value,
            mes: document.getElementById("mes").value,
            anio: document.getElementById("anio").value,
            hora: document.getElementById("hora").value,
            minuto: document.getElementById("minuto").value
        },
        paciente: {
            nombre: document.getElementById("nombre").value.trim(),
            apellidos: document.getElementById("apellidos").value.trim(),
            dni: document.getElementById("dni").value.trim(),
            telefono: document.getElementById("telefono").value.trim(),
            nacimiento: document.getElementById("nacimiento").value
        },
        observaciones: document.getElementById("observaciones").value.trim()
    };

    // Si la validación falla, salimos de la función
    if (validar(datos) == false) {
        return;
    }

    var lista = obtenerCitas();

    // Si hay ID, buscamos la cita vieja para sustituirla (Editar)
    if (datos.id != "") {
        // Recorremos todo con un for y length del array 
        for (var i = 0; i < lista.length; i++) {
            if (lista[i].id == datos.id) {
                lista[i] = datos;
                lista[i].id = Number(datos.id); // Aseguramos que el ID sea un número
            }
        }
    } else {
        // Si no hay ID, creamos uno nuevo con el tiempo actual y guardamos
        datos.id = Date.now();
        lista.push(datos);
    }

    localStorage.setItem("citas", JSON.stringify(lista));
    window.location.href = "ver_citas.html"; // Volvemos al listado
}

/**
 * Recorre el array de citas y genera las filas de la tabla HTML.
 * Si no hay citas, muestra el mensaje "dato vacío".
 */
function cargarTabla() {
    var lista = obtenerCitas();
    var tbody = document.getElementById("tbodyCitas");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-row">dato vacío</td></tr>';
        return;
    }

    // Creamos las filas una a una. Lo más asequible es hacerlo con un for reccoriendo 
    for (var i = 0; i < lista.length; i++) {
        var cita = lista[i];
        var tr = document.createElement("tr");
        
        var fechaTxt = cita.fecha.dia + "/" + cita.fecha.mes + "/" + cita.fecha.anio + " " + cita.fecha.hora + ":" + cita.fecha.minuto;

        tr.innerHTML = "<td>" + (i + 1) + "</td>" +
                       "<td>" + cita.paciente.nombre + " " + cita.paciente.apellidos + "</td>" +
                       "<td>" + fechaTxt + "</td>" +
                       "<td>" + cita.paciente.telefono + "</td>" +
                       "<td>" +
                            "<button onclick='irAModificar(" + cita.id + ")'>Modificar</button>" +
                            "<button onclick='eliminar(" + cita.id + ")'>Eliminar</button>" +
                       "</td>";
        tbody.appendChild(tr);
    }
}

/**
 * Redirige a la página del formulario enviando el ID por la URL.
 */
function irAModificar(id) {
    window.location.href = "nueva_cita.html?editId=" + id;
}

/**
 * Mira si en la dirección (URL) hay un parámetro "editId".
 * Si lo hay, busca la cita y rellena el formulario automáticamente.
 */
function comprobarEdicion() {
    var urlParams = new URLSearchParams(window.location.search);
    var idEditar = urlParams.get('editId');

    if (idEditar != null) {
        var lista = obtenerCitas();
        var citaEncontrada = null;

        for (var i = 0; i < lista.length; i++) {
            if (lista[i].id == idEditar) {
                citaEncontrada = lista[i];
            }
        }

        if (citaEncontrada != null) {
            document.getElementById("idCita").value = citaEncontrada.id;
            document.getElementById("dia").value = citaEncontrada.fecha.dia;
            document.getElementById("mes").value = citaEncontrada.fecha.mes;
            document.getElementById("anio").value = citaEncontrada.fecha.anio;
            document.getElementById("hora").value = citaEncontrada.fecha.hora;
            document.getElementById("minuto").value = citaEncontrada.fecha.minuto;
            document.getElementById("nombre").value = citaEncontrada.paciente.nombre;
            document.getElementById("apellidos").value = citaEncontrada.paciente.apellidos;
            document.getElementById("dni").value = citaEncontrada.paciente.dni;
            document.getElementById("telefono").value = citaEncontrada.paciente.telefono;
            document.getElementById("nacimiento").value = citaEncontrada.paciente.nacimiento;
            document.getElementById("observaciones").value = citaEncontrada.observaciones;
            document.getElementById("titulo-form").innerText = "Modificando Cita";
        }
    }
}

/**
 * Borra una cita del LocalStorage tras pedir confirmación al usuario.
 */
function eliminar(id) {
    if (confirm("¿Seguro que quieres borrar esta cita?")) {
        var lista = obtenerCitas();
        var nuevaLista = [];

        for (var i = 0; i < lista.length; i++) {
            if (lista[i].id != id) {
                nuevaLista.push(lista[i]);
            }
        }

        localStorage.setItem("citas", JSON.stringify(nuevaLista));
        cargarTabla();
    }
}

/**
 * Comprueba que los campos obligatorios estén rellenos y tengan el formato correcto.
 * Si hay error, añade la clase "error" al input para que el CSS lo pinte de rojo.
 */
function validar(datos) {
    var todoCorrecto = true;

    if (datos.paciente.nombre == "") { 
        document.getElementById("nombre").classList.add("error"); 
        todoCorrecto = false; 
    }
    if (datos.paciente.apellidos == "") { 
        document.getElementById("apellidos").classList.add("error"); 
        todoCorrecto = false; 
    }
    
    // Validación de DNI (8 números y 1 letra)
    var expresionDni = /^[0-9]{8}[A-Z]$/i;
    if (expresionDni.test(datos.paciente.dni) == false) {
        document.getElementById("dni").classList.add("error");
        todoCorrecto = false;
    }

    // Validación de Teléfono (que sea número y no esté vacío)
    if (isNaN(datos.paciente.telefono) || datos.paciente.telefono == "") {
        document.getElementById("telefono").classList.add("error");
        todoCorrecto = false;
    }

    // Comprobar campos de fecha
    var idsFecha = ["dia", "mes", "anio", "hora", "minuto"];
    for (var i = 0; i < idsFecha.length; i++) {
        var input = document.getElementById(idsFecha[i]);
        if (input.value == "") {
            input.classList.add("error");
            todoCorrecto = false;
        }
    }

    return todoCorrecto;
}

/**
 * Quita la clase "error" de todos los campos antes de volver a validar.
 */
function limpiarErrores() {
    var camposConError = document.querySelectorAll(".error");
    for (var i = 0; i < camposConError.length; i++) {
        camposConError[i].classList.remove("error");
    }
}