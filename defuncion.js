// <!----Partida Defuncion----!>
import {normalizeName} from "./service/partidas-service.js"

const deathForm = document.querySelector("[data-death-form]");

export function obtenerPartidaDefuncion() {
    const name = deathForm.querySelector("[data-death-name]").value;
    const lastname = deathForm.querySelector("[data-death-lastname]").value;
    const dni = deathForm.querySelector("[data-death-dni]").value;
    const bdayDate = deathForm.querySelector("[data-death-bday-date]").value;
    const nacionalidad = deathForm.querySelector("[data-death-nacionalidad]").value;
    const bdayPlace = deathForm.querySelector("[data-death-bday-place]").value;
    const deathDate = deathForm.querySelector("[data-death-date]").value;
    const deathPlace = deathForm.querySelector("[data-death-place]").value;
    const motherName = deathForm.querySelector("[data-death-mother-name]").value;
    const motherLastname = deathForm.querySelector("[data-death-mother-lastname]").value;
    const fatherName = deathForm.querySelector("[data-death-father-name]").value;
    const fatherLastname = deathForm.querySelector("[data-death-father-lastname]").value;

    if (
        name === "" ||
        lastname === "" ||
        bdayDate === "" ||
        nacionalidad === "" ||
        bdayPlace === "" ||
        deathDate === "" 
    ) {
        return null; 
    }

    const dataDeath = {
        person: normalizeName(name) + " " + normalizeName(lastname),
        bdayDate: bdayDate,
        dni: dni,
        bdayPlace: normalizeName(bdayPlace),
        hijoDe: {
            madre: normalizeName(motherName) + " " + normalizeName(motherLastname),
            padre: normalizeName(fatherName) + " " + normalizeName(fatherLastname),
        },
        deathDate: deathDate,
        deathPlace: normalizeName(deathPlace),
      
     };

    return dataDeath;
}

