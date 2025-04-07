import express from "express";
import {isValidEmail, isValidAssignedName, isValidFamilyName} from "../validation.mjs";
import {User} from "../models/User.mjs";


export function createUsersRouter({ userRepo }) {
    const router = express.Router();
    
    // create a new user
    router.post("/", async (req, res) => {
        const { email, assignedName, familyName, password } = req.body;

        //verify email is valid
        if (!isValidEmail(email)) {
            return res.status(400).json({error: "Error: invalid email address!"});
        }

        //verify assignedName is valid
        if (!isValidAssignedName(assignedName)) {
            return res.status(400).json({ error: "Error: invalid assigned name!"});
        }

        //verify familyName is valid
        if (!isValidFamilyName(familyName)) {
            return res.status(400).json({ error: "Error: invalid family name!"});
        }
        
        //aggiungi altre verifiche


        //create new user object
        const newUser = new User(null, email, assignedName, familyName, password);
        try {
            const res_ = await userRepo.createUser(newUser);
            return res.json(newUser);
        } catch (error) {
            return res.status(500).json({ error: "Error: it's not possible to create the user!" });
        }
    });

    // update a user by id
    router.put("/:id", async (req, res) => {
        //convert id to number
        const id = parseInt(req.params.id);
        const { email, assignedName, familyName, password} = req.body;

        //verify email is valid
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Error: invalid email address!"});
        }

        //verify assignedName is valid
        if (!isValidAssignedName(assignedName)) {
            return res.status(400).json({error: "Error: invalid assigned name!"});
        }

        //verify familyName is valid
        if (!isValidFamilyName(familyName)) {
            return res.status(400).json({ error: "Error: invalid family name!"});
        }


        //aggiungi altre verifiche
        
        try {
            const existentUser = new User(id, email, assignedName, familyName, password);
            const updatedUser = await userRepo.updateUser(existentUser);
            if (!updatedUser){
                //if user is null -> updated was succesfull
                return res.status(200).json({ success: "User updated successfully!"});
            } 

            //if user is not null -> updated was not succesfull
            return res.status(500).json({ error: "Error: it's not possible to update the user!" });
        } catch (error) {
            //if error -> db error
            return res.status(500).json({ error: "Error: it's not possible to update the user!" });
        }
    });

    // get a user by id
    router.get("/:id", async (req, res) => {
        //convert id to number
        const id = parseInt(req.params.id);

        try {
            const user = await userRepo.getUserById(id);
            if (!user) {
                //if user is null -> user not found
                return res.status(404).json({ error: "Error: user not found!"});
            }

            //if user is not null -> user found
            return res.status(200).json(user);
        } catch (error) {

            //if error -> db error
            return res.status(500).json({ error: "Error: it's not possible to get the user!" });
        }
    });

    // delete a user by id
    router.delete("/:id", async (req, res) => {
        //convert id to number
        const id = parseInt(req.params.id);
        try {
            const user = await userRepo.deleteUser(id);
            return res.json(user);
        } catch (error) {
            return res.status(500).json({ error: "Error: it's not possible to delete the user!" });
        }
    });

    return router;
}