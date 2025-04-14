import dayjs from "dayjs";
import { Router } from "express";

export function createReservationsRouter({ userRepo, cartRepo, resRepo,  cartItemRepo }) {
    const router = Router();

    router.get("/", async (req, res) => {
        try {
            let res_ = await resRepo.getReservations();
            if (!res_){
                return res.status(404).json({ error: "Reservations not found!" });
            }
            return res.json(res_);
        } catch (error) {
            return res.status(500).json({ error: "Error: Server error!" });
        }
    });

    // creation of new reservation for userid
    router.post("/", async (req, res) => {
        const { userId} = req.body;

        const userId_ = parseInt(userId);
        if (isNaN(userId_)){
            return res.status(400).json({ error: "Error: userId is not a number!" });
        }

        const user = await userRepo.getUserById(userId_);
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

        const est = [];

        for (const cartItem of userCart.items){
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

            if (cartItem.bag.available !== null){
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


            //ISSUE: CHECK USER DOESN'T BUY >1 BAGS FROM TEH SAME ESTABLISHMENT
            //HERE:
            try {
                const dateToday = dayjs().get('date');
                const resCheckToday = await resRepo.countReservationByDate(userId, cartItem.bag.estId, dateToday);
                //check if user has already reserved a bag from the same establishment today

                if (resCheckToday > 0){
                    //Erro: user is not expected to reserve more than 1 bag from the same establishment on the same day
                    return res.status(400).json({ error: `Error: You are not expected to reserve more than 1 bag from the same establishment on the same day` });
                }
            } catch (error){
                //db error
                return res.status(500).json({ error: "Error: Server error!" });
            }


            //IF ALL THE CHECKS ARE OK, THEN:
            //update total price

            //add the cartItem to the list of cartItems
            //at then end: create a new reservation for the userId and all the cartItems
            try {
                const newReservation = new Reservation(null, user, cartItem, reservationTime);
                const res_ = await resRepo.createReservation(newReservation);
                return res.json(res_);
            } catch (error) {
                return res.status(500).json({ error: "Error: it's not possible to create the reservation!" });
            }
           
        }



    });

    // delete a reservation by id
    router.delete("/:id", async (req, res) => {
        //try catch error
        try {
            const reservationId = parseInt(req.params.id);
            //take date today 
            const canceledAt = dayjs().toDate(); //.getTime(); //in millis
            if (isNaN(reservationId)){
                return res.status(400).json({ error: "Error: reservationId is not a number!" });
            }
            const res_ = await resRepo.cancelReservation(reservationId, canceledAt);
            if (!res_){
                return res.status(200).json({ error: "Reservation canceled correctly!" });
            }

            return res.status(500).json({ error: "Error: Server error!" });
        } catch (error) {
            return res.status(404).json({ error: "Error: Reservation not found!" });
        }
    });


    //list reservations by userId
    router.get("/user/:userId", async (req, res) => {
        //try catch error
        try {
            const userId = parseInt(req.params.userId);

            if (isNaN(userId)){
                return res.status(400).json({ error: "Error: userId is not a number!" });
            }
            const res_ = await resRepo.listReservationsByUser(userId);
            if (!res_){
                return res.status(404).json({ error: "Reservations not found!" });
            }
            return res.json(res_);
        } catch (error) {
            return res.status(500).json({ error: "Error: Server error!" });
        }
    });

    return router;
}