import express from "express";
import {isValidString} from "../validation.mjs";
import {Establishment} from "../../models/Establishment.mjs";
import HttpStatusCodes from "../HttpStatusCodes.mjs"


export function createEstablishmentsRouter({ estRepo }) {
    const router = express.Router();

    // create a new establishment by name, estType
    router.post("/", async (req, res) => {
        const { name, estType, address } = req.body;

        if (!isValidString(name)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid Establishment name!"});
        }

        if (!isValidString(address)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid Establishment address!"});
        }

        try {
            //id, name, bags, estType, address
            const newEstablishment = new Establishment(null, name, null, estType, address);
            const establishment = await estRepo.createEstablishment(newEstablishment);
            return res.status(HttpStatusCodes.CREATED).json(establishment);
        } catch (error) {
            // if error -> db error
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to create the establishment!" });
        }
    });

    // get establishment by id
    router.get("/:estId", async (req, res) => {
        //get estId and convert it to number
        const estId = parseInt(req.params.estId);
        if (isNaN(estId)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: invalid Establishment id!" });
        }

        try {
            const res_ = await estRepo.getEstablishmentById(estId);
            if (!res_) {
                // if res_ is null, establishment not found
                return res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Error: establishment not found!" });
            }

            // if res_ is not null, establishment found
            return res.json(res_);
        } catch (error) {
            // if error -> db error
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to get the establishment!" });
        }
    });

    // delete an establishment by id
    router.delete("/:estId", async (req, res) => {
        //get estId and convert it to number
        const estId = parseInt(req.params.estId);
        if (isNaN(estId)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: invalid Establishment id!" });
        }
        
        try {
            const establishment = await estRepo.deleteEstablishment(estId);
            if (!establishment){
                //if establishment is null -> deletion successful
                return res.status(HttpStatusCodes.OK).json({ success: "Establishment deleted successfully!" });
            }

            //if establishment is not null -> deletion not successful
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to delete the establishment!" });
        } catch (error) {
            //if error -> est not found / db error
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to delete the establishment!" });
        }
        
    });


    //update establishment by id
    router.put("/:estId", async (req, res) => {
        //get estId and convert it to number
        const estId = parseInt(req.params.estId);
        const { name, bags, estType, address } = req.body;

        if (!isValidString(name)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid Establishment name!"});
        }

        if (!isValidString(address)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid Establishment address!"});
        }

        try {
            const updateEstablishment = new Establishment(estId, name, bags, estType, address);
            const establishment = await estRepo.updateEstablishment(updateEstablishment);
            
            if (!establishment) {
                // if establishment is null, update successful
                return res.status(HttpStatusCodes.OK).json({ success: "Establishment updated successfully!" });
            }

            // if establishment is not null, update not successful
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to update the establishment!" });
        } catch (error) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Error: it's not possible to update the establishment!" });
        }
    });


    //delete establishment by id
    router.delete("/:estId", async (req, res) => {
        //get estId and convert it to number
        const estId = parseInt(req.params.estId);

        try {
            const establishment = await estRepo.deleteEstablishment(estId);
            if (!establishment) {
                // if establishment is null, deletion successful
                return res.status(HttpStatusCodes.OK).json({ success: "Establishment deleted successfully!" });
            }

            // if establishment is not null, deletion not successful
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to delete the establishment!" });
        } catch (error) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Error: it's not possible to delete the establishment!" });
        }
    });


    //get all establishments
    router.get("/", async (req, res) => {
        try {
            const establishments = await estRepo.listAllEstablishments();
            
            if (!establishments) {
                // if establishments is null, no establishments found
                return res.status(HttpStatusCodes.NOT_FOUND).json({ error: "No establishments found!" });
            }

            // if establishments is not null, establishments found
            return res.status(HttpStatusCodes.OK).json(establishments);
        } catch (error) {
            // if error -> db error
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: Server error!" });
        }
    });


    //get all bags by establishment id
    router.get("/:estId/bags", async (req, res) => {
        //get estId and convert it to number
        const estId = parseInt(req.params.estId);
        if (isNaN(estId)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: invalid Establishment id!" });
        }

        try {

            const bags = await estRepo.getBags(estId);
            return res.status(HttpStatusCodes.OK).json(bags);
        } catch (error) {
            // if error -> db error
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to get the bags!" });
        }
    });


    return router;
}