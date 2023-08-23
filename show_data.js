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


    // Validacion de partida de Nacimiento
    function validarPartNacimiento(partidasData) {
        for (let i = 1; i < partidasData.length; i++) {
            const personaAnterior = partidasData[i - 1][Object.keys(partidasData[i - 1])[0]].partidaNacimiento.persona;
            // console.log("Persona anterior:", personaAnterior);
            const [nombreAnterior, apellidoAnterior] = obtenerNombreApellido(personaAnterior);
            // console.log("Nombre y apellido de persona anterior:", nombreAnterior, apellidoAnterior);
    
            const personaActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.persona;
            // console.log("Persona actual:" , personaActual);
            const madreActual = obtenerNombreApellido(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.madre);
            // console.log("Madre actual:", madreActual);
            const padreActual = obtenerNombreApellido(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.padre);
            // console.log("Padre actual:", padreActual);
    
            let mensajeCoincidencia = "";

            const coincideNombreMadre = madreActual.includes(nombreAnterior) || madreActual.includes(apellidoAnterior);
            const coincideNombrePadre = padreActual.includes(nombreAnterior) || padreActual.includes(apellidoAnterior);

        if (coincideNombreMadre) {
            mensajeCoincidencia = `La partida de nacimiento de ${personaActual} podría contener un error en relación al nombre o apellido de la madre, en su partida figura ${madreActual} pero los datos correctos serian  ${personaAnterior}.`;
        } else if (coincideNombrePadre) {
            mensajeCoincidencia = `La partida de nacimiento de ${personaActual} podría contener un error en relación al nombre o apellido del padre, en su partida figura ${padreActual} pero los datos correctos serian ${personaAnterior} `;
        } else {
            mensajeCoincidencia = `La partida de nacimiento ${i + 1} no presenta errores en relacion a sus padres.`;
        }

        console.log(mensajeCoincidencia);
        }
    }

    // Validacion de partida de Matrimonio
    function validarPartidaMatrimonio(partidasData){
        for (let i = 1; i < partidasData.length; i++) {
            const personaAnterior = partidasData[i - 1][Object.keys(partidasData[i - 1])[0]].partidaNacimiento.persona;
            const [nombreAnterior, apellidoAnterior] = obtenerNombreApellido(personaAnterior);
    
            const personaActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.persona;
            const madreActual = obtenerNombreApellido(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.madre);
            console.log("Madre actual:", madreActual);
            const padreActual = obtenerNombreApellido(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.padre);
            console.log("Padre actual:", padreActual);


            const hijoDe = partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.hijoDe;
            console.log("Hijo de:", hijoDe);
            
            const madreHijoDe = obtenerNombreApellido(hijoDe.madre);
            console.log("Hijo de madre:", madreHijoDe);
        
            const padreHijoDe = obtenerNombreApellido(hijoDe.padre);
            console.log("hijo de padre:", padreHijoDe);

    
            let mensajeCoincidencia = "";

            const coincideNombreMadre = madreActual.includes(nombreAnterior) || madreActual.includes(apellidoAnterior);
            const coincideNombrePadre = padreActual.includes(nombreAnterior) || padreActual.includes(apellidoAnterior);
            
    
            if (coincideNombreMadre) {
                mensajeCoincidencia = `La partida de matrimonio de ${personaActual} podría contener un error en relación al nombre o apellido de la madre, en su partida figura ${madreActual} pero los datos correctos serian  ${personaAnterior}.`;
            } else if (coincideNombrePadre) {
                mensajeCoincidencia = `La partida de matrimonio de ${personaActual} podría contener un error en relación al nombre o apellido del padre, en su partida figura ${padreActual} pero los datos correctos serian ${personaAnterior} `;
            } else {
                mensajeCoincidencia = `La partida de matrimonio ${i + 1} no presenta errores en relacion a sus padres.`;
            }
    
        }
    }
    validarPartNacimiento(partidasData);
    validarPartidaMatrimonio(partidasData)
});


export {partidasData}

    