// <!----Agregar Matrimonio----!>
const marriageForm = document.querySelector("[data-marriage-form]");

export function obtenerDatosPartidaMatrimonio () {

    const name = marriageForm.querySelector("[data-name]").value;
    const lastname = marriageForm.querySelector("[data-lastname]").value
    const age = marriageForm.querySelector("[data-age]").value;
    const nacionalidad = marriageForm.querySelector("[data-nacionalidad]").value;
    const bdayPlace = marriageForm.querySelector("[data-bday-place]").value;
    const motherName = marriageForm.querySelector("[data-mother-name]").value;
    const motherlastname = marriageForm.querySelector("[data-mother-lastname]").value;
    const fatherName = marriageForm.querySelector("[data-father-name]").value;
    const fatherlastname = marriageForm.querySelector("[data-father-lastname]").value;
    const conyugeName = marriageForm.querySelector("[data-conyuge-name]").value;
    const conyugelastname = marriageForm.querySelector("[data-conyuge-lastname]").value;
    
    const marriageDate = marriageForm.querySelector("[data-marriage-date]").value
    const marriagePlace = marriageForm.querySelector("[data-marriage-place]").value;

    const dataMatrimonio ={
        persona : name + " " +lastname,
        hijoDe: {
            madre: motherName + " " + motherlastname ,
            padre: fatherName + " " + fatherlastname
        },
        age: age,
        nacionalidad: nacionalidad,
        bdayPlace: bdayPlace,
        conyuge:conyugeName + " " + conyugelastname,
        date: marriageDate,
        place: marriagePlace
    }

    console.log("Datos a enviar:", dataMatrimonio);
    return dataMatrimonio
}

