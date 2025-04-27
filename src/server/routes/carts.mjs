import express from "express";
import {User, Bag} from "../../models/index.mjs";
import HttpStatusCodes from "../HttpStatusCodes.mjs";





export function createCartsRouter({ cartRepo, bagRepo }) {
    const router = express.Router();

    // get cart by userId
    router.get("/:userId", async (req, res) => {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: invalid userId!" });
        }

        try{
            const cart = await cartRepo.getCartByUserId(userId);

            //a cart object is always returned by the db repo, so it cannot be null
            //however, if the cart is empty, its attribute cart.items will be an empty array
            if (cart.items.length && cart.items.length === 0) {
                return res.status(HttpStatusCodes.NOT_FOUND).json({ error: `Cart for user ${userId} is empty!` });
            }

            //if the cart is not empty, return it
            return res.status(HttpStatusCodes.OK).json(cart);
        } catch (error) {
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: Server error!" });
        }
    });

    //add bag, so a cartItem, to cart by userid
    router.post("/:userId/bags", async (req, res) => {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: invalid userId!" });
        }
        const { bagId } = req.body;
        const bagId_ = parseInt(bagId);
        if (isNaN(bagId_)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: invalid bagId!" });
        }

        //retrieve the bag from the db
        const retrievedBag = await bagRepo.getBagById(bagId_);
        console.log("retrievedBag: ", retrievedBag);
        if (!retrievedBag) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Error: bag not found!" });
        }

        //CHECK IS THE BAG IS AVAILABLE
        if (retrievedBag.available === false) {
            //FORBIDDEN: The user is not allowed to add a non-available bag to the cart
            return res.status(HttpStatusCodes.FORBIDDEN).json({ error: "Error: bag is not available!" });
        }

        try{
            const addedCartItem = await cartRepo.addBag(userId, retrievedBag);
            console.log("addedCartItem: ", addedCartItem);
            if (!addedCartItem) {
                return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: cannot add bag to cart!" });
            }

            //if addedCartItem is not null, bag added to cart successfully
            return res.status(HttpStatusCodes.CREATED).json(addedCartItem);

            
        } catch (error) {

            //CONTRAINTS VIOLATION: user is trying to add a bag of the same estType of other bags in the cart at the same day
            if (error.message === 'You have already added a bag from this establishment today. Please try again tomorrow.'){
                //FORBIDDEN: The user is not allowed to add a bag from the same establishment today
                return res.status(HttpStatusCodes.FORBIDDEN).json({ error: "Error: " + error.message });
            }



            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to add the bag to the cart!" });
        }
        
    });

    //remove bag, so a cartItem, from cart by userid
    router.delete("/:userId/bags/:bagId", async (req, res) => {
        const userId = parseInt(req.params.userId);
        const bagId = parseInt(req.params.bagId);

        if (isNaN(userId)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: userId is not a number!" });
        }

        if (isNaN(bagId)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: bagId is not a number!" });
        }

        //catch the eventually thrown error
        try {
            const result = await cartRepo.removeBag(userId, bagId);
            if (!result) {
                //if result is null -> bag removed successfully
                return res.status(HttpStatusCodes.OK).json({ success: "Bag removed successfully!" });
            }
            //if result is not null -> bag not removed
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: cannot remove bag!" });
        } catch (error) {
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: cannot delete bag!" });
        }
    });




    router.post("/:userId/personalize/:bagId", async (req, res) => {
        const userId = parseInt(req.params.userId);
        const bagId = parseInt(req.params.bagId);

        // Basic validation for route parameters
        if (isNaN(userId)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: userId is not a number!" });
        }

        if (isNaN(bagId)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: bagId is not a number!" });
        }

        const removedItems = req.body.removedItems;

        // Basic validation for the request body
        // removedItems is an array of bagItem ids to be removed
        if (!removedItems) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: removedItems is null or undefined!" }); // More specific message
        }

        if (!Array.isArray(removedItems)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: removedItems must be an array!" }); // More specific message
        }

        if (removedItems.length === 0) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: removedItems is an empty array! You must specify at least one item to remove." }); // More specific message
        }

        //Validate that all items in removedItems are numbers/integers since they are bagItem IDs
        if (!removedItems.every(item => !isNaN(parseInt(item)))) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: all items in removedItems must be valid item IDs!" });
        }


        try {
            const personalizationRes = await cartRepo.personalizeBag(userId, bagId, removedItems);

            if (!personalizationRes){
                //if res is null/undefined -> bag personalized successfully
                return res.status(HttpStatusCodes.OK).json({ success: "Bag personalized successfully!" });
            }   
            
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: An unexpected issue occurred during personalization." });
            
        } catch (error){
            // --- Catch Specific Repos Errors ---
            console.error("Error personalizing bag:", error.message); // Log the full error for debugging
            const startsWithCheck = error.message.startsWith('Item with ID ');
            const endsWithCheck = error.message.endsWith(' is not in the bag');
            console.log("Starts With:", startsWithCheck);
            console.log("Ends With:", endsWithCheck);
            switch (error.message) {
                case 'You must specify at least one item to remove':
                    //This validation is already done above for an empty array,
                    //but catching it here provides a fallback if the repo is called directly.
                    return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: " + error.message });

                case 'A non-regular bag cannot be personalized':
                    //CONTRAINT VIOLATION:
                    //FORBIDDEN: The user is not allowed to personalize a non-regular bag
                    return res.status(HttpStatusCodes.FORBIDDEN).json({ error: "Error: " + error.message }); 

                case 'Cannot remove more than 2 items from the bag!':
                    //CONSTRAINT VIOLATION: The user is trying to remove more than 2 items from a regular bag
                    return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: " + error.message });
                

                default:
                    // Catch the error for item not found in the bag
                    if (error.message.startsWith('Item with ID ') && error.message.endsWith(' is not in the bag')){
                        return res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Error: " + error.message }); // Or 404 Not Found for the item
                    }
                    
                        console.error("Unhandled error during bag personalization:", error); // Log the full error for debugging
                    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: An internal server error occurred during personalization." });
            }
        }
    });


    return router;
}