
import express from "express";
export function createCartsRouter({ cartRepo }) {
    const router = express.Router();

    // get cart by userId
    router.get("/:userId", async (req, res) => {
        const userId = parseInt(req.params.userId);
        const cart = await cartRepo.getCart(userId);
        if (!cart) {
            return res.status(404).json({ error: `Cart for user ${userId} not found!` });
        }
        return res.json(cart);
    });

    //add bag, so a cartItem, to cart by userid
    router.post("/:userId/bags", async (req, res) => {
        const userId = parseInt(req.params.userId);
        const { bagId } = req.body;
        const result = await cartRepo.addBag(userId, parseInt(bagId));
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
            return res.status(404).json({ error: error.message });
        }
    });

    return router;
}