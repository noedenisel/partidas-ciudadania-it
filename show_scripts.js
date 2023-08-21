document.addEventListener("DOMContentLoaded", function () {
    const dataContainer = document.getElementById("data-container");

    fetch("db.json")
        .then(response => response.json())
        .then(jsonData => {
            displayData(jsonData.partida);
        })
        .catch(error => console.error("Error al cargar los datos:", error));

    function displayData(dataArray) {
        dataArray.forEach(data => {
            const resultHTML = `
                <p>Partida de nacimiento de: ${data.nombre} ${data.apellido}</p>
                <p>Fecha de nacimiento: ${data.datos.bday}</p>
                <p>Lugar de nacimiento: ${data.datos.lugarNacimiento}</p>
                <p>Hijo de ${data.datos.madre[0]} ${data.datos.madre[1]} y de ${data.datos.padre[0]} ${data.datos.padre[1]}</p>
                <hr>
            `;

            const resultElement = document.createElement("div");
            resultElement.classList.add("result");
            resultElement.innerHTML = resultHTML;
            dataContainer.appendChild(resultElement);
        });
    }
});
