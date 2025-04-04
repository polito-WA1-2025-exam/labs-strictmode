import express from "express";
import {isValidString} from "../validation.mjs";
import {Establishment} from "../models/Establishment.mjs";



export function createEstablishmentsRouter({ estRepo }) {
    const router = express.Router();

    // create a new establishment by name, estType
    router.post("/", async (req, res) => {
        const { name, estType, address } = req.body;

        if (!isValidString(name)) {
            return res.status(400).json({error: "Error: invalid Establishment name!"});
        }

        try {
            const newEstablishment = new Establishment(null, name, null, estType, address);
            const establishment = await estRepo.createEstablishment(newEstablishment);
            return res.json(establishment);
        } catch (error) {
            return res.status(500).json({ error: "Error: it's not possible to create the establishment!" });
        }
    });

    // get establishment by id
    router.get("/:estId", async (req, res) => {
        //get estId and convert it to number
        const estId = parseInt(req.params.estId);

        try {
            const res_ = await estRepo.getEstablishment(estId);
            if (!res_) {
                return res.status(404).json({ error: "Establishment not found!" });
            }
            return res.json(res_);
        } catch (error) {
            return res.status(500).json({ error: "Error: Server error!" });
        }
    });

    // delete an establishment by id
    router.delete("/:estId", async (req, res) => {
        //get estId and convert it to number
        const estId = parseInt(req.params.estId);
        
        try {
            const establishment = await estRepo.getEstablishment(estId);
            return res.json(establishment);
        } catch (error) {
            return res.status(404).json({ error: "Establishment not found!" });
        }
        
    });


    //update establishment by id
    router.put("/:estId", async (req, res) => {
        //get estId and convert it to number
        const estId = parseInt(req.params.estId);
        const { name, bags, estType, address } = req.body;

        if (!isValidString(name)) {
            return res.status(400).json({error: "Error: invalid Establishment name!"});
        }

        try {
            const updateEstablishment = new Establishment(estId, name, bags, estType, address);
            const establishment = await estRepo.updateEstablishment(updateEstablishment);
            return res.json(establishment);
        } catch (error) {
            return res.status(500).json({ error: "Error: it's not possible to update the establishment!" });
        }
    });

    return router;
}