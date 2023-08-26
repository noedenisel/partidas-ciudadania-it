// <!----Partida Defuncion----!>

const deathForm = document.querySelector("[data-death-form]");

// Función para normalizar nombres y apellidos
function normalizeName(name) {
    const words = name.toLowerCase().split(/[ /]/);
    const normalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    return normalized;
}

export function obtenerPartidaDefuncion() {
    const name = deathForm.querySelector("[data-name]").value;
    const lastname = deathForm.querySelector("[data-lastname]").value;
    const dni = deathForm.querySelector("[data-dni]").value;
    const bdayDate = deathForm.querySelector("[data-bday-date]").value;
    const bdayPlace = deathForm.querySelector("[data-bday-place]").value;
    const deathDate = deathForm.querySelector("[data-death-date]").value;
    const deathPlace = deathForm.querySelector("[data-death-place]").value;

    const dataDeath = {
        person: normalizeName(name) + " " + normalizeName(lastname),
        bdayDate: bdayDate,
        dni: dni,
        bdayPlace: normalizeName(bdayPlace),
        deathDate: deathDate,
        deathPlace: normalizeName(deathPlace)
    };

    console.log("Datos a enviar partida defuncion:", dataDeath);
    return dataDeath;
}

