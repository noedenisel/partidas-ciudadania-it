import { partidaServices } from "./service/partidas-service.js";
import { obtenerDatosPartidaAvo } from "./partida.js";
import { obtenerDatosPartidaMatrimonio } from "./matrimonio.js";
import { obtenerPartidaDefuncion } from "./defuncion.js";

const partidas = []; // Crear un arreglo de partidas

const saveButton = document.querySelector("[type='submit']");
saveButton.addEventListener("click", async function () {
    const datosPartida = obtenerDatosPartidaAvo();
    const datosMatrimonio = obtenerDatosPartidaMatrimonio();
    const datosDefuncion = obtenerPartidaDefuncion();

    const partida = {
        [datosPartida.name]: {
            partidaNacimiento: {
                persona: datosPartida.persona,
                bday: datosPartida.bday,
                lugarNacimiento: datosPartida.lugarNacimiento,
                madre: datosPartida.madre,
                padre: datosPartida.padre,
            },
            partidaMatrimonio: datosMatrimonio,
            partidaDefuncion: datosDefuncion
        },
        id: partidas.length + 1, // Genera el ID según tu lógica
    };

    partidas.push(partida);
    
    // Limpia el formulario
    function limpiarFormulario() {
        const inputs = document.querySelectorAll("input[type='text'], input[type='number'], input[type='date']");
        
        inputs.forEach(input => {
            input.value = ""; // Limpia el valor de cada campo
        });
    }


    limpiarFormulario();

    // Imprime las partidas
    console.log("Partidas:", partidas);

    // Guarda las partidas en el almacenamiento local
    guardarPartidaEnAlmacenamientoLocal(partida);

    // Mostrar todas las partidas guardadas de manera más legible en la consola
    const partidasGuardadas = JSON.parse(localStorage.getItem("partidasGuardadas"));

    partidasGuardadas.forEach((partida, index) => {
        console.log(`Partida ${index + 1}:`);
        console.log(partida);
    });
});

function limpiarFormulario() {
    // Resto del código para limpiar el formulario
}

function guardarPartidaEnAlmacenamientoLocal(partida) {
    // Obtiene las partidas previamente guardadas en el almacenamiento local (si existen)
    const partidasGuardadas = JSON.parse(localStorage.getItem("partidasGuardadas")) || [];

    // Agrega la nueva partida a la lista
    partidasGuardadas.push(partida);

    // Guarda la lista actualizada en el almacenamiento local
    localStorage.setItem("partidasGuardadas", JSON.stringify(partidasGuardadas));

    // Opcional: Puedes mostrar un mensaje al usuario confirmando que los datos se han guardado en el almacenamiento local.
    alert("Partida guardada en el almacenamiento local");
}
