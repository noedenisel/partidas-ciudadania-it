    // <!----Agregar progenitor----!>

    const addProgenitorButton = document.getElementById("add-progenitor-button");
    const progenitorFormContainer = document.getElementById("progenitor-form-container");

    addProgenitorButton.addEventListener("click", function () {
        const progenitorFormHTML = `
        <Form id="progenitor-form">
        <h3>Insertar Datos de la partida de nacimiento de tu Progenitor</h3>
        <label for="progenitor-name">Nombre</label>
            <input type="text" name="progenitor-name">
        <label for="progenitor-lastname">Apellido</label>
            <input type="text" name="progenitor-lastname">
        <label for="progenitor-bday-date">Fecha de Nacimiento</label>
            <input type="date" name="progenitor-bday-date">
        <label for="place" name="progenitor-bday-place">Lugar de nacimiento</label>
            <input type="text" name="progenitor-bday-place">
        <label for="death-date">Fecha de Defuncion</label>
            <input type="date" name="progenitor-death-date">
        
            <br>

        <h3>Hijo de</h3>
        <h4>Madre</h4>
            <label for="progenitor-mother-name">Nombre</label>
                <input type="text" name="progenitor-mother-name">
            <label for="progenitor-mother-lastname">Apellido</label>
                <input type="text" name="progenitor-mother-lastname">
        <h4>Padre</h4>
            <label for="progenitor-father-name">Nombre</label>
                <input type="text" name="progenitor-father-name">
            <label for="progenitor-father-lastname">Apellido</label>
                <input type="text" name="progenitor-father-lastname">

                <br>
                <button type="submit">Enviar Progenitor</button>

    
    </Form>
        `;
       
        progenitorFormContainer.innerHTML = progenitorFormHTML;

        const progenitorResultForm = document.getElementById("progenitor-form");

        progenitorResultForm.addEventListener("submit", function (event) {
        event.preventDefault();

            const progenitorName = document.querySelector('input[name="progenitor-name"]').value;
            const progenitorlastname = document.querySelector('input[name="progenitor-lastname"]').value;
            const progenitorBdayDate = document.querySelector('input[name="progenitor-bday-date"]').value;
            const progenitorDeathDate = document.querySelector('input[name="progenitor-death-date"]').value;
            const progenitorBirthPlace = document.querySelector('input[name="progenitor-bday-place"]').value;
            const progenitorMotherName = document.querySelector('input[name="progenitor-mother-name"]').value;
            const progenitorMotherlastname = document.querySelector('input[name="progenitor-mother-lastname"]').value;
            const progenitorFatherName = document.querySelector('input[name="progenitor-father-name"]').value;
            const progenitorFatherlastname = document.querySelector('input[name="progenitor-father-lastname"]').value;
        
        const progenitorResultHTML = `
            <p>Partida de nacimiento del progenitor: ${progenitorName} ${progenitorlastname}</p>
            <p>Nacido el: ${progenitorBdayDate}</p>
            <p>Lugar de nacimiento: ${progenitorBirthPlace}</p>
            <p>Fecha de defuncion: ${progenitorDeathDate}</p>
            <p>Hijo de ${progenitorMotherName} ${progenitorMotherlastname} y de ${progenitorFatherName} ${progenitorFatherlastname}</p>
              `;

        const progenitorResultContainer = document.getElementById("progenitor-result-container");
        const resultElement = document.createElement("div");
        resultElement.classList.add("result");
        resultElement.innerHTML = progenitorResultHTML;
        progenitorResultContainer.appendChild(resultElement);

    });
})
