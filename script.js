import { partidaServices } from "./service/partidas-service.js";
import { obtenerDatosPartidaAvo } from "./partida.js";
import { obtenerDatosPartidaMatrimonio } from "./matrimonio.js";
import { obtenerPartidaDefuncion } from "./defuncion.js";

const btnMatrimonio = document.getElementById("btn-matrimonio");
const btnDefuncion = document.getElementById("btn-defuncion");

const partidaMatrimonioForm = document.querySelector(".partida-matrimonio");
const partidaDefuncionForm = document.querySelector(".partida-defuncion");

btnMatrimonio.addEventListener("click", () => {
  partidaMatrimonioForm.style.display = "block";
  btnMatrimonio.style.display = "none";
});

btnDefuncion.addEventListener("click", () => {
  partidaDefuncionForm.style.display = "block";
  btnDefuncion.style.display = "none";
});

const partidas = []; // Crear un arreglo de partidas

const saveButton = document.querySelector("[type='submit']");

// Escucha el evento "click" en el botón de guardar
saveButton.addEventListener("click", async function (event) {
  let isValid = true; // Variable para rastrear la validez de los formularios

  // Valida los campos requeridos en la partida de nacimiento
  const partidaNacimientoForm = document.querySelector("[data-avo-form]");
  const requiredInputsNacimiento = partidaNacimientoForm.querySelectorAll("[required]");
  requiredInputsNacimiento.forEach((input) => {
    if (!input.value.trim()) {
      isValid = false;
    }
  });

  // Valida los campos requeridos en la partida de matrimonio si está activa
  if (partidaMatrimonioForm.style.display === "block") {
    const partidaMatrimonio = document.querySelector("[data-marriage-form]");
    const requiredInputsMatrimonio = partidaMatrimonio.querySelectorAll("[required]");
    requiredInputsMatrimonio.forEach((input) => {
      if (!input.value.trim()) {
        isValid = false;
      }
    });
  }

  // Valida los campos requeridos en la partida de defunción si está activa
  if (partidaDefuncionForm.style.display === "block") {
    const partidaDefuncion = document.querySelector("[data-death-form]");
    const requiredInputsDefuncion = partidaDefuncion.querySelectorAll("[required]");
    requiredInputsDefuncion.forEach((input) => {
      if (!input.value.trim()) {
        isValid = false;
      }
    });
  }

  if (!isValid) {
    // Si algún campo requerido no está completo, evita el envío y muestra un mensaje de error
    alert("Por favor, complete todos los campos requeridos en los formularios activos.");
    event.preventDefault(); // Evita que el formulario se envíe
  } else {
    // Si todos los formularios son válidos, continúa con el envío del formulario
    const datosPartida = obtenerDatosPartidaAvo();
    const datosMatrimonio = obtenerDatosPartidaMatrimonio();
    const datosDefuncion = obtenerPartidaDefuncion();

    const partida = {
      [datosPartida.name]: {
        partidaNacimiento: {
          persona: datosPartida.persona,
          bday: datosPartida.bday,
          lugarNacimiento: datosPartida.lugarNacimiento,
          madre: datosPartida.madre,
          padre: datosPartida.padre,
        },
        partidaMatrimonio: datosMatrimonio,
        partidaDefuncion: datosDefuncion,
      },
      id: partidas.length + 1, // Genera el ID según tu lógica
    };

    partidas.push(partida);

    // Limpia el formulario
    limpiarFormulario();

    // Imprime las partidas
    console.log("Partidas:", partidas);

    // Guarda las partidas en el almacenamiento local
    guardarPartidaEnAlmacenamientoLocal(partida);

    // Mostrar todas las partidas guardadas de manera más legible en la consola
    const partidasGuardadas = JSON.parse(
      localStorage.getItem("partidasGuardadas")
    );

    partidasGuardadas.forEach((partida, index) => {
      console.log(`Partida ${index + 1}:`);
      console.log(partida);
    });

    // Mostrar un mensaje al usuario confirmando que los datos se han guardado en el almacenamiento local.
    alert("Partida guardada correctamente. Puede agregar más partidas o hacer clic en visualizar partidas para ver todas las partidas guardadas");
  }
});

function limpiarFormulario() {
  const inputs = document.querySelectorAll("input[type='text'], input[type='number'], input[type='date']");
  inputs.forEach((input) => {
    input.value = ""; // Limpia el valor de cada campo
  });
}

function guardarPartidaEnAlmacenamientoLocal(partida) {
  // Obtiene las partidas previamente guardadas en el almacenamiento local (si existen)
  const partidasGuardadas = JSON.parse(localStorage.getItem("partidasGuardadas")) || [];

  // Agrega la nueva partida a la lista
  partidasGuardadas.push(partida);

  // Guarda la lista actualizada en el almacenamiento local
  localStorage.setItem("partidasGuardadas", JSON.stringify(partidasGuardadas));
}
