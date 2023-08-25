// console.log("client service conectado");

async function savePartida(dbData) {
     console.log("Datos a enviar al servidor:", dbData);
 
    try {
        const response = await fetch('https://partidas-ciudadania-it.vercel.app/partidas', {
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
    fetch('https://partidas-ciudadania-it.vercel.app/partidas')
    .then( respuesta => respuesta.json()
  )


export const partidaServices = {
    savePartida,
    listaPartidas
}

