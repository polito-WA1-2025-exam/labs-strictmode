import express from "express";
import {isValidEmail, isValidAssignedName, isValidFamilyName} from "../utils.mjs";


export function createUsersRouter({ userRepo }) {
    const router = express.Router();
    
    // create a new user
    router.post("/", async (req, res) => {
        const { email, assignedName, familyName } = req.body;

        //verify email is valid
        if (!isValidEmail(email)) {
            return res.status(400).json("Error: invalid email address!");
        }

        //verify assignedName is valid
        if (!isValidAssignedName(assignedName)) {
            return res.status(400).json("Error: invalid assigned name!");
        }

        //verify familyName is valid
        if (!isValidFamilyName(familyName)) {
            return res.status(400).json("Error: invalid family name!");
        }
        
        const newUser = await userRepo.createUser(email, assignedName, familyName);
        return res.json(newUser);
    });

    // update a user by id
    router.put("/:id", async (req, res) => {
        //convert id to number
        const id = parseInt(req.params.id);
        const { email, assignedName, familyName } = req.body;

        //verify email is valid
        if (!isValidEmail(email)) {
            return res.status(400).json("Error: invalid email address!");
        }

        //verify assignedName is valid
        if (!isValidAssignedName(assignedName)) {
            return res.status(400).json("Error: invalid assigned name!");
        }

        //verify familyName is valid
        if (!isValidFamilyName(familyName)) {
            return res.status(400).json("Error: invalid family name!");
        }

        const updatedUser = await userRepo.updateUser(id, email, assignedName, familyName);
        return res.json(updatedUser);
    });

    // get a user by id
    router.get("/:id", async (req, res) => {
        //convert id to number
        const id = parseInt(req.params.id);
        const user = await userRepo.getUserById(id);
        if (!user) {
            return res.status(404).json("Error: user not found!");
        }
        return res.json(user);
    });

    // delete a user by id
    router.delete("/:id", async (req, res) => {
        //convert id to number
        const id = parseInt(req.params.id);
        try {
            const user = await userRepo.deleteUser(id);
            return res.json(user);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    });

    return router;
}