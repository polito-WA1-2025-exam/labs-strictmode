import express from "express";
import { isValidString, isValidBagSize, isValidBagType, isValidISODate } from "../validation.mjs";
import {Bag, Establishment, BagItem} from "../../models/index.mjs";
import HttpStatusCodes from "../HttpStatusCodes.mjs";
import dayjs from "dayjs";
//for timezone and utc when comparing dates with dayjs.now()
import utc from 'dayjs/plugin/utc'; 
import timezone from 'dayjs/plugin/timezone'; 
dayjs.extend(utc);
dayjs.extend(timezone);



export function createBagsRouter({bagRepo, estRepo}) {
    const router = express.Router();


    //function to check all the params of a bag
    //This function either RETURNS an error object or null
    //this is the front runner of all the logic to prevent calling the db with invalid params and thus wasting resources and time
    async function checkBagParams(bagType, estId, size, tags, price, pickupTimeStart, pickupTimeEnd, available, estRepo, bagId = null){ 

        //if bagId is not null, it means this function is called to update a bag
        //so check if bagId is valid
        if (bagId !== null) {
            const bagId_ = parseInt(bagId);
            if (isNaN(bagId_)) {
                return { status: HttpStatusCodes.BAD_REQUEST, error: "Error: invalid bag id!" };
            }
        }

        //check is bagType is valid
        if (!isValidBagType(bagType)) {
            return { status: HttpStatusCodes.BAD_REQUEST, error: "Error: invalid bag type!" };
        }
        //check is size is valid
        if (!isValidBagSize(size)) {
            return { status: HttpStatusCodes.BAD_REQUEST, error: "Error: invalid bag size!" };
        }
        //check if pickupTimeStart and pickupTimeEnd are valid ISO dates
        if (!isValidISODate(pickupTimeStart)) {
            return { status: HttpStatusCodes.BAD_REQUEST, error: "Error: invalid pickup time start!" };
        }
        if (!isValidISODate(pickupTimeEnd)) {
            return { status: HttpStatusCodes.BAD_REQUEST, error: "Error: invalid pickup time end!" };
        }

        //other controls on dates using dayjs
        const pickupTimeStart_ = dayjs(pickupTimeStart);
        const pickupTimeEnd_ = dayjs(pickupTimeEnd);

        //check if pickupTimeStart is before pickupTimeEnd
        if (pickupTimeStart_.isAfter(pickupTimeEnd_)) {
            return { status: HttpStatusCodes.BAD_REQUEST, error: "Error: pickup time start is after pickup time end!" };
        }

        //check if pickupTimeEnd is in the future (not before the current time)
        const now = dayjs();
        if (pickupTimeEnd_.isBefore(now)) {
            return { status: HttpStatusCodes.BAD_REQUEST, error: "Error: pickup time end cannot be in the past!" };
        }

        //check if available is boolean
        if (typeof available !== "boolean") {
            return { status: HttpStatusCodes.BAD_REQUEST, error: "Error: invalid available value!" };
        }

        //check if price is a positive number
        const priceF = parseFloat(price);
        if (isNaN(priceF) || priceF <= 0) {
            return { status: HttpStatusCodes.BAD_REQUEST, error: "Error: invalid price!" };
        }

        //check if estId is a valid integer and exists in the database
        const estId_ = parseInt(estId);
        if (isNaN(estId_)) {
            return { status: HttpStatusCodes.BAD_REQUEST, error: "Error: invalid establishment id format!" };
        }
        // Need estRepo to check if the establishment exists
        if (!estRepo) {
            console.error("Error: estRepo not passed to checkBagParams!");
            return { status: HttpStatusCodes.INTERNAL_SERVER_ERROR, error: "Internal server error during validation." };
        }
        try {
            const retrievedEst = await estRepo.getEstablishmentById(estId_);
            if (!retrievedEst) {
                // if the establishment retrieved by the user passed estId is null, it means that the establishment doesn't exist
                return { status: HttpStatusCodes.BAD_REQUEST, error: "Error: invalid establishment id!" };
            }
        } catch (error) {
            console.error("Error checking establishment existence:", error);
            return { status: HttpStatusCodes.INTERNAL_SERVER_ERROR, error: "Error checking establishment existence." };
        }


        return null; //ALL BAG PARAMS OK
    }





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
        
        const checkParamsResult = await checkBagParams(bagType, estId, size, tags, price, pickupTimeStart, pickupTimeEnd, available, estRepo);
        if (checkParamsResult) {
            return res.status(checkParamsResult.status).json({ error: checkParamsResult.error });
        }

        //this gets executed only if all the params are valid, i.e. checkParamsResult is null


        try {
            const newBag = new Bag(null, bagType, parseInt(estId), size, tags, parseFloat(price), pickupTimeStart, pickupTimeEnd, available);
            const res_ = await bagRepo.createBag(newBag);
            return res.status(HttpStatusCodes.CREATED).json(res_);
        
        } catch (error) {
            console.error("Error creating bag:", error);
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
        
        const checkParamsResult = await checkBagParams(bagType, estId, size, tags, price, pickupTimeStart, pickupTimeEnd, available, estRepo, bagId);
        if (checkParamsResult) {
            return res.status(checkParamsResult.status).json({ error: checkParamsResult.error });
        }
        
        //this gets executed only if all the params are valid, i.e. checkParamsResult is null

        try {
            const bagToUpdate = new Bag(parseInt(bagId), bagType, parseInt(estId), size, tags, parseFloat(price), pickupTimeStart, pickupTimeEnd, available);
            const res = await bagRepo.updateBag(bagToUpdate);

            if (!res){
                //if res is null -> update succesful
                return res.status(HttpStatusCodes.OK).json({success: "Bag updated succesfully!"})
            }

            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({error: "Error: it's not possible to update the bag!"})
        } catch (error){
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({error: "Error: it's not possible to update the bag!"})
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