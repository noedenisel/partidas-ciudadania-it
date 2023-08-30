//TODO: Ver como se muestan los datos: bday/place/Age.. ponerlo en español
//Todo: agregar que renderice sexo en la partida de nacimiento
//todo: agregar padres en partida de defuncion


import {  validarPartNacimiento,
    validarPartidaMatrimonio,
    validarEdadMatrimonio,
    validarNacionalidad,
     validarNacionalidadDefuncion
    } 
     from "./validaciones.js"
     document.addEventListener("DOMContentLoaded", () => {
        const partidasContainer = document.getElementById("partidas-container");
    
        const partidasGuardadas = JSON.parse(localStorage.getItem("partidasGuardadas")) || [];
    
        partidasGuardadas.forEach((partida, index) => {
            const personaName = Object.keys(partida)[0];
            const partidaData = partida[personaName];
    
            const personaElement = document.createElement("div");
            personaElement.classList.add("persona");
    
            const nombreElement = document.createElement("h2");
            nombreElement.textContent = personaName;
            personaElement.appendChild(nombreElement);
    
            for (const tipoPartida in partidaData) {
                const tipoPartidaElement = document.createElement("h3");
                tipoPartidaElement.textContent = tipoPartida;
                personaElement.appendChild(tipoPartidaElement);
    
                const datosPartida = partidaData[tipoPartida];
                for (const campo in datosPartida) {
                    const campoElement = document.createElement("p");
    
                    if (campo === "hijoDe") {
                        const madre = datosPartida[campo].madre;
                        const padre = datosPartida[campo].padre;
                        campoElement.textContent = `Hijo de: ${padre} y ${madre}`;
                    } else {
                        campoElement.textContent = `${campo}: ${datosPartida[campo]}`;
                    }
    
                    personaElement.appendChild(campoElement);
                }
                  const erroresContainer = document.createElement("div");
            erroresContainer.classList.add("errores-partida");
            personaElement.appendChild(erroresContainer); // Aquí se agrega el contenedor de errores al final de cada personaElement

            }
    
            partidasContainer.appendChild(personaElement); // Moví esto aquí para que los datos de la partida se agreguen antes de los mensajes de error
    
                  });
    
        const validarPartidasButton = document.getElementById("validar-partidas");
        validarPartidasButton.addEventListener("click", () => {
            console.log("Hice click en validar partidas");
            console.log("Listado de partidas guardadas:", partidasGuardadas);
    
            validarPartNacimiento(partidasGuardadas);
            validarPartidaMatrimonio(partidasGuardadas);
            validarEdadMatrimonio(partidasGuardadas);
            validarNacionalidad(partidasGuardadas);
            validarNacionalidadDefuncion(partidasGuardadas);
        });
    });
    