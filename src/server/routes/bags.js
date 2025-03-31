import express from "express";
import { isValidString, isValidBagSize, isValidBagType, isValidISODate } from "../utils.mjs";

export function createBagsRouter({bagRepo}) {
    const router = express.Router();

    // get bags (optional establishment id filter)
    router.get("/", async (req, res) => {
        //get estId and convert it to number
        const queryEstId = req.query.estId;

        //case1: if no query parameter is passed
        //example: /bags
        //simply list all the available bags
        if (!queryEstId){
            const bags = await bagRepo.listAvailable();
            if (!bags){
                return res.status(404).json({ error: "No bags available!" });
            }
            return res.json(bags);
        }

        //case2: if query parameter is passed
        //example: /bags?estId=1
        //list all the bags of the establishment by estId
        const estId = parseInt(queryEstId);

        const bags = await bagRepo.getBagsByEstId(estId);
        if (!bags){
            return res.status(400).json({ error: `Bags for establishment ${estId} not found!` });
        }
        return res.json(bags);
    });

    // create a new bag
    router.post("/", async (req, res) => {
        const { bagType, estId, size, tags, price, pickupTimeStart, pickupTimeEnd } = req.body;
        //check is bagType is valid
        if (!isValidBagType(bagType)) {
            return res.status(400).json("Error: invalid bag type!");
        }
        //check is size is valid
        if (!isValidBagSize(size)) {
            return res.status(400).json("Error: invalid bag size!");
        }
        //check if pickupTimeStart and pickupTimeEnd are valid
        if (!isValidISODate(pickupTimeStart)) {
            return res.status(400).json("Error: invalid pickup time start!");
        }
        if (!isValidISODate(pickupTimeEnd)) {
            return res.status(400).json("Error: invalid pickup time end!");
        }

        const newBag = await bagRepo.createBag(bagType, parseInt(estId), size, tags, parseFloat(price), pickupTimeStart, pickupTimeEnd);
        return res.json(newBag);
    });

    // get bag by bagId
    router.get("/:bagId", async (req, res) => {
        const bag = await bagRepo.getBag(parseInt(req.params.bagId));
        if (!bag){
            return res.status(404).json({ error: "Bag not found!" });
        }
        return res.json(bag);
    });

    return router;
}