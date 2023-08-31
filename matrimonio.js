// <!----Agregar Matrimonio----!>

const marriageForm = document.querySelector("[data-marriage-form]");

// Función para normalizar nombres y apellidos
function normalizeName(name) {
    const words = name.toLowerCase().split(/[ /]/);
    const normalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    return normalized;
}

export function obtenerDatosPartidaMatrimonio() {
    const name = marriageForm.querySelector("[data-name]").value;
    const lastname = marriageForm.querySelector("[data-lastname]").value;
    const age = marriageForm.querySelector("[data-age]").value;
    const nacionalidad = marriageForm.querySelector("[data-nacionalidad]").value;
    const bdayPlace = marriageForm.querySelector("[data-bday-place]").value;
    const motherName = marriageForm.querySelector("[data-mother-name]").value;
    const motherLastname = marriageForm.querySelector("[data-mother-lastname]").value;
    const fatherName = marriageForm.querySelector("[data-father-name]").value;
    const fatherLastname = marriageForm.querySelector("[data-father-lastname]").value;
    const conyugeName = marriageForm.querySelector("[data-conyuge-name]").value;
    const conyugeLastname = marriageForm.querySelector("[data-conyuge-lastname]").value;

    const marriageDate = marriageForm.querySelector("[data-marriage-date]").value;
    const marriagePlace = marriageForm.querySelector("[data-marriage-place]").value;

  // Verificar si algún campo obligatorio está vacío
  if (
    name === "" ||
    lastname === "" ||
    age === "" ||
    nacionalidad === "" ||
    bdayPlace === "" ||
    motherName === "" ||
    motherLastname === "" ||
    fatherName === "" ||
    fatherLastname === "" ||
    conyugeName === "" ||
    conyugeLastname === "" ||
    marriageDate === "" 
) {
    return null; 
}

    const dataMatrimonio = {
        persona: normalizeName(name) + " " + normalizeName(lastname),
        hijoDe: {
            madre: normalizeName(motherName) + " " + normalizeName(motherLastname),
            padre: normalizeName(fatherName) + " " + normalizeName(fatherLastname),
        },
        age: age,
        nacionalidad: normalizeName(nacionalidad),
        bdayPlace: normalizeName(bdayPlace),
        conyuge: normalizeName(conyugeName) + " " + normalizeName(conyugeLastname),
        date: marriageDate,
        place: normalizeName(marriagePlace)
    };

    console.log("Datos a enviar partida de matrimonio:", dataMatrimonio);
    return dataMatrimonio;
}
