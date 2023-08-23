import { partidaServices } from "./service/partidas-service.js";
import {  validarPartNacimiento,
    validarPartidaMatrimonio,
    validarEdadMatrimonio,
    validarNacionalidad,
     validarNacionalidadDefuncion} from "./validaciones.js"

console.log(partidaServices);

let partidasData

document.addEventListener("DOMContentLoaded", async () => {
     partidasData = await partidaServices.listaPartidas();
    console.log("Datos de partidas obtenidos:", partidasData);

    // Aquí puedes llamar a una función que construya y muestre el contenido HTML de las partidas
    mostrarPartidasGuardadas(partidasData);
   
});

function mostrarPartidasGuardadas(partidas) {
    const partidasContainer = document.getElementById("partidas-container");

    partidas.forEach(partida => {
        const persona = Object.keys(partida)[0];
        const partidaDetails = partida[persona];
        
        const partidaDiv = document.createElement("div");
        partidaDiv.classList.add("partida");

        const nombreHeading = document.createElement("h1");
        nombreHeading.textContent = persona;
        partidaDiv.appendChild(nombreHeading);

        for (const tipoPartida in partidaDetails) {
            const tipoPartidaHeading = document.createElement("h3");
            tipoPartidaHeading.textContent = tipoPartida;
            partidaDiv.appendChild(tipoPartidaHeading);
        
            const datosPartida = partidaDetails[tipoPartida];
            for (const campo in datosPartida) {
                const campoParrafo = document.createElement("p");
                if (campo === "hijoDe") {
                    const hijoDe = datosPartida[campo];
                    const hijoDeTexto = `Hijo de: ${hijoDe.madre} y ${hijoDe.padre}`;
                    campoParrafo.textContent = hijoDeTexto;
                } else {
                    campoParrafo.textContent = `${campo}: ${datosPartida[campo]}`;
                }
                partidaDiv.appendChild(campoParrafo);
            }
        }

        partidasContainer.appendChild(partidaDiv);
    });
}

const validarPartidasButton = document.getElementById("validar-partidas");
validarPartidasButton.addEventListener("click", () => {
    console.log("Hice click en validar partidas");
    console.log("Listado de partidas guardadas:", partidasData); // Accedemos al listado de partidasData
 
    validarPartNacimiento(partidasData);
    validarPartidaMatrimonio(partidasData)
    validarEdadMatrimonio(partidasData);
    validarNacionalidad(partidasData);
     validarNacionalidadDefuncion(partidasData)
});


export {partidasData}

    