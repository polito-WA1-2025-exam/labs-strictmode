import dayjs from "dayjs";
import { Router } from "express";

export function createReservationsRouter({ userRepo, cartRepo, resRepo }) {
    const router = Router();

    router.get("/", async (req, res) => {
        let res_ = await resRepo.getReservations();
        if (!res_){
            return res.status(404).json({ error: "Reservations not found!" });
        }
        return res.json(res_);
    });

    /* creation of new reservation by userid - POST */
    router.post("/", async (req, res) => {
        const { userId} = req.body;

        const user = await userRepo.getUserById(userId);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        //for working with a sample pre set cart, use:
        //const userCart = await cartRepo.getCart_Sample(userId);  //Retrieve user's cart
        //otherwise, use:
        const userCart = await cartRepo.getCart(userId);  //Retrieve user's cart 

        //check if the user has a cart, if not there's no sense in doing a reservation
        if (!userCart) {
            return res.status(400).json({ error: "User has no cart!" });
        }


        //User's cart contains all the bags
        //iterate over all the bags and:
        //1. do all the checks
        //2. create a separate revservation for each bag

        const successfulReservations = [];

        for (const cartItem of userCart.getCartItems()){
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

    router.delete("/:id", async (req, res) => {
        //try catch error
        try {
            const res_ = await resRepo.cancelReservation(req.params.id);
            return res.json(res_);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    });

    return router;
}