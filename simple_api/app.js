//FETCH

//Use the real port of the Express server
const expressSeverPort = 3000;

const main = async () => {
    //retrieve all the bags
    const response = await fetch(`http://localhost:${expressSeverPort}/bags/1`);
    if (response.ok){
        //the server returns: return res.status(HttpStatusCodes.OK).json(bags);
        const responseBody = await response.text();
        //show in index.html 
        document.getElementById("bags").innerHTML = responseBody
    } else {
        console.error("Error fetching bags:", response.statusText);
        document.getElementById("bags").innerHTML = "Error fetching bags: " + response.statusText;
    }

}


main();