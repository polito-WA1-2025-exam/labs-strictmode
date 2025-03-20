import express, { json } from "express";
import morgan from 'morgan';
import Bag from "../models/Bag.mjs";
import User from "../models/User.mjs";
import Establishment from "../models/Establishment.mjs";
import Reservation from "../models/Reservation.mjs";
import Cart from "../models/Cart.mjs";
import Reservations from "../models/Reservations.mjs";
import BagItem from "../models/BagItem.mjs";
import CartItem from "../models/CartItem.mjs";

const PORT = 3001; //server port

//Server App creation
const server = express();


/* SAMPLE DATA FOR TESTING */
const users = [new User(1, "mail@esempio.com", "Forza", "Toro", ["peanuts"])];
const bags = [
    new Bag(1, Bag.TYPE_REGULAR, 101, 5, "2025-03-13 10:00:00", "2025-03-14 12:00:00"),
    new Bag(2, Bag.TYPE_REGULAR, 102, 10, "2025-03-13 14:00:00", "2025-03-14 16:00:00"),
];
const reservations = [];


/* MIDDLEWARES */

//register morgan middleware
//morgan used for logging about requests on the terminal
server.use(morgan("dev"));

//register json middleware to send data in json format
server.use(express.json());




/*ENDPOINTS Handlers */


/* home - GET*/
server.get('/', (req, res) => {
    //the callback is the handler to the method
    res.send("Hello World!") //sen content to the client
    //send method sets the body of the response
})

/* /reservations - GET*/
server.get("/reservations", (req, res) => {
    res.json(reservations);
});

/* creation of new reservation by userid - POST */
server.post("/reservations", (req, res) => {
    const { userId, bagIds } = req.body;

    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(400).json({ error: "User not found" });
    }

    const cartItems = [];
    for (const bagId of bagIds) {
        const bag = bags.find(b => b.id === bagId);
        if (!bag) {
            return res.status(400).json({ error: `Bag (having ID ${bagId}) not found` });
        }
        cartItems.push(new CartItem(bag));
    }

    try {
        const reservation = new Reservation(reservations.length + 1, user, cartItems);
        reservation.validateCartItems(cartItems);

        if (reservation.confirm()) {
            reservations.push(reservation);
            return res.json({ message: "Reservation is confirmed!", reservation });
        } else {
            return res.status(400).json({ error: "Bag(s) already reserved!" });
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});


/* delete a reservation done by userid   - GET*/
server.delete("/reservations/:id", (req, res) => {
    const reservationId = parseInt(req.params.id);
    const index = reservations.findIndex(r => r.id === reservationId);

    if (index === -1) {
        return res.status(404).json({ error: "Reservation not found!" });
    }

    reservations[index].cancel();
    reservations.splice(index, 1);
    
    res.json({ message: `Reservation ${reservationId} succesfully deleted!` });
});


//start the app AFTER all the middlewares registrations
server.listen(PORT, () => {console.log(`Server started on http://localhost:${PORT}`);})