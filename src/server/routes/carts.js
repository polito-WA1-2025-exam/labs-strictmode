import express from "express";
import {User, Bag} from "../models/Bag.mjs";





export function createCartsRouter({ cartRepo, userRepo }) {
    const router = express.Router();

    // get cart by userId
    router.get("/:userId", async (req, res) => {
        const userId = parseInt(req.params.userId);

        try{
            const cart = await cartRepo.getCart(userId);
            //check if cart exists
            if (!cart) {
                return res.status(404).json({ error: `Cart for user ${userId} not found!` });
            }
            return res.json(cart);
        } catch (error) {
            return res.status(500).json({ error: "Error: Server error!" });
        }
    });

    //add bag, so a cartItem, to cart by userid
    router.post("/:userId/bags", async (req, res) => {
        const userId = parseInt(req.params.userId);
        const { bagId } = req.body;
        try{
            const result = await cartRepo.addBag(userId, parseInt(bagId));
            
        } catch (error) {
            return res.status(500).json({ error: "Error: cannot create a new bag!" });
        }
        return res.json(result);
    });

    //remove bag, so a cartItem, from cart by userid
    router.delete("/:userId/bags/:bagId", async (req, res) => {
        const userId = parseInt(req.params.userId);
        const bagId = parseInt(req.params.bagId);
        //catch the eventually thrown error
        try {
            const result = await cartRepo.removeBag(userId, bagId);
            return res.json(result);
        } catch (error) {
            return res.status(404).json({ error: "Error: cannot delete bag!" });
        }
    });

    return router;
}