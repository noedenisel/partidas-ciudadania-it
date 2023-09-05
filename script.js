import { obtenerDatosPartidaAvo } from "./partida.js";
import { obtenerDatosPartidaMatrimonio } from "./matrimonio.js";
import { obtenerPartidaDefuncion } from "./defuncion.js";

const btnMatrimonio = document.getElementById("btn-matrimonio");
const btnDefuncion = document.getElementById("btn-defuncion");
const partidaMatrimonioForm = document.querySelector(".partida-matrimonio");
const partidaDefuncionForm = document.querySelector(".partida-defuncion");

let isMatrimonioFormActive = false;
let isDefuncionFormActive = false;

btnMatrimonio.addEventListener("click", () => {
  console.log("Botón Matrimonio clicado");
  partidaMatrimonioForm.style.display = "block";
  btnMatrimonio.style.display = "none";
  isMatrimonioFormActive = true;
});

btnDefuncion.addEventListener("click", () => {
  console.log("Botón Defunción clicado");
  partidaDefuncionForm.style.display = "block";
  btnDefuncion.style.display = "none";
  isDefuncionFormActive = true;
});

const partidas = []; // Crear un arreglo de partidas

const saveButton = document.querySelector("[type='submit']");

// Escucha el evento "click" en el botón de guardar
saveButton.addEventListener("click", async function (event) {
  event.preventDefault();

  let isValid = true; // Variable para rastrear la validez de los formularios

  // Valida los campos requeridos en la partida de nacimiento
  const partidaNacimientoForm = document.querySelector("[data-avo-form]");
  const requiredInputsNacimiento = partidaNacimientoForm.querySelectorAll("[required]");
  console.log("isValid antes de la validación:", isValid);
  console.log("requiredInputsNacimiento:", requiredInputsNacimiento);

  requiredInputsNacimiento.forEach((input) => {
    if (!input.value.trim()) {
      isValid = false;
      const errorMessage = input.getAttribute("data-error-message");
      const errorElement = document.getElementById(`${input.id}-error`);
      console.log(`${input.id}-error:`, errorMessage);
      if (errorElement) {
        errorElement.textContent = errorMessage;
      }
    }
  });

  // Valida los campos requeridos en el formulario de matrimonio si está activo
  if (isMatrimonioFormActive) {
    const partidaMatrimonio = document.querySelector("[data-marriage-form]");
    const requiredInputsMatrimonio = partidaMatrimonio.querySelectorAll("[required]");
    console.log("Mensajes de error configurados en Matrimonio:");
    requiredInputsMatrimonio.forEach((input) => {
      const errorMessage = input.getAttribute("data-error-message");
      const errorElement = document.getElementById(`${input.id}-error`);
      console.log(`${input.id}-error:`, errorMessage);
    });
    requiredInputsMatrimonio.forEach((input) => {
      if (!input.value.trim()) {
        isValid = false;
        const errorMessage = input.getAttribute("data-error-message");
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) {
          errorElement.textContent = errorMessage;
        }
      }
    });
  }

  // Valida los campos requeridos en la partida de defunción si está activa
  if (isDefuncionFormActive) {
    const partidaDefuncion = document.querySelector("[data-death-form]");
    const requiredInputsDefuncion = partidaDefuncion.querySelectorAll("[required]");
    console.log("Mensajes de error configurados en Defunción:");
    requiredInputsDefuncion.forEach((input) => {
      const errorMessage = input.getAttribute("data-error-message");
      const errorElement = document.getElementById(`${input.id}-error`);
      console.log(`${input.id}-error:`, errorMessage);
    });

    requiredInputsDefuncion.forEach((input) => {
      if (!input.value.trim()) {
        isValid = false;
        const errorMessage = input.getAttribute("data-error-message");
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) {
          errorElement.textContent = errorMessage;
        }
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
          sexo: datosPartida.sexo,
          bday: datosPartida.bday,
          lugarNacimiento: datosPartida.lugarNacimiento,
          madre: datosPartida.madre,
          padre: datosPartida.padre,
        },
        partidaMatrimonio: datosMatrimonio,
        partidaDefuncion: datosDefuncion,
      },
      id: partidas.length + 1, 
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
  window.location.href = "https://partidas-ciudadania-it.vercel.app/"; 
}

function guardarPartidaEnAlmacenamientoLocal(partida) {
  // Obtiene las partidas previamente guardadas en el almacenamiento local (si existen)
  const partidasGuardadas = JSON.parse(localStorage.getItem("partidasGuardadas")) || [];

  // Agrega la nueva partida a la lista
  partidasGuardadas.push(partida);

  // Guarda la lista actualizada en el almacenamiento local
  localStorage.setItem("partidasGuardadas", JSON.stringify(partidasGuardadas));
}


