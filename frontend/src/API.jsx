//Here I define all the API calls to the Express server
//using fetch

const expressServerPort = 3000;
const SERVER_URL = `http://localhost:${expressServerPort}`;

async function getAllEstablishments() {
    const response = await fetch(`${SERVER_URL}/establishments`);
    if (response.ok){
        const data = await response.json();
        //id, name, bags, estType, address
        return data.map((est) => ({id: est.id, name: est.name, bags: est.bags, estType: est.estType, address: est.address}));
    }
}


const API = {getAllEstablishments};
export default API;