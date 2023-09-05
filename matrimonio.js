// <!----Agregar Matrimonio----!>

const marriageForm = document.querySelector("[data-marriage-form]");

// Función para normalizar nombres y apellidos
function normalizeName(name) {
    const words = name.toLowerCase().split(/[ /]/);
    const normalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    return normalized;
}

export function obtenerDatosPartidaMatrimonio() {
    const name = marriageForm.querySelector("[data-marriage-name]").value;
    const lastname = marriageForm.querySelector("[data-marriage-lastname]").value;
    const age = marriageForm.querySelector("[data-marriage-age]").value;
    const nacionalidad = marriageForm.querySelector("[data-marriage-nacionalidad]").value;
    const bdayPlace = marriageForm.querySelector("[data-marriage-bday-place]").value;
    const motherName = marriageForm.querySelector("[data-marriage-mother-name]").value;
    const motherLastname = marriageForm.querySelector("[data-marriage-mother-lastname]").value;
    const fatherName = marriageForm.querySelector("[data-marriage-father-name]").value;
    const fatherLastname = marriageForm.querySelector("[data-marriage-father-lastname]").value;
    const conyugeName = marriageForm.querySelector("[data-marriage-conyuge-name]").value;
    const conyugeLastname = marriageForm.querySelector("[data-marriage-conyuge-lastname]").value;

    const marriageDate = marriageForm.querySelector("[data-marriage-marriage-date]").value;
   

  // Verificar si algún campo obligatorio está vacío
  if (
    name === "" ||
    lastname === "" ||
    age === "" ||
    nacionalidad === "" ||
    bdayPlace === "" ||
  
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
     
    };

    return dataMatrimonio;
}
