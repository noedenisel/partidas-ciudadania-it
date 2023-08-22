import {partidasData} from "./show_data";
console.log(partidasData);

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
export function validarPartNacimiento(partidasData ) {
    const progenitor = obtenerNombreApellido(
        partidasData[0][
            Object.keys(partidasData[0])[0]]
                .partidaNacimiento.persona);

    const madre = obtenerNombreApellido(
        partidasData[1][
            Object.keys(partidasData[1])[0]]
                .partidaNacimiento.madre);
    
    const padre = obtenerNombreApellido(partidasData[1][
        Object.keys(partidasData[1])[0]]
            .partidaNacimiento.padre);

    let coincidenciaParcial = false;
    let coincidenciaTotal = true;

    madre.forEach(nombre => {
        if (progenitor.includes(nombre)) {
            coincidenciaParcial = true;
        } else {
            coincidenciaTotal = false;
        }
    });

    padre.forEach(apellido => {
        if (progenitor.includes(apellido)) {
            coincidenciaParcial = true;
        } else {
            coincidenciaTotal = false;
        }
    });

    if (coincidenciaTotal) {
        console.log("Los datos de tu partida de nacimiento están bien.");
    } else if (coincidenciaParcial) {
        const mensaje = `Coincidencia parcial, pero el apellido ${progenitor[1]} no coincide. En tu partida de nacimiento figura "${partidasData[1][Object.keys(partidasData[1])[0]].partidaNacimiento[Object.keys(partidasData[1][Object.keys(partidasData[1])[0]].partidaNacimiento)[3]]}" y su nombre es "${partidasData[0][Object.keys(partidasData[0])[0]].partidaNacimiento.persona}".`;
        console.log(mensaje);
    } else {
        console.log("Los datos de tus padres no coinciden con la partida cargada de tu progenitor.");
    }
}

