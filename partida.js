// Función para normalizar nombres y apellidos
function normalizeName(name) {
    const words = name.toLowerCase().split(/[ /]/);
    const normalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    return normalized;
}

// Obtener datos de la partida de nacimiento
export function obtenerDatosPartidaAvo() {
    const name = document.querySelector("[data-avo-name]").value;
    const lastname = document.querySelector("[data-avo-lastname]").value;
    const bdayDate = document.querySelector("[data-avo-bday-date]").value;
    const birthPlace = document.querySelector("[data-avo-place]").value;
    const sex = document.querySelector("[data-avo-sex]").value;
    const motherName = document.querySelector("[data-avo-mother-name]").value;
    const motherLastname = document.querySelector("[data-avo-mother-lastname]").value;
    const fatherName = document.querySelector("[data-avo-father-name]").value;
    const fatherLastname = document.querySelector("[data-avo-father-lastname]").value;




    const persona = normalizeName(name) + " " + normalizeName(lastname)

    
    const datosPartida = {
        name: normalizeName(name),
        lastname: normalizeName(lastname),
        persona: persona,
        bday: bdayDate,
        lugarNacimiento: normalizeName(birthPlace),
        sexo: sex,
        madre: normalizeName(motherName) + " " + normalizeName(motherLastname),
        padre: normalizeName(fatherName) + " " + normalizeName(fatherLastname),
        
    };

    console.log("Datos a enviar partida de nacimiento:", datosPartida);

    return datosPartida;
}
