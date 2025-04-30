//This simple server mock up the React server
//It's used to test the fetches

import express from 'express';
import path from 'path';

const app = express();
//use the real port that will be used by the React server
const ReactServerPort = 5173; 

app.use(express.static('./'))

app.get("/", (req, res) => {
    res.sendFile('index.html');
});

app.listen(ReactServerPort, () => {
    console.log("simple_api server is running on http://localhost:" + ReactServerPort);
});