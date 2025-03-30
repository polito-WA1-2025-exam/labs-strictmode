import express from "express";
export function createBagsRouter({bagRepo}) {
    const router = express.Router();

    router.get("/", async (req, res) => {
        //get estId and convert it to number
        const queryEstId = req.query.estId;

        //case1: if no query parameter is passed
        //example: /bags
        //simply list all the available bags
        if (!queryEstId){
            const res_ = await bagRepo.listAvailable();
            if (!res){
                return res.status(404).json({ error: "No bags available!" });
            }
            return res.json(res_);
        }

        //case2: if query parameter is passed
        //example: /bags?estId=1
        //list all the bags of the establishment by estId
        const estId = parseInt(queryEstId);

        const res_ = await bagRepo.getBagsByEstId(estId);
        if (!res_){
            return res.status(400).json({ error: `Bags for establishment ${estId} not found!` });
        }
        return res.json(res_);
    });

    router.post("/", async (req, res) => {
        const { bagType, estId, size, tags, price, pickupTimeStart, pickupTimeEnd } = req.body;
        const newBag = await bagRepo.createBag(bagType, parseInt(estId), parseInt(size), tags, parseFloat(price), pickupTimeStart, pickupTimeEnd);
        return res.json(newBag);
    });

    router.get("/:bagId", async (req, res) => {
        const res_ = await bagRepo.getBag(parseInt(req.params.bagId));
        if (!res_){
            return res.status(404).json({ error: "Bag not found!" });
        }
        return res.json(res_);
    });

    return router;
}