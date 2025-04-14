import express from "express";
import {User, Bag} from "../models/index.mjs";
import HttpStatusCodes from "../HttpStatusCodes.mjs";





export function createCartsRouter({ cartRepo, userRepo }) {
    const router = express.Router();

    // get cart by userId
    router.get("/:userId", async (req, res) => {
        const userId = parseInt(req.params.userId);

        try{
            const cart = await cartRepo.getCart(userId);

            //a cart object is always returned by the db repo, so it cannot be null
            //however, if the cart is empty, its attribute cart.items will be an empty array
            if (cart.items.length === 0) {
                return res.status(HttpStatusCodes.NOT_FOUND).json({ error: `Cart for user ${userId} is empty!` });
            }

            //if the cart is not empty, return it
            return res.status(HttpStatusCodes.OK).json(cart);
        } catch (error) {
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: Server error!" });
        }
    });

    //add bag, so a cartItem, to cart by userid
    //++ DA AGGIORNARE DB REPO ++
    router.post("/:userId/bags", async (req, res) => {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)){
            return res.status(400).json({ error: "Error: userId is not a number!" });
        }
        const { bagId } = req.body;
        const bagId_ = parseInt(bagId);
        if (isNaN(bagId_)){
            return res.status(400).json({ error: "Error: bagId is not a number!" });
        }
        try{
            const result = await cartRepo.addBag(userId, bagId_);
            return res.json(result);
            
        } catch (error) {
            return res.status(500).json({ error: "Error: cannot create a new bag!" });
        }
        
    });

    //remove bag, so a cartItem, from cart by userid
    //++ DA AGGIORNARE DB REPO ++
    router.delete("/:userId/bags/:bagId", async (req, res) => {
        const userId = parseInt(req.params.userId);
        const bagId = parseInt(req.params.bagId);

        if (isNaN(userId)){
            return res.status(400).json({ error: "Error: userId is not a number!" });
        }

        if (isNaN(bagId)){
            return res.status(400).json({ error: "Error: bagId is not a number!" });
        }

        //catch the eventually thrown error
        try {
            const result = await cartRepo.removeBag(userId, bagId);
            return res.json(result);
        } catch (error) {
            return res.status(404).json({ error: "Error: cannot delete bag!" });
        }
    });


    router.post("/:userId/personalize/:bagId", async (req, res) => {
        const userId = parseInt(req.params.userId);
        const bagId = parseInt(req.params.bagId);

        if (isNaN(userId)){
            return res.status(400).json({ error: "Error: userId is not a number!" });
        }

        if (isNaN(bagId)){
            return res.status(400).json({ error: "Error: bagId is not a number!" });
        }


        const removedItems = req.body.removedItems;
        //removedItems is an array of bagItem ids to be removed
        if (!Array.isArray(removedItems)) {
            return res.status(400).json({ error: "Error: removedItems is not an array!" });
        }

        if (removedItems.length === 0) {
            return res.status(400).json({ error: "Error: removedItems is an empty array!" });
        }


        try {
        
            const res = await cartRepo.personalizeBag(userId, bagId, removedItems);

            if (!res){
                //if res is null -> bag personalized successfully
                return res.status(HttpStatusCodes.OK).json({ success: "Bag personalized successfully!" });
            } 

            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: cannot personalize bag!" });
        } catch (error){
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: cannot personalize bag!" });
        }



    });

    return router;
}