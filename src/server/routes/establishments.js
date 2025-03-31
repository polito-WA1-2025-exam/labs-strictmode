import express from "express";
export function createEstablishmentsRouter({ estRepo }) {
    const router = express.Router();

    // create a new establishment by name, estType
    router.post("/", async (req, res) => {
        const { name, estType } = req.body;
        const res_ = await estRepo.createEstablishment(name, estType);
        return res.json(res_);
    });

    // get establishment by id
    router.get("/:estId", async (req, res) => {
        //get estId and convert it to number
        const estId = parseInt(req.params.estId);

        const res_ = await estRepo.getEstablishment(estId);
        if (!res_) {
            return res.status(400).json({ error: "Establishment not found!" });
        }
        return res.json(res_);
    });

    // delete an establishment by id
    router.delete("/:estId", async (req, res) => {
        //get estId and convert it to number
        const estId = parseInt(req.params.estId);

        const res_ = await estRepo.deleteEstablishment(estId);
        return res.json(res_);
    });

    return router;
}