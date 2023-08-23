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

    console.log("validaciones de partida de nacimiento");

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
    //Compara nombre de padres con el nombre del padre que le da la ciudadania

function validarPartidaMatrimonio(partidasData){  
    console.log("Validaciones partida de matrimonio");

    //Validacion nombre padres
    for (let i = 1; i < partidasData.length; i++) {
        
        const personaAnterior = partidasData[i - 1][Object.keys(partidasData[i - 1])[0]].partidaNacimiento.persona;
        const [nombreAnterior, apellidoAnterior] = obtenerNombreApellido(personaAnterior);

        const personaActual = partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.persona;
        const madreActual = obtenerNombreApellido(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.madre);
        const padreActual = obtenerNombreApellido(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.padre);

        const hijoDe = partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.hijoDe;
        
        const hijoDeMadre = obtenerNombreApellido(hijoDe.madre);
  
        const hijoDePadre = obtenerNombreApellido(hijoDe.padre);

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
        console.log(mensajeCoincidencia);

    }
}

//TODO: Validar si el nombre de los padres en la partida de nacimiento y partida de matrimonio son iguales

// Valida si la edadque figura en la partida de matrimonio es correcta
function calcularEdadEnMatrimonio(fechaNacimiento, fechaMatrimonio) {
    const nacimiento = new Date(fechaNacimiento);
    const matrimonio = new Date(fechaMatrimonio);
    const edadEnMilisegundos = matrimonio - nacimiento;
    const edad = Math.floor(edadEnMilisegundos / (1000 * 60 * 60 * 24 * 365.25));
    console.log(edad);

    return edad;
}

function validarEdadMatrimonio(partidasData) {
    console.log("Validacion edad en la partida de matrimonio");
    for (let i = 0; i < partidasData.length; i++) {
        const fechaNacimiento = new Date(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.bday).toISOString();

        const fechaMatrimonio = new Date(partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.date).toISOString();
    
        const edadMatrimonioRegistrada = parseInt(partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.age);

        const edadCalculada = calcularEdadEnMatrimonio(fechaNacimiento, fechaMatrimonio);
            
        if (edadMatrimonioRegistrada !== edadCalculada) {
            console.log(`La edad registrada en la partida de matrimonio para ${Object.keys(partidasData[i])[0]} no coincide con la edad calculada. La edad registrada es ${edadMatrimonioRegistrada} y la edad calculada ${edadCalculada}`);
        } else {
            console.log(`La edad en la partida de matrimonio para ${Object.keys(partidasData[i])[0]} es correcta.`);
        }
    }
}

//Validacion de nacionalidad en partida de matrimonio sin api key

function validarNacionalidad(partidasData) {
    for (let i = 0; i < partidasData.length; i++) {
        const nacionalidadMatrimonio = normalizarTexto(partidasData[i][Object.keys(partidasData[i])[0]].partidaMatrimonio.bdayPlace);
        const lugarNacimiento = normalizarTexto(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.lugarNacimiento);

        if (nacionalidadMatrimonio !== lugarNacimiento) {
            console.log(`El lugar de nacimieto de la partida de matrimonio para ${Object.keys(partidasData[i])[0]} no coincide con el lugar de nacimiento que figura en su partida de nacimiento. ATENCION: Esta web compara los campos ingresados. Si en la partida de nacimiento figura una localidad de la Provincia de Buenos Aires y en la partida de matrimonio figura Bueno Aires (por ejemplo), va a dar error, pero los datos seria correctos.`);
        } else {
            console.log(`La nacionalidad en la partida de matrimonio para ${Object.keys(partidasData[i])[0]} coincide con el lugar de nacimiento.`);
        }
    }
}


//TODO: lugar de nacimiento "localidad", busca con alguna API a que pais pertenece esa localidad y si ese pais pertenece a la nacionalidad que figura en la partida de matrimonio y ahi realiza la comparacion. 



//Validar nacionalidad en partida de defuncion sin api: 
function validarNacionalidadDefuncion(partidasData) {
    console.log("validar lugar de nacimiento/nacionalidad de la partida de defuncion");
    for (let i = 0; i < partidasData.length; i++) {
        const nacionalidadDefuncion = normalizarTexto(partidasData[i][Object.keys(partidasData[i])[0]].partidaDefuncion.bdayPlace);
        const lugarNacimiento = normalizarTexto(partidasData[i][Object.keys(partidasData[i])[0]].partidaNacimiento.lugarNacimiento);

        if (nacionalidadDefuncion !== lugarNacimiento) {
            console.log(`El lugar de nacimieto de la partida de matrimonio para ${Object.keys(partidasData[i])[0]} no coincide con el lugar de nacimiento que figura en su partida de nacimiento. ATENCION: Esta web compara los campos ingresados. Si en la partida de nacimiento figura una localidad de la Provincia de Buenos Aires y en la partida de matrimonio figura Bueno Aires (por ejemplo), va a dar error, pero los datos seria correctos.`);
        } else {
            console.log(`La nacionalidad en la partida de matrimonio para ${Object.keys(partidasData[i])[0]} coincide con el lugar de nacimiento.`);
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

//TODO: 
//QUE SE PUEDAN INGRESAR MAYUSCULAS/MINUSCULAS O UNA COMBINACION
//NO ESTA NORMALIZANDO BIEN LOS DATOS: LUGAR DE NAC DE GABRIEL Caba, lugar de nac en partida de matrimonio CABA y lo toma como error