function mostrarError(mensaje, indice) {
    if (!mostrarError.errors) {
        mostrarError.errors = {}; // Crear objeto para almacenar los errores
    }

    if (!mostrarError.errors[indice]) {
        mostrarError.errors[indice] = [];
    }

    mostrarError.errors[indice].push(mensaje);
    mostrarErroresEnDOM();
}

function mostrarErroresEnDOM() {
    const erroresContainer = document.getElementById("errores-container");
    erroresContainer.innerHTML = ""; // Limpiar los errores previos

    let index = 0; // Nuevo índice para mostrar el orden

    for (const indice in mostrarError.errors) {
        mostrarError.errors[indice].forEach(mensaje => {
            const errorElement = document.createElement("h3");
            errorElement.classList.add("error-message");
            errorElement.textContent = mensaje; // Mostrar solo el mensaje
            erroresContainer.appendChild(errorElement);
            index++;
        });
    }
}



// Validacion de partida de Nacimiento

function validarPartNacimiento(partidasData) {

    for (let i = 1; i < partidasData.length; i++) {
        const personaAnterior = partidasData[i - 1][Object.keys(partidasData[i - 1])[0]].partidaNacimiento.persona;
        const personaActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.persona;
        const madreActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.madre;
        const padreActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.padre;
        
        const nombresPersonaAnterior = personaAnterior.split(" ").filter(nombre => nombre.trim() !== "");
        const nombresMadreActual = madreActual.split(" ").filter(nombre => nombre.trim() !== "");   
        const nombresPadreActual = padreActual.split(" ").filter(nombre => nombre.trim() !== "");
    
        let partida = partidasData[i][Object.keys(partidasData[i])[0]];
        partida.coicidenciaMadre = "";
        partida.coicidenciaPadre = "";

        if (nombresPersonaAnterior.join(" ") === nombresMadreActual.join(" ")) {
            partida.coicidenciaMadre = "total";
        }

        if (nombresPersonaAnterior.join(" ") === nombresPadreActual.join(" ")) {
            partida.coicidenciaPadre = "total";
        }

        if (!partida.coicidenciaMadre) {
            partida.coicidenciaMadre = nombresMadreActual.some(nombreMadreActual =>
                nombresPersonaAnterior.some(nombrePersonaAnterior =>
                    nombreMadreActual.includes(nombrePersonaAnterior) || nombrePersonaAnterior.includes(nombreMadreActual)
                )
            ) ? "parcial" : "ninguna";
        }

        if (!partida.coicidenciaPadre) {
            partida.coicidenciaPadre = nombresPadreActual.some(nombrePadreActual =>
                nombresPersonaAnterior.some(nombrePersonaAnterior =>
                    nombrePadreActual.includes(nombrePersonaAnterior) || nombrePersonaAnterior.includes(nombrePadreActual)
                )
            ) ? "parcial" : "ninguna";
        }

        // Mostrar mensajes
        if (partida.coicidenciaMadre === "parcial") {
            mostrarError(`La partida de nacimiento de ${personaActual} podría contener errores en los datos de su madre. En su partida de nacimiento figura: ${madreActual} y el nombre correcto debería ser ${personaAnterior}.`,i);
        }

        if (partida.coicidenciaPadre === "parcial") {
            mostrarError(`La partida de nacimiento de ${personaActual} podría contener errores en los datos de su padre. En su partida de nacimiento figura: ${padreActual} y el nombre correcto debería ser ${personaAnterior}.`,i);
        }        
    }
}

// Validacion de partida de Matrimonio
function validarPartidaMatrimonio(partidasData) {

    //Validaciones entre partida de matrimonio y partida de nacimiento
    for (let i = 0; i < partidasData.length; i++) {
        const personaActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.persona;

        const partidaMatrimonio = partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio;
        
        //si tengo partida de matrimonio cargada
        if (partidaMatrimonio) {
           
            const partidaMatrimonioDe = partidaMatrimonio.persona;

            const nombresPersonaNacimiento = personaActual.split(" ").filter(nombre => nombre.trim() !== "");
            const nombresPersonaMatrimonio = partidaMatrimonioDe.split(" ").filter(nombre => nombre.trim() !== "");

            let coincidenciaPersona = "";

            if (nombresPersonaNacimiento.join(" ") === nombresPersonaMatrimonio.join(" ")) {
                coincidenciaPersona = "total";
            } else {
                coincidenciaPersona = nombresPersonaMatrimonio.some(nombreMatrimonio =>
                    nombresPersonaNacimiento.some(nombreNacimiento =>
                        nombreMatrimonio.includes(nombreNacimiento) || nombreNacimiento.includes(nombreMatrimonio)
                    )
                ) ? "parcial" : "ninguna";
            }

            // Mostrar mensajes
            if (coincidenciaPersona === "parcial") {
                mostrarError(`El nombre de ${partidaMatrimonioDe} en su partida de matrimonio podría contener errores respecto a su partida de nacimiento. En su partida de nacimiento el nombre que figura es ${nombresPersonaNacimiento} , y en su partida de matrimonio figura ${nombresPersonaMatrimonio}`,i);
            } else {
                mostrarError(`El nombre de ${partidaMatrimonioDe} en su partida de matrimonio no coincide con su partida de nacimiento.`,i);
            }

                //Valida los nombres de los padres de su partida de matrimonio con los de los padres en su partida de nacimiento

                    //Datos de padres en la partida de matrimonio
                    const hijoDeMadre = partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.hijoDe.madre      
                    const hijoDePadre = partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.hijoDe.padre
            
                    const madrePartidaMat = hijoDeMadre.split(" ").filter(nombre => nombre.trim() !== "");
                    const padrePartidaMat = hijoDePadre.split(" ").filter(nombre => nombre.trim() !== "");

                    //Datos de los padres en la partida de nacimiento
                    const madre = partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.madre;
                    const padre = partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.padre;
                    
                    const madrePartNac = madre.split(" ").filter(nombre => nombre.trim() !== "");
                    const padrePartNac = padre.split(" ").filter(nombre => nombre.trim() !== "");

                    let partida = partidasData[i][Object.keys(partidasData[i])[0]];
                    partida.coicidenciaMadre = "";
                    partida.coicidenciaPadre = "";
            
                   
                    if (madrePartNac.join(" ") === madrePartidaMat.join(" ")) {
                        partida.coicidenciaMadre = "total";
                        } else {
                            partida.coicidenciaMadre = madrePartidaMat.some(nombreMatrimonio =>
                                madrePartNac.some(nombreNacimiento =>
                                    nombreMatrimonio.includes(nombreNacimiento) || nombreNacimiento.includes(nombreMatrimonio)
                                )
                            ) ? "parcial" : "ninguna";

                        // Mostrar mensaje para coincidencia parcial
                        if (partida.coicidenciaMadre === "parcial") {
                            mostrarError(`El nombre de la madre de ${partidaMatrimonioDe} en su partida de matrimonio podría contener errores respecto a su partida de nacimiento. En la partida de nacimiento el nombre que figura es ${madre}, y en la partida de matrimonio figura ${hijoDeMadre}.`,i);
                            } else {
                                mostrarError(`El nombre de la madre de ${partidaMatrimonioDe} en su partida de matrimonio no coincide con su partida de nacimiento.`,i);
                            }
                        }

                        if (padrePartNac.join(" ") === padrePartidaMat.join(" ")) {
                            partida.coicidenciaMadre = "total";
                            } else {
                                partida.coicidenciaMadre = padrePartidaMat.some(nombreMatrimonio =>
                                    padrePartNac.some(nombreNacimiento =>
                                        nombreMatrimonio.includes(nombreNacimiento) || nombreNacimiento.includes(nombreMatrimonio)
                                    )
                                ) ? "parcial" : "ninguna";
    
                            // Mostrar mensaje para coincidencia parcial
                            if (partida.coicidenciaMadre === "parcial") {
                                mostrarError(`El nombre del padre de ${partidaMatrimonioDe} en su partida de matrimonio podría contener errores respecto a su partida de nacimiento. En la partida de nacimiento el nombre que figura es ${padre}, y en la partida de matrimonio figura ${hijoDePadre}.`,i);
                                } else {
                                    mostrarError(`El nombre del padre de ${partidaMatrimonioDe} en su partida de matrimonio no coincide con su partida de nacimiento.`,i);
                                }
                            }  
                        } else {
                            mostrarError("La persona actual no tiene partida de matrimonio registrada.",i);
                        }
                    }

    //Validaciones partida de matrimonio con nombre de partida de nacimiento del padre/madre
    for (let i = 1; i < partidasData.length; i++) {
        const partidaMatrimonio = partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio;
        
        //si tengo partida de matrimonio cargada
        if (partidaMatrimonio){
            const personaAnterior = partidasData[i - 1][Object.keys(partidasData[i - 1])[0]].partidaNacimiento.persona;
            const personaActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.persona;
            const madreActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.hijoDe.madre;
            const padreActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.hijoDe.padre;
                

            const nombresPersonaAnterior = personaAnterior.split(" ").filter(nombre => nombre.trim() !== "");
            const nombresMadreActual = madreActual.split(" ").filter(nombre => nombre.trim() !== "");   
            const nombresPadreActual = padreActual.split(" ").filter(nombre => nombre.trim() !== "");
        
            let partida = partidasData[i][Object.keys(partidasData[i])[0]];
            partida.coicidenciaMadre = "";
            partida.coicidenciaPadre = "";
    
            if (nombresPersonaAnterior.join(" ") === nombresMadreActual.join(" ")) {
                partida.coicidenciaMadre = "total";
            }
    
            if (nombresPersonaAnterior.join(" ") === nombresPadreActual.join(" ")) {
                partida.coicidenciaPadre = "total";
            }
    
            if (!partida.coicidenciaMadre) {
                partida.coicidenciaMadre = nombresMadreActual.some(nombreMadreActual =>
                    nombresPersonaAnterior.some(nombrePersonaAnterior =>
                        nombreMadreActual.includes(nombrePersonaAnterior) || nombrePersonaAnterior.includes(nombreMadreActual)
                    )
                ) ? "parcial" : "ninguna";
            }
    
            if (!partida.coicidenciaPadre) {
                partida.coicidenciaPadre = nombresPadreActual.some(nombrePadreActual =>
                    nombresPersonaAnterior.some(nombrePersonaAnterior =>
                        nombrePadreActual.includes(nombrePersonaAnterior) || nombrePersonaAnterior.includes(nombrePadreActual)
                    )
                ) ? "parcial" : "ninguna";
            }
    
            // Mostrar mensajes
           if (partida.coicidenciaMadre === "parcial") {
            mostrarError(`La partida de matrimonio de ${personaActual} podría contener errores en los datos de su madre. En su partida de matrimonio figura: ${madreActual} y el nombre correcto debería ser ${personaAnterior}.`,i);
            }
    
            if (partida.coicidenciaPadre === "parcial") {
                mostrarError(`La partida de matrimonio de ${personaActual} podría contener errores en los datos de su padre. En su partida de matrimonio figura: ${padreActual} y el nombre correcto debería ser ${personaAnterior}.`,i);
            }
        } else {
            mostrarError("La persona actual no tiene partida de matrimonio registrada.",i);
        }
        
    }
}


// Valida si la edadque figura en la partida de matrimonio es correcta
function calcularEdadEnMatrimonio(fechaNacimiento, fechaMatrimonio) {
    const nacimiento = new Date(fechaNacimiento);
    const matrimonio = new Date(fechaMatrimonio);
    const edadEnMilisegundos = matrimonio - nacimiento;
    const edad = Math.floor(edadEnMilisegundos / (1000 * 60 * 60 * 24 * 365.25));

    return edad;
}

function validarEdadMatrimonio(partidasData) {
 
    for (let i = 0; i < partidasData.length; i++) {
        const fechaNacimiento = new Date(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.bday).toISOString();

        const fechaMatrimonio = new Date(partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.date).toISOString();
    
        const edadMatrimonioRegistrada = parseInt(partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.age);

        const edadCalculada = calcularEdadEnMatrimonio(fechaNacimiento, fechaMatrimonio);
            
        if (edadMatrimonioRegistrada !== edadCalculada) {
            mostrarError(`La edad registrada en la partida de matrimonio para ${Object.keys(partidasData[i])[0]} no coincide con la edad calculada. La edad registrada es ${edadMatrimonioRegistrada} y la edad calculada ${edadCalculada}`,i);
        } 
    }
}

//Validacion de nacionalidad en partida de matrimonio sin api key

function validarNacionalidad(partidasData) {
    for (let i = 0; i < partidasData.length; i++) {
        const nacionalidadMatrimonio = (partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.bdayPlace);
        const lugarNacimiento = (partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.lugarNacimiento);

        if (nacionalidadMatrimonio !== lugarNacimiento) {
            mostrarError(`El lugar de nacimieto de la partida de matrimonio para ${Object.keys(partidasData[i])[0]} no coincide con el lugar de nacimiento que figura en su partida de nacimiento. ATENCION: Esta web compara los campos ingresados. Si en la partida de nacimiento figura una localidad de la Provincia de Buenos Aires y en la partida de matrimonio figura Bueno Aires (por ejemplo), va a dar error, pero los datos seria correctos.`,i);
        } 
    }
}

//Validar nacionalidad en partida de defuncion sin api: 
function validarNacionalidadDefuncion(partidasData) {
    for (let i = 0; i < partidasData.length; i++) {
        const nacionalidadDefuncion = (partidasData[i][Object.keys(partidasData[i])[0]].partidaDefuncion.bdayPlace);
        const lugarNacimiento = (partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.lugarNacimiento);

        if (nacionalidadDefuncion !== lugarNacimiento) {
            mostrarError(`El lugar de nacimieto de la partida de matrimonio para ${Object.keys(partidasData[i])[0]} no coincide con el lugar de nacimiento que figura en su partida de nacimiento. ATENCION: Esta web compara los campos ingresados. Si en la partida de nacimiento figura una localidad de la Provincia de Buenos Aires y en la partida de matrimonio figura Bueno Aires (por ejemplo), va a dar error, pero los datos seria correctos.`,i);
        }
    }
}

export  {
    validarPartNacimiento,
    validarPartidaMatrimonio,
    validarEdadMatrimonio,
    validarNacionalidad,
    validarNacionalidadDefuncion,
}

