// Validacion de partida de Nacimiento

function validarPartNacimiento(partidasData) {

    // console.log("validaciones de partida de nacimiento");

    for (let i = 1; i < partidasData.length; i++) {
        const personaAnterior = partidasData[i - 1][Object.keys(partidasData[i - 1])[0]].partidaNacimiento.persona;
        const personaActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.persona;
        const madreActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.madre;
        const padreActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.padre;
            
            // console.log("Validando partida de nacimiento de:" , personaActual,"Persona anterior:", personaAnterior,"Madre actual:", madreActual, "Padre actual:", padreActual );
        
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
            // console.log(`La partida de nacimiento de ${personaActual} podría contener errores en los datos de su madre. En su partida de nacimiento figura: ${madreActual} y el nombre correcto debería ser ${personaAnterior}.`);
        }

        if (partida.coicidenciaPadre === "parcial") {
            // console.log(`La partida de nacimiento de ${personaActual} podría contener errores en los datos de su padre. En su partida de nacimiento figura: ${padreActual} y el nombre correcto debería ser ${personaAnterior}.`);
        }
        
        if (partida.coicidenciaMadre === "total" || partida.coicidenciaPadre === "total"){
            // console.log(`La partida de nacimiento de ${personaActual} no tiene errores`)
        }
    }
}

// Validacion de partida de Matrimonio
function validarPartidaMatrimonio(partidasData) {
    console.log("Validaciones de partida de matrimonio");

    for (let i = 0; i < partidasData.length; i++) {
        const personaActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.persona;

        const partidaMatrimonio = partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio;

        if (partidaMatrimonio) {
            //Valida si tengo partida de matrimonio cargada
            const partidaMatrimonioDe = partidaMatrimonio.persona;
            console.log("Partida de nacimiento de:", personaActual, "Partida de matrimonio de:", partidaMatrimonioDe);

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
            if (coincidenciaPersona === "total") {
                console.log(`Los datos de ${personaActual} en su partida de matrimonio están correctos respecto a su partida de nacimiento.`);
            } else if (coincidenciaPersona === "parcial") {
                console.log(`El nombre de ${personaActual} en su partida de matrimonio podría contener errores respecto a su partida de nacimiento.En su partida de nacimiento el nombre que figura es ${nombresPersonaNacimiento} , y en su partida de matrimonio figura ${nombresPersonaMatrimonio}`);
            } else {
                console.log(`El nombre de ${personaActual} en su partida de matrimonio no coincide con su partida de nacimiento.`);
            }

            // Continúa con las demás validaciones y mensajes necesarios.
        } else {
            console.log("La persona actual no tiene partida de matrimonio registrada.");
        }
    }
}


        // // Validar nombre de persona en partida de matrimonio con partida de nacimiento
        // const nombrePersonaMatrimonio = partidaMatrimonio.persona;
        // const nombrePersonaNacimiento = (partidaNacimientoAnterior) ? partidaNacimientoAnterior.persona : null;

        // if (nombrePersonaNacimiento && nombrePersonaMatrimonio !== nombrePersonaNacimiento) {
        //     console.log(`El nombre de ${nombrePersonaMatrimonio} en su partida de matrimonio no coincide con su partida de nacimiento. El nombre correcto debería ser ${nombrePersonaNacimiento}.`);
        // } else {
        //     console.log(`Los datos de ${nombrePersonaMatrimonio} en su partida de matrimonio están correctos respecto a su partida de nacimiento.`);
        // }

        // // Validar nombres de padres en partida de matrimonio con partida de nacimiento
        // const madreMatrimonio = partidaMatrimonio.hijoDe.madre;
        // const padreMatrimonio = partidaMatrimonio.hijoDe.padre;
        // const madreNacimiento = (partidaNacimientoAnterior) ? partidaNacimientoAnterior.madre : null;
        // const padreNacimiento = (partidaNacimientoAnterior) ? partidaNacimientoAnterior.padre : null;

        // if (madreNacimiento && madreMatrimonio !== madreNacimiento) {
        //     console.log(`El nombre de madre en la partida de matrimonio de ${personaActual} no coincide con el nombre en su partida de nacimiento. El nombre correcto debería ser ${madreNacimiento}.`);
        // }

        // if (padreNacimiento && padreMatrimonio !== padreNacimiento) {
        //     console.log(`El nombre de padre en la partida de matrimonio de ${personaActual} no coincide con el nombre en su partida de nacimiento. El nombre correcto debería ser ${padreNacimiento}.`);
        // }

        // // Validar nombres de padres en partida de matrimonio con nombre de persona de partida de nacimiento anterior
        // if (partidaNacimientoAnterior) {
        //     if (madreMatrimonio !== nombrePersonaNacimiento) {
        //         console.log(`El nombre de madre en la partida de matrimonio de ${personaActual} no contiene errores en relación al nombre en la partida de nacimiento anterior (${nombrePersonaNacimiento}).`);
        //     }

        //     if (padreMatrimonio !== nombrePersonaNacimiento) {
        //         console.log(`El nombre de padre en la partida de matrimonio de ${personaActual} no contiene errores en relación al nombre en la partida de nacimiento anterior (${nombrePersonaNacimiento}).`);
        //     }
        // }


// //TODO: Validar si el nombre de los padres en la partida de nacimiento y partida de matrimonio son iguales

// // Valida si la edadque figura en la partida de matrimonio es correcta
// function calcularEdadEnMatrimonio(fechaNacimiento, fechaMatrimonio) {
//     const nacimiento = new Date(fechaNacimiento);
//     const matrimonio = new Date(fechaMatrimonio);
//     const edadEnMilisegundos = matrimonio - nacimiento;
//     const edad = Math.floor(edadEnMilisegundos / (1000 * 60 * 60 * 24 * 365.25));
//     console.log(edad);

//     return edad;
// }

// function validarEdadMatrimonio(partidasData) {
//     console.log("Validacion edad en la partida de matrimonio");
//     for (let i = 0; i < partidasData.length; i++) {
//         const fechaNacimiento = new Date(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.bday).toISOString();

//         const fechaMatrimonio = new Date(partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.date).toISOString();
    
//         const edadMatrimonioRegistrada = parseInt(partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.age);

//         const edadCalculada = calcularEdadEnMatrimonio(fechaNacimiento, fechaMatrimonio);
            
//         if (edadMatrimonioRegistrada !== edadCalculada) {
//             console.log(`La edad registrada en la partida de matrimonio para ${Object.keys(partidasData[i])[0]} no coincide con la edad calculada. La edad registrada es ${edadMatrimonioRegistrada} y la edad calculada ${edadCalculada}`);
//         } else {
//             console.log(`La edad en la partida de matrimonio para ${Object.keys(partidasData[i])[0]} es correcta.`);
//         }
//     }
// }

// //Validacion de nacionalidad en partida de matrimonio sin api key

// function validarNacionalidad(partidasData) {
//     for (let i = 0; i < partidasData.length; i++) {
//         const nacionalidadMatrimonio = normalizarTexto(partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.bdayPlace);
//         const lugarNacimiento = normalizarTexto(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.lugarNacimiento);

//         if (nacionalidadMatrimonio !== lugarNacimiento) {
//             console.log(`El lugar de nacimieto de la partida de matrimonio para ${Object.keys(partidasData[i])[0]} no coincide con el lugar de nacimiento que figura en su partida de nacimiento. ATENCION: Esta web compara los campos ingresados. Si en la partida de nacimiento figura una localidad de la Provincia de Buenos Aires y en la partida de matrimonio figura Bueno Aires (por ejemplo), va a dar error, pero los datos seria correctos.`);
//         } else {
//             console.log(`La nacionalidad en la partida de matrimonio para ${Object.keys(partidasData[i])[0]} coincide con el lugar de nacimiento.`);
//         }
//     }
// }


// //TODO: lugar de nacimiento "localidad", busca con alguna API a que pais pertenece esa localidad y si ese pais pertenece a la nacionalidad que figura en la partida de matrimonio y ahi realiza la comparacion. 



// //Validar nacionalidad en partida de defuncion sin api: 
// function validarNacionalidadDefuncion(partidasData) {
//     console.log("validar lugar de nacimiento/nacionalidad de la partida de defuncion");
//     for (let i = 0; i < partidasData.length; i++) {
//         const nacionalidadDefuncion = normalizarTexto(partidasData[i][Object.keys(partidasData[i])[0]].partidaDefuncion.bdayPlace);
//         const lugarNacimiento = normalizarTexto(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.lugarNacimiento);

//         if (nacionalidadDefuncion !== lugarNacimiento) {
//             console.log(`El lugar de nacimieto de la partida de matrimonio para ${Object.keys(partidasData[i])[0]} no coincide con el lugar de nacimiento que figura en su partida de nacimiento. ATENCION: Esta web compara los campos ingresados. Si en la partida de nacimiento figura una localidad de la Provincia de Buenos Aires y en la partida de matrimonio figura Bueno Aires (por ejemplo), va a dar error, pero los datos seria correctos.`);
//         } else {
//             console.log(`La nacionalidad en la partida de matrimonio para ${Object.keys(partidasData[i])[0]} coincide con el lugar de nacimiento.`);
//         }
//     }
// }

export  {
    validarPartNacimiento,
    validarPartidaMatrimonio,
    // validarEdadMatrimonio,
    // validarNacionalidad,
    // validarNacionalidadDefuncion,
}

