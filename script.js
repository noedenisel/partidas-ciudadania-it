import { partidaServices } from "./service/partidas-service.js";
import { obtenerDatosPartidaAvo } from "./partida.js";
import { obtenerDatosPartidaMatrimonio } from "./matrimonio.js";
import { obtenerPartidaDefuncion } from "./defuncion.js";

const partidas = []; // Crear un arreglo de partidas

const saveButton = document.querySelector("[type='submit']");
saveButton.addEventListener("click", async function () {
    const datosPartida = obtenerDatosPartidaAvo();
    const datosMatrimonio = obtenerDatosPartidaMatrimonio()
    const datosDefuncion = obtenerPartidaDefuncion()

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
    limpiarFormulario();

    // Imprime las partidas
    console.log("Partidas:", partidas);

    // Guarda las partidas en el servicio
    await savePartidas(partida);
});

async function savePartidas(partida) {
    const response = await partidaServices.savePartida(partida);
    console.log("Partida guardada:", response);
}

function limpiarFormulario() {
    // Limpia el formulario
    // Resto del código para limpiar el formulario
}

