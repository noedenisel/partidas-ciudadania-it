import {  validarPartNacimiento,
    validarPartidaMatrimonio,


    validarNacionalidadDefuncion
    } from "./validaciones.js"
     

document.addEventListener("DOMContentLoaded", () => {
    const partidasContainer = document.getElementById("info-partidas");
    
    const partidasGuardadas = JSON.parse(localStorage.getItem("partidasGuardadas")) || [];
    
        partidasGuardadas.forEach((partida, index) => {
            const personaName = Object.keys(partida)[0];
            const partidaData = partida[personaName];
    
            const partidaDiv = document.createElement("div");
            partidaDiv.classList.add("partida-container");
    
            // Agregar el título de la partida de nacimiento
            const partidaNacimientoTitle = document.createElement("h3");
            partidaNacimientoTitle.textContent = `Partidas cargadas de ${partida[personaName].partidaNacimiento.persona}`;
            partidaDiv.appendChild(partidaNacimientoTitle);
    
            // Agregar la información de la partida de nacimiento
            const partidaNacimientoInfo = document.createElement("div");
            partidaNacimientoInfo.innerHTML = `
                <h2>Partida de nacimiento</h2>
                <p>Nombre: ${partida[personaName].partidaNacimiento.persona}</p>
                <p>Fecha de nacimiento: ${partida[personaName].partidaNacimiento.bday}</p>
                <p>Lugar de nacimiento: ${partida[personaName].partidaNacimiento.lugarNacimiento}</p>
                <p>Sexo: ${partida[personaName].partidaNacimiento.sexo}</p>
                <p>Hijo de: ${partida[personaName].partidaNacimiento.padre} y ${partida[personaName].partidaNacimiento.madre}</p>
            `;
            partidaDiv.appendChild(partidaNacimientoInfo);
    
            // Si hay partida de matrimonio, agregar la información
            if (partidaData.partidaMatrimonio) {
                const partidaMatrimonioInfo = document.createElement("div");
                partidaMatrimonioInfo.innerHTML = `
                    <h2>Partida de matrimonio</h2>
                    <p>Nombre: ${partidaData.partidaMatrimonio.persona}</p>
                    <p>Edad: ${partidaData.partidaMatrimonio.age}</p>
                    <p>Nacionalidad: ${partidaData.partidaMatrimonio.nacionalidad}</p>
                    <p>Lugar de nacimiento: ${partidaData.partidaMatrimonio.bdayPlace}</p>
                    <p>Hijo de: ${partidaData.partidaMatrimonio.hijoDe.padre} y ${partidaData.partidaMatrimonio.hijoDe.madre}</p>
                    <p>Conyuge</p>
                    <p>Celebrado el: ${partidaData.partidaMatrimonio.date}</p>
           
                `;
                partidaDiv.appendChild(partidaMatrimonioInfo);
            } else {
                // Si no hay partida de matrimonio, mostrar un mensaje
                const noMatrimonioInfo = document.createElement("p");
                noMatrimonioInfo.textContent = `${partida[personaName].partidaNacimiento.persona} no tiene cargada partida de matrimonio`;
                partidaDiv.appendChild(noMatrimonioInfo);
            }
    
            // Si hay partida de defunción, agregar la información
            if (partidaData.partidaDefuncion) {
                const partidaDefuncionInfo = document.createElement("div");
                partidaDefuncionInfo.innerHTML = `
                    <h2>Partida de defunción</h2>
                    <p>Nombre: ${partidaData.partidaDefuncion.persona}</p>
                    <p>Fecha de Nacimiento: ${partidaData.partidaDefuncion.bdayDate}</p>
                    <p>Nacionalidad: ${partidaData.partidaDefuncion.nacionalidad}</p>
                    <p>Lugar de nacimiento: ${partidaData.partidaDefuncion.bdayPlace}</p>
                    <p>DNI: ${partidaData.partidaDefuncion.dni}</p>
                    <p>Hijo de: ${partidaData.partidaDefuncion.hijoDe.padre} y ${partidaData.partidaDefuncion.hijoDe.madre}</p>
                   
                    <p>Fecha de defunción: ${partidaData.partidaDefuncion.deathDate}</p>
                    <p>Lugar de defunción: ${partidaData.partidaDefuncion.deathPlace}</p>
                `;
                partidaDiv.appendChild(partidaDefuncionInfo);
            } else {
                // Si no hay partida de defunción, mostrar un mensaje
                const noDefuncionInfo = document.createElement("p");
                noDefuncionInfo.textContent = `${partida[personaName].partidaNacimiento.persona} no tiene cargada partida de defunción`;
                partidaDiv.appendChild(noDefuncionInfo);
            }
    
            partidasContainer.appendChild(partidaDiv);
        });
    
        const validarPartidasButton = document.getElementById("validar-partidas");
        validarPartidasButton.addEventListener("click", () => {
            validarPartNacimiento(partidasGuardadas);
            validarPartidaMatrimonio(partidasGuardadas);
      
       
            validarNacionalidadDefuncion(partidasGuardadas);
        });
    });
    
    