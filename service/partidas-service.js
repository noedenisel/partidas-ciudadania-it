// console.log("client service conectado");

async function savePartida(dbData) {
     console.log("Datos a enviar al servidor:", dbData);
 
    try {
        const response = await fetch('http://localhost:3000/partidas', {
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
    fetch("http://localhost:3000/partidas")
    .then( respuesta => respuesta.json()
  )


export const partidaServices = {
    savePartida,
    listaPartidas
}

