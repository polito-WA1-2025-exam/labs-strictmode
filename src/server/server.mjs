import express, { json } from "express";
import morgan from 'morgan';
import dayjs from "dayjs";

/* import models */
import {Bag, User, Establishment, Reservation, Cart, BagItem, CartItem} from "../models/index.mjs";


/* import repos */
import {CartRepo, ReservationRepo, UserRepo} from "../repos/index.mjs";
import e from "express";


const PORT = 3001; //server port

//Server App creation
const server = express();


// TESTING
/* SAMPLE DATA FOR TESTING */
const bags = [
    //    constructor(id, bagType, estId, size, tags, price, pickupTimeStart, pickupTimeEnd, reservedBy = null) {
    new Bag(1, Bag.TYPE_REGULAR, 101, "large", "vegan", 5, "2025-03-30 10:00:00", "2025-03-31 12:00:00"),
    new Bag(2, Bag.TYPE_REGULAR, 102, "large", "vegan", 10, "2025-03-13 14:00:00", "2025-03-14 16:00:00"),
];
const reservations = [];

const UserRepo_Testing = {

    getUserById(id) {
        if (id === 1){
            return new User(1, "mail@esempio.com", "Forza", "Toro", ["peanuts"]);
        } else {
            return null;
        }
    }
}


const CartRepo_Testing = {

    //add bag id
    currentBagId: 1,


    getCart(userId) {
        //return a new object Cart with the user's cart
        let sampleCart = new Cart(userId);
        //add the 2 bags
        const bag1 = new Bag(
            this.currentBagId++, Bag.TYPE_REGULAR, 101, "large", "vegan",
            5, "2025-03-30 10:00:00", "2025-03-31 12:00:00"
        );

        const bag2 = new Bag(
            this.currentBagId++, Bag.TYPE_REGULAR, 102, "large", "vegan",
            10, "2025-03-13 14:00:00", "2025-03-14 16:00:00"
        );

        //add item to bag[0]
        //constructor(bagId, id, name, quantity)
        bags[0].addItem(new BagItem(1, 1, "peanuts", 2));
        bags[0].addItem(new BagItem(1, 2, "chocolate", 1));

        //add item to bag[1]
        //constructor(bagId, id, name, quantity)
        bags[1].addItem(new BagItem(2, 1, "peanuts", 2));
        bags[1].addItem(new BagItem(2, 2, "chocolate", 1));


        //console.log("bags0, date: ", bags[0]);
        sampleCart.addItem(new CartItem(bags[0]));
        sampleCart.addItem(new CartItem(bags[1]));

        return sampleCart;
    }


}














// END TESTING


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

function createReservation_Test(userRepo, cartRepo){
    server.post("/reservations", (req, res) => {
        const { userId} = req.body;

        const user = userRepo.getUserById(userId);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }


        /*
        const cartItems = [];
        for (const bagId of bagIds) {
            const bag = bags.find(b => b.id === bagId);
            if (!bag) {
                return res.status(400).json({ error: `Bag (having ID ${bagId}) not found` });
            }
            cartItems.push(new CartItem(bag));
        }
        */

        const userCart = cartRepo.getCart(userId);  //Retrieve user's cart 
        //User's cart contains all the bags
        //iterate over all the bags and:
        //1. do all the checks
        //2. create a separate revservation for each bag


        for (const cartItem of userCart.returnCartItems()){
            //1. for each bag do all the checks

            //a. Check Expiration date
            const reservationTime = dayjs().toDate(); //.getTime(); //in millis

            //retrieve cart item bag creation Time
            const cartItemBagTimeEnd = cartItem.bag.pickupTimeEnd.toDate(); //.getTime(); //in millis


            if (cartItemBagTimeEnd <= reservationTime){
                return res.status(400).json({ error: `Cart Item (having ID ${cartItem.bag.id}) already expired!` });
            } else {
                console.log("Test_a OK");
            }

            //b. Check is bag is not already reserved by other userids

            if (cartItem.bag.reservedBy !== null){
                return res.status(400).json({ error: `Cart Item (having ID ${cartItem.bag.id}) already reserved!` });
            } else {
                console.log("Test_b OK");
            }


            //c. check if cartitem is empty: if it is, there's nopo sense in doing a revservation
            if (cartItem.bag.items.length == 0){
                return res.status(400).json({ error: `Cart Item (having ID ${cartItem.bag.id}) is empty!` });
            } else {
                console.log("Test_c OK");
            }

            //set cartItem as reserved
            cartItem.bag.reservedBy = userId;

            /*
            In production use: ReservationRepo.createReservations(userId, cartItems) method
            */

            /*Here, just for testing purposes, we use: */
            const reservation = new Reservation(null, user, cartItem);
            reservations.push(reservation);
            console.log("Reservation created: ", reservation);

        }
    });
}


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




//REGISTER TESTING ENDPOINTS
createReservation_Test(UserRepo_Testing, CartRepo_Testing);


//start the app AFTER all the middlewares registrations
server.listen(PORT, () => {console.log(`Server started on http://localhost:${PORT}`);})



