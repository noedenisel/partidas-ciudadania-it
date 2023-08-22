import { partidaServices } from "./service/partidas-service.js";
//import validarPartNacimiento from "./validaciones.js"

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
   
    // Función para normalizar un nombre o apellido
    function normalizarTexto(texto) {
        return texto.toLowerCase();
    }

    // Función para obtener el nombre y apellido a partir de partidanacimiento.persona
    function obtenerNombreApellido(persona) {
        const [nombre, apellido] = persona.split(" ");
        return [normalizarTexto(nombre), normalizarTexto(apellido)];
    }


    // Función para realizar la validación de coincidencias
    function validarPartNacimiento(partidasData) {

        for (let i = 1; i < partidasData.length; i++) {

            const personaAnterior = partidasData[i - 1][Object.keys(partidasData[i - 1])[0]].partidaNacimiento.persona;
            console.log(personaAnterior);
            const nombreApellidoAnterior = obtenerNombreApellido(personaAnterior);
            console.log(nombreApellidoAnterior);

           
            const personaActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.persona;
            console.log(personaActual);
            const madreActual = obtenerNombreApellido(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.madre);
            console.log(madreActual);
            const padreActual = obtenerNombreApellido(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.padre);
            console.log(padreActual);


            // let coincidenciaMadre = false;
          
            // madreActual.forEach(e => {
            //     if (personaAnterior.includes(nombre) || personaAnterior.includes(apellido)) {
            //         coincidenciaMadre = true; 
            //         console.log("Coincidencia de Madre:", coincidenciaMadre);
            //     }  
            // });

            // console.log("Coincidencia de Madre:", coincidenciaMadre);

         
        
            // let coincidenciaPadre = false;
            
            // padreActual.forEach(nombre => {
            //     if (personaAnterior.includes(nombre) || personaAnterior.includes(apellido)) {
            //         coincidenciaPadre = true;
            //         console.log("Coincidencia de Padre:", coincidenciaPadre);
            //     }
            // });

            // console.log("Coincidencia de Padre:", coincidenciaPadre);

            // if (coincidenciaMadre || coincidenciaPadre) {
            //     let mensaje = "";
            //     if (coincidenciaMadre) {
            //         mensaje += `Coincidencia parcial en madre en la partida de ${personaAnterior}. `;
            //     }
            //     if (coincidenciaPadre) {
            //         mensaje += `Coincidencia parcial en padre en la partida de ${personaAnterior}. `;
            //     }
            //     console.log(mensaje);
            // } else {
            //     console.log(`Los datos de los padres en la partida de ${personaAnterior} son incorrectos.`);
            // }
        }
    }

    validarPartNacimiento(partidasData);
});


export {partidasData}