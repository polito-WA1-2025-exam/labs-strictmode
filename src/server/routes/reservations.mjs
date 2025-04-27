import dayjs from "dayjs";
import { Router } from "express";
import HttpStatusCodes from "../HttpStatusCodes.mjs";
import { Reservation } from "../../models/index.mjs";

export function createReservationsRouter({ cartRepo, resRepo, bagRepo }) {
    const router = Router();

    router.get("/", async (req, res) => {
        try {
            let res_ = await resRepo.getReservations();
            if (!res_){
                return res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Reservations not found!" });
            }
            return res.json(res_);
        } catch (error) {
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: Server error!" });
        }
    });

    // creation of new reservation for userid
    router.post("/:userId", async (req, res) => {
        const userId = req.params.userId;
        if (!userId){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: userId is not defined!" });
        }

        const userId_ = parseInt(userId);
        if (isNaN(userId_)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: userId is not a number!" });
        }

       
        const userCart = await cartRepo.getCartByUserId(userId);  //Retrieve user's cart 

        //check if the user has a cart, if not there's no sense in doing a reservation
        if (!userCart) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: User has no cart!" });
        }

        //check if the cart is empty, if it is, there's no sense in doing a reservation
        if (userCart.items.length === 0) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: User\'s cart is empty!" });
        }


        //User's cart contains all the bags
        //iterate over all the bags and:
        //1. do all the checks
        //2. create a separate revservation for each bag

        const createdReservations = [];

        for (const cartItem of userCart.items){
            //1. for each bag do all the checks

            //a. Check Expiration date
            //the check is performed up to the day
            const reservationTime = dayjs().toDate();

            //retrieve cart item bag creation Time
            //console.log("cartItem.bag.pickupTimeEnd: ", cartItem.bag.pickupTimeEnd);
            const cartItemBagTimeEnd = dayjs(cartItem.bag.pickupTimeEnd)


            if (cartItemBagTimeEnd <= reservationTime){
                return res.status(HttpStatusCodes.FORBIDDEN).json({ error: `Error: Cart Item (having ID ${cartItem.bag.id}) already expired!` });
            } else {
                console.log("Test_a OK");
            }


            //check if cartitem is empty: if it is, there's nopo sense in doing a revservation
            if (cartItem.bag.items.length == 0){
                return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: `Error: Cart Item (having ID ${cartItem.bag.id}) is empty!` });
            } else {
                console.log("Test_c OK");
            }


            //CHECK USER DOESN'T BUY >1 BAGS FROM THE SAME ESTABLISHMENT
            try {
                //async checkEstablishmentContraint(userId, createdAt, estId) {
                const estId = parseInt(cartItem.bag.estId);
                if (isNaN(estId)){
                    return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: establishmentId is not a number!" });
                }
                      
                const checkEstContraint = await resRepo.checkEstablishmentContraint(userId, reservationTime, estId);
                //this will return true if the user has a reservation for the same establishment at the same day
                if (checkEstContraint === true) {
                    //FORBIDDEN: The user is not allowed to add a bag from the same establishment today
                    return res.status(HttpStatusCodes.FORBIDDEN).json({ error: `Cart Item (having ID ${cartItem.bag.id}) already reserved by other user!` });
                }
        
            } catch (error) {
                //repo error
                console.log("Error: ", error);
                return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to check the establishment constraint!" });
            }


            //IF ALL THE CHECKS ARE OK, THEN:
            //update total price

            //add the cartItem to the list of cartItems
            //at then end: create a new reservation for the userId and all the cartItems
            try {
                const newReservation = new Reservation(null, userId_, cartItem, reservationTime);
                const createdReserv = await resRepo.createReservation(newReservation);
                if (!createdReserv) {
                    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to create the reservation!" });
                } else {
                    createdReservations.push(createdReserv);
                }

            } catch (error) {
                
                //IF BAG IS NOT AVAILABLE ANYMORE AT THE TIME OF THE RESERVATION
                if (error.message === 'Bag is not available anymore!'){
                    //FORBIDDEN: The user is not allowed to add a non-available bag to the cart
                    return res.status(HttpStatusCodes.FORBIDDEN).json({ error: "Error: " + error.message });
                }
                
                
                //repo error
                
                return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to create the reservation!" });
            }
           
        }

        return res.status(HttpStatusCodes.CREATED).json(createdReservations);



    });

    // delete a reservation by id
    router.delete("/:id", async (req, res) => {
        //try catch error
        try {
            const reservationId = parseInt(req.params.id);
            if (isNaN(reservationId)){
                return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: reservationId is not a number!" });
            }
            const res_ = await resRepo.cancelReservation(reservationId);
            if (!res_){
                return res.status(HttpStatusCodes.OK).json({ success: "Reservation deleted successfully!" });
            }
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: cannot delete reservation!" });
        } catch (error) {
            
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: cannot delete reservation!" });
        }
    });


    //list reservations by userId
    router.get("/user/:userId", async (req, res) => {
        //try catch error
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)){
                return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: userId is not a number!" });
            }
            const res_ = await resRepo.listReservationsByUser(userId);
            if (!res_){
                return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Reservations not found!" });
            }
            return res.json(res_);
        } catch (error) {
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: cannot retrieve reservations!" });
        }
    });

    return router;
}