import express, { json, response } from "express";
import morgan from 'morgan';
import dayjs from "dayjs";

/* import models */
import {Bag, User, Establishment, Reservation, Cart, BagItem, CartItem} from "../models/index.mjs";

import {createBagsRouter} from "./routes/bags.js";
import {createUsersRouter} from "./routes/users.js";
import {createCartsRouter} from "./routes/carts.js";
import {createEstablishmentsRouter} from "./routes/establishments.js";
import {createReservationsRouter} from "./routes/reservations.js";


const PORT = 3001; //server port

// repos: { bagRepo, userRepo, cartRepo, resRepo, estRepo }    
export function createServer(repos) {
    const server = express();

    /* MIDDLEWARES */
    // morgan used for logging about requests on the terminal
    server.use(morgan("dev"));
    // register json middleware to send data in json format
    server.use(express.json());


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

// const server = createServer({
//     bagRepo: BagRepoTesting,
//     userRepo: UserRepoTesting,
//     cartRepo: CartRepoTesting,
//     resRepo: ReservationRepoTesting,
//     estRepo: EstablishmentRepoTesting
// });
// server.listen(PORT, () => {console.log(`Server started on http://localhost:${PORT}`);})

