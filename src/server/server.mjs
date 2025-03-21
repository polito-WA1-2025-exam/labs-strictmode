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

const UserRepo_Testing = {

    users: [],
    uid: 1,

    //populate with example user
    constructor() {
        this.users.push(new User(1, "mail@esempio.com", "Forza", "Toro")); //example user just for testing
        this.uid++;
    },

    getUserById(id) {
        if (id === 1){
            return this.users[0];
        } else {
            return null;
        }
    },

    //function to create a new user
    /**
     * @param {string} email
     * @param {string} assignedName
     * @param {string} familyName
     * @returns {User}
     */
    createUser(email, assignedName, familyName) { 
        const newUser = new User(this.uid++, email, assignedName, familyName);
        this.users.push(newUser);
        this.uid++;
        console.log("New user created: ", newUser);
        return newUser;
    },

    /**
     * @param {number} id
     * @returns {User}
     */
    updateUser(id, email, assignedName, familyName) { 
        //update user into the users array
        for (let i=0; i<this.users.length; i++){
            if (this.users[i].id === id){
                this.users[i].email = email;
                this.users[i].assignedName = assignedName;
                this.users[i].familyName = familyName;

                return `Updated user with id ${id}: ${email}, ${assignedName}, ${familyName}`;
            }
        }

        return "Error: User not found!";
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
        bag1.addItem(new BagItem(1, 1, "peanuts", 2));
        bag1.addItem(new BagItem(1, 2, "chocolate", 1));

        //add item to bag[1]
        //constructor(bagId, id, name, quantity)
        bag2.addItem(new BagItem(2, 1, "peanuts", 2));
        bag2.addItem(new BagItem(2, 2, "chocolate", 1));


        //console.log("bags0, date: ", bags[0]);
        sampleCart.addItem(new CartItem(bag1));
        sampleCart.addItem(new CartItem(bag2));

        return sampleCart;
    }


}


const ReservationRepo_Testing = {

        resId: 1,
        reservations: [],

        createReservations(userId, cartItems) {
            let c = 0;
            for (const cartItem of cartItems) {
                const reservation = new Reservation(this.resId++, userId, cartItem);
                this.reservations.push(reservation);
                ++c;                      
            }

            return `Created ${c} reservations!`;
        },

        createReservationSingle(userId, cartItem) {
            const reservation = new Reservation(this.resId++, userId, cartItem);
            this.reservations.push(reservation);

            return reservation;

        },

        cancelReservation(resId) {
            const reservationId = parseInt(resId);
            const index = this.reservations.findIndex(r => r.id === reservationId);

            if (index === -1) {
                return "Error: Reservation not found!";
            }

            //this.reservations[index].cancel();
            this.reservations.splice(index, 1);
            
            //res.json({ message: `Reservation ${reservationId} succesfully deleted!` });
            return `Reservation ${resId} succesfully deleted!` ;

        },

        getReservations() {
            //return all the reservations in json format
            return this.reservations;

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



/* USER ENDPOINTS */

//user post endpoint: create a new user
function createUser_Test(userRepo){
    server.post("/users", (req, res) => {
        const { email, assignedName, familyName } = req.body;
        
        const newUser = userRepo.createUser(email, assignedName, familyName);
        return res.json(newUser);
    });
}

//user put endpoint: update a user
function updateUser_Test(userRepo){
    server.put("/users/:id", (req, res) => {
        const { email, assignedName, familyName } = req.body;
        const updatedUser = userRepo.updateUser(req.params.id, email, assignedName, familyName);
        return res.json(updatedUser);
    });
}

//user get endpoint: get a user by id
function getUserById_Test(userRepo){
    server.get("/users/:id", (req, res) => {
        const user = userRepo.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json(user);
    });
}




/* RESERVATION ENDPOINTS */

/* /reservations - GET*/
function getReservations_Test(resRepo){
    server.get("/reservations", (req, res) => {
        let res_ = resRepo.getReservations();

        return res.json(res_);
    });
}

/* creation of new reservation by userid - POST */

function createReservation_Test(userRepo, cartRepo, resRepo){
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

        const successfulReservations = [];

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
            //const reservation = new Reservation(null, user, cartItem);
            const res_ = resRepo.createReservationSingle(userId, cartItem);
            successfulReservations.push(res_);
        }

        //if no errors, return all the reservations made
        return res.json(successfulReservations);
    });
}


/* delete a reservation done by userid   - GET*/
function deleteReservation_Test(resRepo){
    server.delete("/reservations/:id", (req, res) => {
        /*
        const reservationId = parseInt(req.params.id);
        const index = reservations.findIndex(r => r.id === reservationId);

        if (index === -1) {
            return res.status(404).json({ error: "Reservation not found!" });
        }

        reservations[index].cancel();
        reservations.splice(index, 1);
        
        res.json({ message: `Reservation ${reservationId} succesfully deleted!` });
        */

        const res_ = resRepo.cancelReservation(req.params.id);
        if (res_.startsWith("Error")){
            return res.status(404).json({ error: "Reservation not found!" });
        } else {
            return res.json(res_);
        }
    });
}



//REGISTER TESTING ENDPOINTS

//For User
createUser_Test(UserRepo_Testing);
updateUser_Test(UserRepo_Testing);
getUserById_Test(UserRepo_Testing);


//For Reservation
createReservation_Test(UserRepo_Testing, CartRepo_Testing, ReservationRepo_Testing);
deleteReservation_Test(ReservationRepo_Testing);
getReservations_Test(ReservationRepo_Testing);


//start the app AFTER all the middlewares registrations
server.listen(PORT, () => {console.log(`Server started on http://localhost:${PORT}`);})



