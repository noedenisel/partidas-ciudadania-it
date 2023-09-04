// console.log("client service conectado");

// Función para normalizar nombres y apellidos
// function normalizeName(name) {
//     const words = name.toLowerCase().split(/[ /]/);
//     const normalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
//     return normalized;
// }

async function savePartida(dbData) {
     console.log("Datos a enviar al servidor:", dbData);
 
    try {
        const response = await fetch('https://partidas-ciudadania-it.vercel.app/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dbData)
        });
        return await response.json();
    } catch (error) {
        console.error("Error al enviar los datos:", error);
    }
}

const listaPartidas = () => 
    fetch("https://partidas-ciudadania-it.vercel.app/")
    .then( respuesta => respuesta.json()
  )

export const partidaServices = {
    // normalizeName,
    savePartida,
    listaPartidas,
}

