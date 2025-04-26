const request = require('supertest');
import express from 'express';
import {User} from "../../models/User.mjs";
import HttpStatusCodes from "../HttpStatusCodes.mjs"
import {createUsersRouter} from "./users.js";
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { hashPassword, comparePassword } from '../crypto.mjs';


//All the Mocks for the Repos are inserted here
//Mock the userRepo
const mockUserRepo = {
    createUser: vi.fn(), 
    getUserById: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
};

function setupApp() {
    const app = express();
    app.use(express.json());
    const userRouter = createUsersRouter({ userRepo: mockUserRepo });
    app.use('/users', userRouter);
    return app;
}


let app; 

//The app gets refreshed before each test suite to have a clean server for each test
beforeEach(() => {
    app = setupApp(); 
    vi.clearAllMocks(); 
});

//User Router
describe('Users Router', () => {


    test('POST /users - create a new user', async () => {
        const newUser = {
            email: 'test@example.com',
            assignedName: 'Test',
            familyName: 'User',
            password: 'password123',
        };

        //the id will be 1 and it wil be added by the db, so we mock it here
        //and the password will be hashed by the crypto module, so we mock it here too
        const createdUser = { id: 1, ...newUser, password: 'hashedPassword' }; 
        mockUserRepo.createUser.mockResolvedValue(createdUser);

        const response = await request(app)
            .post('/users')
            .send(newUser);


        //check HTTP status code
        expect(response.status).toBe(HttpStatusCodes.CREATED);

        //check response body
        expect(response.body).toEqual(createdUser);
    });

    describe('POST /users - BAD REQUEST Errors', () => {
       
        test("invalid email (different types tested)", async () => {
            let newUser = {
                email: 'invalid-email',
                assignedName: 'Test',
                familyName: 'User',
                password: 'password123',
            };

            const response = await request(app)
                .post('/users')
                .send(newUser);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body.error).toBe("Error: invalid email address!");


            //test another invalid email
            newUser.email = 'test@.com'; // invalid email
            const response2 = await request(app)
                .post('/users')
                .send(newUser);

            expect(response2.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response2.body.error).toBe("Error: invalid email address!");


            //test another invalid email
            newUser.email = 'test@com'; // invalid email
            const response3 = await request(app)
                .post('/users')
                .send(newUser);

            expect(response3.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response3.body.error).toBe("Error: invalid email address!");

            //test another invalid email
            newUser.email = 'test@com.'; // invalid email
            const response4 = await request(app)
                .post('/users')
                .send(newUser);

            expect(response4.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response4.body.error).toBe("Error: invalid email address!");

        });

        test("invalid assignedName", async () => {
            let newUser = {
                email: 'email@prova.com',
                assignedName: '', // invalid assigned name
                familyName: 'User',
                password: 'password',
            };

            const response = await request(app)
                .post('/users')
                .send(newUser);
            
            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body.error).toBe("Error: invalid assigned name!");

            //Now a user with a too long assigned name (> 100 characters)
            const longAssignedName = 'a'.repeat(101); // 101 characters
            newUser.assignedName = longAssignedName; // invalid assigned name

            const response2 = await request(app)
                .post('/users')
                .send(newUser);

            expect(response2.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response2.body.error).toBe("Error: invalid assigned name!");

        });

        test("invalid familyName", async () => {
            let newUser = {
                email: 'email@prova.com',
                assignedName: 'prova', 
                familyName: '',
                password: 'password',
            };

            const response = await request(app)
                .post('/users')
                .send(newUser);
            
            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body.error).toBe("Error: invalid family name!");

            //Now a user with a too long assigned name (> 100 characters)
            const longFamilyName = 'a'.repeat(101); // 101 characters
            newUser.familyName = longFamilyName; // invalid assigned name

            const response2 = await request(app)
                .post('/users')
                .send(newUser);

            expect(response2.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response2.body.error).toBe("Error: invalid family name!");

        });
    });


    describe('PUT /users/:id - update a user', () => {

        
        test('should update an existing user with valid data and new password', async () => {
            const userId = 1;


            const oldPasswordClear = 'oldPassword'; // The old password in clear text
            const newPasswordClear = 'newPassword'; // The new password in clear text
            const oldPasswordHash = await hashPassword(oldPasswordClear); // The old password hashed
            const newPasswordHash = await hashPassword(newPasswordClear); // The new password hashed
            //these are just to be sure that the passwords are hashed correctly by the functions I've written in crypto.mjs
            await expect(comparePassword(newPasswordClear, newPasswordHash)).resolves.toBe(true);
            await expect(comparePassword(oldPasswordClear, oldPasswordHash)).resolves.toBe(true);
            console.log("oldPasswordHash: ", oldPasswordHash);
            console.log("newPasswordHash: ", newPasswordHash);

            //we have to mock the updating of the user -> this below is the new updated user that would be returned by the db after the update
            const updatedUser = new User(userId, 'updated@example.com', 'Updated', 'User', newPasswordHash);

            const requestBody = {
                email: updatedUser.email,
                assignedName: updatedUser.assignedName,
                familyName: updatedUser.familyName,
                password: oldPasswordClear,  // Correct old password
                newPassword: newPasswordClear // The new password
            };
   
            const fetchedUserFromDb = new User(userId, 'old@example.com', 'Old', 'User', oldPasswordHash);
            mockUserRepo.getUserById.mockResolvedValue(fetchedUserFromDb);
            console.log("fetchedUserFromDb: ", fetchedUserFromDb);
            mockUserRepo.updateUser.mockResolvedValue(null); //Simulate succesfull update by user Repo

            console.log("requestBody: ", requestBody);
   
            const response = await request(app)
                .put(`/users/${userId}`)
                .send(requestBody);

            //CHECKS
            
            //check HTTP status code SUCCESS
            expect(response.status).toBe(HttpStatusCodes.ACCEPTED);
            expect(response.body).toHaveProperty('success');
            expect(mockUserRepo.getUserById).toHaveBeenCalledWith(userId);
            expect(mockUserRepo.getUserById).toHaveBeenCalledWith(userId);

            expect(mockUserRepo.updateUser).toHaveBeenCalledTimes(1); // Check that updateUser was called once (an only once)

            //THE FUNDAMENTAL FACT IS THAT BCRYPT HASHES PASSWORDS IN A DIFFERENT WAY EACH TIME -> IT DOES NOT PRODUCE TWO EQAL HASHES EVEN IF THE PASSWORDS ARE THE SAME
            //we therefore CANNOT just check if the hashes of the passwords are the same!
            expect(mockUserRepo.updateUser).toHaveBeenCalledWith(expect.objectContaining({ //check the properties, not the exact object
                id: userId,
                email: 'updated@example.com',
                assignedName: 'Updated',
                familyName: 'User',
                password: expect.any(String), //the hashed password will be different each time, later I have put my solution to check the pass
            }));


            //CHECK IF PASSWORD WAS CHANGED CORRECTLY!
            //Now, the best solution for me is to take te hashed new password from the call to the updateUser mock and check if it matches the new password in clear text
            const updateUserCallArgs = mockUserRepo.updateUser.mock.calls[0][0];
            const hashedPasswordPassedToUpdate = updateUserCallArgs.password;
            expect(typeof hashedPasswordPassedToUpdate).toBe('string');
            
            //CHECK IF THE PASSWORD MATCHES THE NEW PASSWORD IN CLEAR TEXT (WE CANNOT COMPARE DIRECTLY THE HASHES)
            const passwordMatchesNewPassword = await comparePassword(newPasswordClear, hashedPasswordPassedToUpdate);
            expect(passwordMatchesNewPassword).toBe(true); 
            
            //CHECK IF THE PASSWORD DOES NOT MATCHES THE OLD PASSWORD IN CLEAR TEXT (WE CANNOT COMPARE DIRECTLY THE HASHES)
            const passwordMatchesOldPassword = await comparePassword(oldPasswordClear, hashedPasswordPassedToUpdate);
            expect(passwordMatchesOldPassword).toBe(false); // The password should not match the old password
            
        });


    }, 10000); //timeout increased just to be sure since the test is long




});