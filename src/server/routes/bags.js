import express from "express";
import { isValidString, isValidBagSize, isValidBagType, isValidISODate } from "../validation.mjs";
import {Bag, Establishment, BagItem} from "../../models/index.mjs";
import HttpStatusCodes from "../HttpStatusCodes.mjs";



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
            try {
                const bags = await bagRepo.listAvailable();
                if (!bags){
                    return res.status(HttpStatusCodes.NOT_FOUND).json({ error: "No bags available!" });
                }
                return res.status(HttpStatusCodes.OK).json(bags);
            } catch (error){
                return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "It's not possible to list the bags!" });
            }
        } else {

            //case2: if query parameter is passed
            //example: /bags?estId=1
            //list all the bags of the establishment by estId

            try {
                const estId = parseInt(queryEstId);
                if (isNaN(estId)) {
                    return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: invalid establishment id!" });
                }

                const establishment = new Establishment(estId, null, null, null);
                const bags = await bagRepo.getBagsByEstId(establishment);
                if (!bags){
                    return res.status(HttpStatusCodes.NOT_FOUND).json({ error: `Bags for establishment ${estId} not found!` });
                }
                return res.status(HttpStatusCodes.OK).json(bags);
            } catch (error) {
                return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: It's not possible to retrieve the bag!" });
            }
        }
    });

    // create a new bag
    router.post("/", async (req, res) => {
        const { bagType, estId, size, tags, price, pickupTimeStart, pickupTimeEnd, available } = req.body;
        //check is bagType is valid
        if (!isValidBagType(bagType)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid bag type!"});
        }
        //check is size is valid
        if (!isValidBagSize(size)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid bag size!"});
        }
        //check if pickupTimeStart and pickupTimeEnd are valid
        if (!isValidISODate(pickupTimeStart)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid pickup time start!"});
        }
        if (!isValidISODate(pickupTimeEnd)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid pickup time end!"});
        }
        //check if estId is valid
        const estId_ = parseInt(estId);
        if (isNaN(estId_)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid establishment id!"})
        }
        if (!estRepo.getEstablishment(estId_)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid establishment id!"});
        }

        //check if available is boolean 
        if (typeof available !== "boolean") {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid available value!"});
        }

        //check if price is a number
        const priceF = parseFloat(price);
        if (isNaN(priceF)) {
            //everything that is not a number is NaN, so we can use this function to check if the price is a number
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid price value!"});
        }

        try {
            const newBag = new Bag(null, bagType, estId_, size, tags, priceF, pickupTimeStart, pickupTimeEnd, available);
            const res_ = await bagRepo.createBag(newBag);
            return res.status(HttpStatusCodes.OK).json(res_);
        
        } catch (error) {
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to create the bag!" });
        }
    });

    // get bag by bagId
    router.get("/:bagId", async (req, res) => {
        try {

            //check if bagId is a number
            const bagId = parseInt(req.params.bagId);
            if (isNaN(bagId)) {
                return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: invalid bag id!" });
            }

            const bag = await bagRepo.getBag(bagId);
            if (!bag){
                //if bag is null -> bag not found
                return res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Error: Bag not found!" });
            }

            //if bag is not null -> bag found
            return res.status(HttpStatusCodes.OK).json(bag);
        } catch (error) {
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: Server error!" });
        }
    });


    //update bag
    router.put(":/bagId", async (res, req) => {
        const { bagId, bagType, estId, size, tags, price, pickupTimeStart, pickupTimeEnd, available } = req.body;
        
        //check bagId is valid
        const bagId_ = parseInt(bagId);
        if (isNaN(bagId)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid bag id!"});
        }
        
        //check is bagType is valid
        if (!isValidBagType(bagType)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid bag type!"});
        }
        //check is size is valid
        if (!isValidBagSize(size)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid bag size!"});
        }
        //check if pickupTimeStart and pickupTimeEnd are valid
        if (!isValidISODate(pickupTimeStart)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid pickup time start!"});
        }
        if (!isValidISODate(pickupTimeEnd)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid pickup time end!"});
        }
        //check if estId is valid
        const estId_ = parseInt(estId);
        if (isNaN(estId_)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid establishment id!"})
        }
        if (!estRepo.getEstablishment(estId_)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid establishment id!"});
        }

        //check if available is boolean 
        if (typeof available !== "boolean") {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid available value!"});
        }

        //check if price is a number
        const priceF = parseFloat(price);
        if (isNaN(priceF)) {
            //everything that is not a number is NaN, so we can use this function to check if the price is a number
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid price value!"});
        }

        try {
            const bagToUpdate = new Bag(bagId_, bagType, estId_, size, tags, priceF, pickupTimeStart, pickupTimeEnd, available);
            const res = await bagRepo.updateBag(bagToUpdate);

            if (!res){
                //if res is null -> update succesful
                return res.status(HttpStatusCodes.OK).json({success: "Bag updated succesfully!"})
            }

            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({error: "Error: it's not possible to update the bag!"})
        } catch (error){
            return res.status(HttpStatusCodes.NOT_FOUND).json({error: "Error: it's not possible to update the bag!"})
        }
    });


    //add item to a bag
    router.post("/item", async (req, res) => {
        const { bagId, id, name, quantity } = req.body;

        //check bagId is valid
        const bagId_ = parseInt(bagId);
        if (isNaN(bagId_)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid bag id!"});
        }

        //check id is valid
        const id_ = parseInt(id);
        if (isNaN(id_)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid item id!"});
        }

        //check name is valid
        if (!isValidString(name)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid item name!"});
        }

        //check quantity is valid
        const quantity_ = parseFloat(quantity);
        if (isNaN(quantity_)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid item quantity!"});
        }

        if (quantity_ <= 0){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid item quantity!"});
        }

        try {
            const bagItem = new BagItem(id_, name, quantity_);
            const res_ = await bagRepo.addItem(bagId_, bagItem);
            return res.status(HttpStatusCodes.OK).json(res_);
        } catch (error) {
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to add the item to the bag!" });
        }


    });

    //delete an item from a bag
    //++ DA AGGIORNARE DB REPO ++
    router.delete("/item", async (req, res) => {
        itemId = parseInt(req.params.itemId);
        if (isNaN(itemId)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid item id!"});
        }

        try {
            const res = await bagRepo.removeItem(itemId);
            if (!res){
                return res.status(HttpStatusCodes.OK).json({success: "Item removed successfully!"});
            }

            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({error: "Error: it's not possible to remove the item from the bag!"});
        } catch (error) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Error: it's not possible to remove the item from the bag!" });
        }

    });

    return router;
}