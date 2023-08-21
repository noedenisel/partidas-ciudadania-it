const form = document.querySelector("[data-avo-form]");
// console.log(form);

export function obtenerDatosPartidaAvo() {
    const name = document.querySelector("[data-avo-name]").value;
    const lastname = document.querySelector("[data-avo-lastname]").value;
    const bdayDate = document.querySelector("[data-avo-bday-date]").value
    const birthPlace = document.querySelector("[data-avo-place]").value;
    const motherName = document.querySelector("[data-avo-mother-name]").value;
    const motherLastname = document.querySelector("[data-avo-mother-lastname]").value;
    const fatherName = document.querySelector("[data-avo-father-name]").value;
    const fatherLastname = document.querySelector("[data-avo-father-lastname]").value;

    const persona = name + " " + lastname;

    const datosPartida = {
        name: name, // Agrega el campo name aquí
        persona: persona,
        bday: bdayDate,
        lugarNacimiento: birthPlace,
        madre: motherName + " " + motherLastname,
        padre: fatherName + " " + fatherLastname,
    };

    console.log("Datos a enviar:", datosPartida);
    return datosPartida;
}

