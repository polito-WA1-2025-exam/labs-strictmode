import express from "express";
import morgan from 'morgan';
import cors from 'cors';

import {createBagsRouter} from "./routes/bags.mjs";
import {createUsersRouter} from "./routes/users.mjs";
import {createCartsRouter} from "./routes/carts.mjs";
import {createEstablishmentsRouter} from "./routes/establishments.mjs";
import {createReservationsRouter} from "./routes/reservations.mjs";

// repos: { bagRepo, userRepo, cartRepo, resRepo, estRepo }
export function createServer(repos) {
    const server = express();

    /* MIDDLEWARES */
    // morgan used for logging about requests on the terminal
    server.use(morgan("dev"));
    // register json middleware to send data in json format
    server.use(express.json());

    // register cors middleware to allow cross-origin requests
    //React appp runs on http://localhost:5173
    const ReactServerPort = 5173; 
    const corsOPtions = {
        origin: `http://localhost:${ReactServerPort}`, // allow requests just from this origin
        methods: ["GET", "POST", "PUT", "DELETE"], // allow all methods
        allowedHeaders: ["Content-Type", "Authorization"], // allow all headers
        optionSuccessStatus: 200 //will be useful with React
    };

    server.use(cors(corsOPtions)); 


    /* home - GET*/
    server.get('/', (req, res) => {
        // the callback is the handler to the method
        res.send("Hello World!") // send content to the client
        // send method sets the body of the response
    })

    server.use("/bags", createBagsRouter(repos));
    server.use("/users", createUsersRouter(repos));
    server.use("/carts", createCartsRouter(repos));
    server.use("/reservations", createReservationsRouter(repos));
    server.use("/establishments", createEstablishmentsRouter(repos));

    return server;
}

