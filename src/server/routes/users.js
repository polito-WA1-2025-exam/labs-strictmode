import express from "express";
import {isValidEmail, isValidAssignedName, isValidFamilyName} from "../validation.mjs";
import User from "../models/User.mjs";
import HttpStatusCodes from "../HttpStatusCodes.mjs"
import { hashPassword, comparePassword } from "../crypto.mjs";


export function createUsersRouter({ userRepo }) {
    const router = express.Router();
    
    // create a new user
    router.post("/", async (req, res) => {
        const { email, assignedName, familyName, password } = req.body;

        //verify email is valid
        if (!isValidEmail(email)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid email address!"});
        }

        //verify assignedName is valid
        if (!isValidAssignedName(assignedName)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: invalid assigned name!"});
        }

        //verify familyName is valid
        if (!isValidFamilyName(familyName)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: invalid family name!"});
        }
        
        //hash the password
        const hashedPassword = await hashPassword(password);

        //create new user object
        const newUser = new User(null, email, assignedName, familyName, hashedPassword);
        try {
            const res_ = await userRepo.createUser(newUser);
            return res.status(HttpStatusCodes.CREATED).json(newUser);
        } catch (error) {
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to create the user!" });
        }
    });

    // update a user by id
    router.put("/:id", async (req, res) => {
        //convert id to number
        const id = parseInt(req.params.id);

        if (isNaN(id)){ 
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: id is not a number!" });
        }

        const { email, assignedName, familyName, password, newPassword} = req.body;

        //verify email is valid
        if (!isValidEmail(email)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: invalid email address!"});
        }

        //verify assignedName is valid
        if (!isValidAssignedName(assignedName)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({error: "Error: invalid assigned name!"});
        }

        //verify familyName is valid
        if (!isValidFamilyName(familyName)) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: invalid family name!"});
        }


        //for password changes:
        //if newPassword is not null -> the user wanna change the password
        //in this case verify if the old password is correct
        //fetch the old user from the db anc compare the hashed passwords
        
        if (newPassword) {
            try {
                const fecthedUser = await userRepo.getUserById(id);

                if (fecthedUser) {
                    //user fecthed correctly -> compare passwords
                    //use bcrypt.compare: first arg is the plainText password,, second arg is the crypted password stored in the db
                    const isPasswordCorrect = await comparePassword(password, fecthedUser.password);

                    if (!isPasswordCorrect){
                        return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: "Error: invalid password!" });
                    } else {
                        //encrypt the new Password
                        password = await hashPassword(newPassword);
                    }

                } else {
                    return res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Error: user not found!"});
                }
            } catch (error) {  
                return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to get the user!" });
            }
        }
        
        
        
        
        
        try {
            const existentUser = new User(id, email, assignedName, familyName, password);
            const updatedUser = await userRepo.updateUser(existentUser);
            if (!updatedUser){
                //if user is null -> updated was succesfull
                return res.status(HttpStatusCodes.ACCEPTED).json({ success: "User updated successfully!"});
            } 

            //if user is not null -> updated was not succesfull
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to update the user!" });
        } catch (error) {
            //if error -> db error
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to update the user!" });
        }
    });

    // get a user by id
    router.get("/:id", async (req, res) => {
        //convert id to number
        const id = parseInt(req.params.id);

        if (isNaN(id)){ 
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: id is not a number!" });
        }

        try {
            const user = await userRepo.getUserById(id);
            if (!user) {
                //if user is null -> user not found
                return res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Error: user not found!"});
            }

            //if user is not null -> user found
            return res.status(HttpStatusCodes.OK).json(user);
        } catch (error) {

            //if error -> db error
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to get the user!" });
        }
    });

    // delete a user by id
    router.delete("/:id", async (req, res) => {
        //convert id to number
        const id = parseInt(req.params.id);

        if (isNaN(id)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Error: id is not a number!" });
        }

        try {
            const user = await userRepo.deleteUser(id);
            if (!res){
                //if user is null -> user deleted
                return res.status(HttpStatusCodes.OK).json({ success: "User deleted successfully!"});
            }

            //if user is not null -> user not deleted
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error: it's not possible to delete the user!" });
        } catch (error) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Error: it's not possible to delete the user!" });
        }
    });

    return router;
}