// <!----Partida Defuncion----!>
const deathForm = document.querySelector("[data-death-form]");
export function obtenerPartidaDefuncion() {

    const name = deathForm.querySelector("[data-name]").value;
    const lastname = deathForm.querySelector("[data-lastname]").value;
    const dni = deathForm.querySelector("[data-dni]").value;
    const bdayDate = deathForm.querySelector("[data-bday-date]").value
    const bdayPlace = deathForm.querySelector("[data-bday-place]").value;
    const deathDate = deathForm.querySelector("[data-death-date]").value
    const deathPlace = deathForm.querySelector("[data-death-place]").value;


    const dataDeath ={
        person : name+ " "+ lastname,
        bdayDate: bdayDate,
        dni: dni,
        bdayPlace: bdayPlace,
        deathDate: deathDate,
        deathPlace: deathPlace
    }

    console.log("Datos a enviar partida defuncion:", dataDeath);
    return dataDeath
}


