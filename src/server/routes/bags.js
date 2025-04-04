import express from "express";
import { isValidString, isValidBagSize, isValidBagType, isValidISODate } from "../validation.mjs";
import {Bag, Establishment} from "../models/Bag.mjs";


export function createBagsRouter({bagRepo, estRepo}) {
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

        try {
            const estId = parseInt(queryEstId);

            const establishment = new Establishment(estId, null, null, null);
            const bags = await bagRepo.getBagsByEstId(establishment);
            if (!bags){
                return res.status(400).json({ error: `Bags for establishment ${estId} not found!` });
            }
            return res.json(bags);
        } catch (error) {
            return res.status(500).json({ error: "Error: Server error!" });
        }
    });

    // create a new bag
    router.post("/", async (req, res) => {
        const { bagType, estId, size, tags, price, pickupTimeStart, pickupTimeEnd, available } = req.body;
        //check is bagType is valid
        if (!isValidBagType(bagType)) {
            return res.status(400).json({error: "Error: invalid bag type!"});
        }
        //check is size is valid
        if (!isValidBagSize(size)) {
            return res.status(400).json({error: "Error: invalid bag size!"});
        }
        //check if pickupTimeStart and pickupTimeEnd are valid
        if (!isValidISODate(pickupTimeStart)) {
            return res.status(400).json({error: "Error: invalid pickup time start!"});
        }
        if (!isValidISODate(pickupTimeEnd)) {
            return res.status(400).json({error: "Error: invalid pickup time end!"});
        }
        //check if estId is valid
        const estId_ = parseInt(estId);
        if (!estRepo.getEstablishment(estId_)) {
            return res.status(400).json({error: "Error: invalid establishment id!"});
        }

        try {
            const newBag = new Bag(null, bagType, estId_, size, tags, parseFloat(price), pickupTimeStart, pickupTimeEnd, available);
            const res_ = await bagRepo.createBag(newBag);
            return res.json(res_);
        } catch (error) {
            return res.status(500).json({ error: "Error: it's not possible to create the bag!" });
        }
    });

    // get bag by bagId
    router.get("/:bagId", async (req, res) => {
        try {
            const bag = await bagRepo.getBag(parseInt(req.params.bagId));
            if (!bag){
                return res.status(404).json({ error: "Error: Bag not found!" });
            }
            return res.json(bag);
        } catch (error) {
            return res.status(500).json({ error: "Error: Server error!" });
        }
    });

    return router;
}