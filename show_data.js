// show_data.js
document.addEventListener("DOMContentLoaded", () => {
    fetchPartidas();
});

async function fetchPartidas() {
    try {
        const response = await fetch("http://localhost:3000/partidas");
        const data = await response.json();
        const partidas = data.partidas;
        mostrarPartidasGuardadas(partidas);
    } catch (error) {
        console.error("Error al obtener las partidas:", error);
    }
}

function mostrarPartidasGuardadas(partidas) {
    const partidasContainer = document.getElementById("partidas-container");
    partidasContainer.innerHTML = "<h1>Partidas Registradas</h1>";

    partidas.forEach(partida => {
        const persona = Object.keys(partida)[0];
        const datosPartidaNacimiento = partida[persona].partidaNacimiento;
        const datosPartidaMatrimonio = partida[persona].partidaMatrimonio;
        
        const partidaDiv = document.createElement("div");
        partidaDiv.innerHTML = `
            <h2>Partida de ${persona}</h2>
            <div class="partida-nacimiento">
                <h3>Partida de Nacimiento</h3>
                <p>persona: ${datosPartidaNacimiento.persona}</p>
                <p>bday: ${datosPartidaNacimiento.bday}</p>
                <p>lugarNacimiento: ${datosPartidaNacimiento.lugarNacimiento}</p>
                <p>madre: ${datosPartidaNacimiento.madre}</p>
                <p>padre: ${datosPartidaNacimiento.padre}</p>
            </div>
            <div class="partida-matrimonio">
                <h3>Partida de Matrimonio</h3>
                <p>persona: ${datosPartidaMatrimonio.persona}</p>
                <p>hijoDe: ${JSON.stringify(datosPartidaMatrimonio.hijoDe)}</p>
                <p>conyuge: ${datosPartidaMatrimonio.conyuge}</p>
            </div>
        `;

        // Mostrar mensaje de error de matrimonio si existe
        if (datosPartidaMatrimonio.error) {
            const errorMatrimonioDiv = document.createElement("div");
            errorMatrimonioDiv.innerHTML = `
                <p class="error-message">${datosPartidaMatrimonio.error.mensaje}</p>
                <p class="error-details">Partida de Nacimiento: ${datosPartidaMatrimonio.error.partidaNacimiento}</p>
                <p class="error-details">Partida de Matrimonio: ${datosPartidaMatrimonio.error.partidaMatrimonio}</p>
            `;
            partidaDiv.appendChild(errorMatrimonioDiv);
        }

        partidasContainer.appendChild(partidaDiv);
    });
}


