const request = require('supertest');
import express from 'express';
import { createServer } from '../server.mjs';
import {User, Establishment, Bag, BagItem, CartItem, Reservation, Cart} from "../../models/index.mjs";
import HttpStatusCodes from "../HttpStatusCodes.mjs"
import {createUsersRouter, createEstablishmentsRouter, createBagsRouter, createReservationsRouter, createCartsRouter} from "./index.mjs";
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { hashPassword, comparePassword } from '../crypto.mjs';
import dayjs from 'dayjs';

function toPlainObject(obj) {
    //function to convert an object to a plain object (removing any prototype methods)
    //since the responses are all plain objects, in order to compare our sample objects with the responses, we need to convert them to plain objects
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(toPlainObject);
    }
    const plainObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        plainObj[key] = toPlainObject(obj[key]);
      }
    }
    return plainObj;
  }

//All the Mocks for the Repos are inserted here
//Mock the userRepo
const mockUserRepo = {
    createUser: vi.fn(), 
    getUserById: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
};
//Mock the establishmentRepo
const mockEstablishmentRepo = {
    createEstablishment: vi.fn(),
    getEstablishmentById: vi.fn(),
    updateEstablishment: vi.fn(),
    deleteEstablishment: vi.fn(),
    getBags: vi.fn(),
    listAllEstablishments: vi.fn()
};
//Mock the bagRepo
const mockBagRepo = {
    createBag: vi.fn(),
    getBagById: vi.fn(),
    updateBag: vi.fn(),
    deleteBag: vi.fn(),
    getBagListByEstId: vi.fn(),
    getItems: vi.fn(),
    setAvailable: vi.fn(),
    listAvailable: vi.fn(),
    checkBagAvailable: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
    getAllBags: vi.fn()
};
//Mock the cartRepo
const mockCartRepo = {
    getCartByUserId: vi.fn(),
    addBag: vi.fn(),
    removeBag: vi.fn(),
    personalizeBag: vi.fn()
};
//Mock the reservationRepo
const mockReservationRepo = {
    createReservation: vi.fn(),
    checkEstablishmentContraint: vi.fn(),
    getReservationByCartItemId: vi.fn(),
    listReservationsByUser: vi.fn(),
    listReservationsByEstablishment: vi.fn(),
    cancelReservation: vi.fn()
};

let app; 

//The app gets refreshed before each test suite to have a clean server for each test
beforeEach(() => {
    app = createServer({
        userRepo: mockUserRepo,
        estRepo: mockEstablishmentRepo,
        bagRepo: mockBagRepo,
        cartRepo: mockCartRepo,
        resRepo: mockReservationRepo
    });
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
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: invalid email address!");


            //test another invalid email
            newUser.email = 'test@.com'; // invalid email
            const response2 = await request(app)
                .post('/users')
                .send(newUser);

            expect(response2.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
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
            expect(response.body).toHaveProperty('error');
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
            expect(response.body).toHaveProperty('error');
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
            expect(response.body).toHaveProperty('error');
            expect(response2.body.error).toBe("Error: invalid family name!");

        });
    });

    test("POST /users - INTERNAL SERVER ERROR", async () => {
        //userRepo.updateUser(existentUser) PROMISE REJECTED
        mockUserRepo.createUser.mockRejectedValue(new Error("Database error"));

        let requestBody = {
            email: "prova@mail.com",
            assignedName: "prova",
            familyName: "prova",
            password: "pass",  
        };

        const response = await request(app)
            .post('/users')
            .send(requestBody);

        expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: it's not possible to create the user!");
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


    describe('PUT /users/:id - BAD REQUEST Errors', () => {
        test('invalid user email', async () => {


            const requestBody = {
                email: "prova#mail.com",
                assignedName: "Error 404",
                familyName: "Unexisting",
                password: "pass",  
            };

            const response = await request(app)
                .put('/users/999') 
                .send(requestBody);
            
            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: invalid email address!");


        });

        test('invalid user assignedName', async () => {
            let requestBody = {
                email: "prova@mail.com",
                assignedName: "",
                familyName: "Unexisting",
                password: "pass",  
            };

            const response = await request(app)
                .put('/users/999') 
                .send(requestBody);
            
            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body.error).toBe("Error: invalid assigned name!");


            requestBody.assignedName = "a".repeat(101); // 101 characters
            const response2 = await request(app)
                .put('/users/999') 
                .send(requestBody);

            expect(response2.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response2.body.error).toBe("Error: invalid assigned name!");
        });


        test('invalid user familyName', async () => {
            let requestBody = {
                email: "prova@mail.com",
                assignedName: "prova",
                familyName: "",
                password: "pass",  
            };

            const response = await request(app)
                .put('/users/999') 
                .send(requestBody);
            
            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body.error).toBe("Error: invalid family name!");


            requestBody.familyName = "a".repeat(101); // 101 characters
            const response2 = await request(app)
                .put('/users/999') 
                .send(requestBody);

            expect(response2.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response2.body.error).toBe("Error: invalid family name!");
        });

    });

    test('PUT /users/:id - UNAUTHORIZED Error if old password is incorrect', async () => {
        const userId = 1;
        const oldPasswordClear = 'correctOldPassword';
        const wrongPasswordClear = 'incorrectOldPassword'; // The incorrect password
        const newPasswordClear = 'newPassword';

        // Hash the *correct* old password as it would be stored in the DB
        const oldPasswordHash = await hashPassword(oldPasswordClear);

        // Mock getUserById to return the user with the correct hashed password
        const fetchedUserFromDb = new User(userId, 'user@example.com', 'Test', 'User', oldPasswordHash);
        mockUserRepo.getUserById.mockResolvedValue(fetchedUserFromDb);

        const requestBody = {
            email: 'updated@example.com', 
            assignedName: 'Updated',
            familyName: 'User',
            password: wrongPasswordClear, // Provide the INCORRECT old password
            newPassword: newPasswordClear
        };

        const response = await request(await app) 
            .put(`/users/${userId}`)
            .send(requestBody);

        // Expect a 401 Unauthorized status code
        expect(response.status).toBe(HttpStatusCodes.UNAUTHORIZED);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: invalid password!");
    });

    test("PUT /users/:id - INTERNAL SERVER ERROR", async () => {
        //userRepo.updateUser(existentUser) PROMISE REJECTED
        mockUserRepo.updateUser.mockRejectedValue(new Error("Database error"));

        let requestBody = {
            email: "prova@mail.com",
            assignedName: "prova",
            familyName: "prova",
            password: "pass",  
        };

        const response = await request(app)
            .put('/users/999') 
            .send(requestBody);

        expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: it's not possible to update the user!");
    });



        test('GET /users/:id - get a user by id', async () => {
            const userId = 1;
            const returnedUser = new User(userId, 'prova@mail.com', 'prova', 'prova', 'hashedPassword');
            mockUserRepo.getUserById.mockResolvedValue(returnedUser);

            const response = await request(app)
                .get(`/users/${userId}`);

            expect(response.status).toBe(HttpStatusCodes.OK);
            expect(response.body).toEqual(returnedUser);

        });

        test('GET /users/:id - BAD REQUEST Error', async () => {
            const userId = 'invalid-id'; //it will turn out to be NaN
            const response = await request(app)
                .get(`/users/${userId}`);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: id is not a number!");
        });

        test('GET /users/:id - NOT FOUND Error', async () => {
            const userId = 999; //assuming this user does not exist
            mockUserRepo.getUserById.mockResolvedValue(null); //simulate user not found

            const response = await request(app)
                .get(`/users/${userId}`);

            expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: user not found!");
        });


        test('GET /users/:id - INTERNAL SERVER ERROR', async () => {
            const userId = 1;
            mockUserRepo.getUserById.mockRejectedValue(new Error("Database error"));

            const response = await request(app)
                .get(`/users/${userId}`);

            expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: it's not possible to get the user!");
        });

        test('DELETE /users/:id - delete a user by id', async () => {
            const userId = 1;
            mockUserRepo.deleteUser.mockResolvedValue(null); //Simulate successful deletion

            const response = await request(app)
                .delete(`/users/${userId}`);

            expect(response.status).toBe(HttpStatusCodes.OK);
            expect(response.body).toHaveProperty('success');
            expect(response.body.success).toBe("User deleted successfully!");
        });

        test('DELETE /users/:id - BAD REQUEST Error', async () => {
            const userId = 'invalid-id'; //it will turn out to be NaN
            const response = await request(app)
                .delete(`/users/${userId}`);
            
            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: id is not a number!");
        });

        test('DELETE /users/:id - INTERNAL SERVER ERROR', async () => {
            const userId = 1;
            mockUserRepo.deleteUser.mockRejectedValue(new Error("Database error"));

            const response = await request(app)
                .delete(`/users/${userId}`);

            expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: it's not possible to delete the user!");
        });




});


//Establishment Router
describe('Establishments Router', () => {

    test('POST /establishments - create a new establishment', async () => {
        const newEstablishment = {
            name: 'Test Establishment',
            bags: null,
            estType: 'Test Type',
            address: '123 Test St'
        };

        //the id will be 1 and it wil be added by the db, so we mock it here
        const createdEstablishment = { id: 1, ...newEstablishment };
        mockEstablishmentRepo.createEstablishment.mockResolvedValue(createdEstablishment);

        const requestBody = {
            name: newEstablishment.name,
            estType: newEstablishment.estType,
            address: newEstablishment.address
        };

        const response = await request(app)
            .post('/establishments')
            .send(requestBody);

        //check HTTP status code
        expect(response.status).toBe(HttpStatusCodes.CREATED);
        expect(response.body).toEqual(createdEstablishment);

    });

    describe('POST /establishments - BAD REQUEST Errors', () => {
        test("invalid establishment name", async () => {
            let newEstablishment = {
                name: '', // invalid name
                estType: 'Test Type',
                address: '123 Test St'
            };

            const response = await request(app)
                .post('/establishments')
                .send(newEstablishment);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: invalid Establishment name!");


        });

        test("invalid establishment address", async () => {
            let newEstablishment = {
                name: 'Test Establishment',
                estType: 'Test Type',
                address: '' // invalid address
            };

            const response = await request(app)
                .post('/establishments')
                .send(newEstablishment);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: invalid Establishment address!");


        });
    });

    test("POST /establishments - INTERNAL SERVER ERROR", async () => {
        //establishmentRepo.createEstablishment(newEstablishment) PROMISE REJECTED
        mockEstablishmentRepo.createEstablishment.mockRejectedValue(new Error("Database error"));

        let requestBody = {
            name: "prova",
            estType: "prova",
            address: "prova"
        };

        const response = await request(app)
            .post('/establishments')
            .send(requestBody);

        expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: it's not possible to create the establishment!");
    });

    test('GET /establishments/:estId - get an establishment by id', async () => {
        const estId = 1;
        const returnedEstablishment = new Establishment(estId, 'prova', null, 'prova', 'hashedPassword');
        mockEstablishmentRepo.getEstablishmentById.mockResolvedValue(returnedEstablishment);

        const response = await request(app)
            .get(`/establishments/${estId}`);

        expect(response.status).toBe(HttpStatusCodes.OK);
        expect(response.body).toEqual(returnedEstablishment);

    });

    test('GET /establishments/:estId - BAD REQUEST Error', async () => {
        const estId = 'invalid-id'; //it will turn out to be NaN
        const response = await request(app)
            .get(`/establishments/${estId}`);

        expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: invalid Establishment id!");
    });

    test('GET /establishments/:estId - NOT FOUND Error', async () => {
        const estId = 999; //assuming this establishment does not exist
        mockEstablishmentRepo.getEstablishmentById.mockResolvedValue(null); //simulate establishment not found

        const response = await request(app)
            .get(`/establishments/${estId}`);

        expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: establishment not found!");
    });

    test('GET /establishments/:estId - INTERNAL SERVER ERROR', async () => {
        const estId = 1;
        mockEstablishmentRepo.getEstablishmentById.mockRejectedValue(new Error("Database error"));

        const response = await request(app)
            .get(`/establishments/${estId}`);

        expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: it's not possible to get the establishment!");
    });

    test('GET /establishments - get all establishments', async () => {
        const establishments = [
            new Establishment(1, 'Establishment 1', null, 'Type 1', 'Address 1'),
            new Establishment(2, 'Establishment 2', null, 'Type 2', 'Address 2')
        ];
        mockEstablishmentRepo.listAllEstablishments.mockResolvedValue(establishments);

        const response = await request(app)
            .get('/establishments/');

        expect(response.status).toBe(HttpStatusCodes.OK);
        expect(response.body).toEqual(establishments);
    });

    test('GET /establishments/bags/:estId - get all bags of an establishment', async () => {
        const estId = 1;
        const bags = [
            //dates are inserted with the string format YYYY-MM-DDTHH:mm:ss.sssZ just for testing purposes, in readlity in db they are saved and then parsed with dayjs
            { id: 1, estId: estId, size: 'small', bagType: 'type1', tags: 'tag1', price: 10.0, pickupTimeStart: "2023-09-30T22:00:00.000Z", pickupTimeEnd: "2023-10-01T22:00:00.000Z", available: true },
            { id: 2, estId: estId, size: 'large', bagType: 'type2', tags: 'tag2', price: 20.0, pickupTimeStart: "2023-10-02T22:00:00.000Z", pickupTimeEnd: "2023-10-03T22:00:00.000Z", available: false }
        ];
        mockEstablishmentRepo.getBags.mockResolvedValue(bags);

        const response = await request(app)
            .get(`/establishments/${estId}/bags`);

        expect(response.status).toBe(HttpStatusCodes.OK);
        expect(response.body).toEqual(bags);

    });


    test('DELETE /establishments/:estId - delete an establishment by id', async () => {
        const estId = 1;
        const establishment = new Establishment(estId, 'prova', null, 'prova', 'hashedPassword');
        mockEstablishmentRepo.getEstablishmentById.mockResolvedValue(establishment); //simulate establishment found

        const response = await request(app)
            .delete(`/establishments/${estId}`);

        expect(response.status).toBe(HttpStatusCodes.OK);
        expect(response.body).toHaveProperty('success');
        expect(response.body.success).toBe("Establishment deleted successfully!");
    });

    test('DELETE /establishments/:estId - BAD REQUEST Error', async () => {
        const estId = 'invalid-id'; //it will turn out to be NaN
        const response = await request(app)
            .delete(`/establishments/${estId}`);
        
        expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: invalid Establishment id!");
    });

    test('DELETE /establishments/:estId - INTERNAL SERVER ERROR', async () => {
        const estId = 1;
        mockEstablishmentRepo.deleteEstablishment.mockRejectedValue(new Error("Database error"));

        const response = await request(app)
            .delete(`/establishments/${estId}`);

        expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: it's not possible to delete the establishment!");
    });


  

});


//Bags Router
describe('Bags Router', () => {

    test('POST /bags - create a new bag', async () => {
        //const { bagType, estId, size, tags, price, pickupTimeStart, pickupTimeEnd, available } = req.body;
        const newBag = {
            bagType: 'regular',
            estId: 1,
            size: 'small',
            tags: 'tag1',
            price: 10.0,
            pickupTimeStart: dayjs().toISOString(),
            pickupTimeEnd: dayjs().add(1, 'day').toISOString(),
            available: true
        };
        
        //mock the establishmentRepo to return a valid establishment for the given estId
        const establishment = new Establishment(newBag.estId, 'Test Establishment', null, 'Test Type', '123 Test St');
        mockEstablishmentRepo.getEstablishmentById.mockResolvedValue(establishment);

        //the id will be 1 and it wil be added by the db, so we mock it here
        const createdBag = { id: 1, ...newBag };
        mockBagRepo.createBag.mockResolvedValue(createdBag);

        const response = await request(app)
            .post('/bags')
            .send(newBag);


        //check HTTP status code
        expect(response.status).toBe(HttpStatusCodes.CREATED);

        //check response body
        expect(response.body).toEqual(createdBag);
    });

});
    
    

    describe('POST /bags - BAD REQUEST Errors', () => {

        test("invalid bagType", async () => {
            let newBag = {
                bagType: 'big', // invalid bagType: it mus be 'regular' or 'express'
                estId: 1,
                size: 'small',
                tags: 'tag1',
                price: 10.0,
                pickupTimeStart: dayjs().toISOString(),
                pickupTimeEnd: dayjs().add(1, 'day').toISOString(),
                available: true
            };

            const response = await request(app)
                .post('/bags')
                .send(newBag);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: invalid bag type!");


        });

        test("invalid establishment id", async () => {
            let newBag = {
                bagType: 'regular',
                estId: 999, // invalid establishment id (assuming it does not exist)
                size: 'small',
                tags: 'tag1',
                price: 10.0,
                pickupTimeStart: dayjs().toISOString(),
                pickupTimeEnd: dayjs().add(1, 'day').toISOString(),
                available: true
            };

            //mock the establishmentRepo to return null for the given estId
            mockEstablishmentRepo.getEstablishmentById.mockResolvedValue(null);

            const response = await request(app)
                .post('/bags')
                .send(newBag);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: invalid establishment id!");

        });

        test("invalid size", async () => {
            let newBag = {
                bagType: 'regular',
                estId: 1,
                size: '', // invalid size
                tags: 'tag1',
                price: 10.0,
                pickupTimeStart: dayjs().toISOString(),
                pickupTimeEnd: dayjs().add(1, 'day').toISOString(),
                available: true
            };

            const response = await request(app)
                .post('/bags')
                .send(newBag);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: invalid bag size!");

        });


        test("invalid pickupTimeStart", async () => {
            let newBag = {
                bagType: 'regular',
                estId: 1,
                size: 'small',
                tags: 'tag1',
                price: 10.0,
                pickupTimeStart: 'invalid-date', // invalid date
                pickupTimeEnd: dayjs().add(1, 'day').toISOString(),
                available: true
            };

            const response = await request(app)
                .post('/bags')
                .send(newBag);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: invalid pickup time start!");

        });

        test("invalid pickupTimeEnd", async () => {
            let newBag = {
                bagType: 'regular',
                estId: 1,
                size: 'small',
                tags: 'tag1',
                price: 10.0,
                pickupTimeStart: dayjs().toISOString(),
                pickupTimeEnd: 'invalid-date', // invalid date
                available: true
            };

            const response = await request(app)
                .post('/bags')
                .send(newBag);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: invalid pickup time end!");

        });


        test("pickupTimeEnd before pickupTimeStart", async () => {
            const newBag = {
                bagType: 'regular',
                estId: 1,
                size: 'small',
                tags: 'tag1',
                price: 10.0,
                pickupTimeStart: dayjs().add(2, 'day').toISOString(), // Start time is after end time
                pickupTimeEnd: dayjs().add(1, 'day').toISOString(), // End time is before start time
                available: true
            };

            const response = await request(app)
                .post('/bags')
                .send(newBag);
            
            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: pickup time start is after pickup time end!");
           
        });


        test("pickupTimeEnd in the past wrt now", async () => {
            let newBag = {
                bagType: 'regular',
                estId: 1,
                size: 'small',
                tags: 'tag1',
                price: 10.0,
                pickupTimeStart: dayjs().subtract(2, 'day').toISOString(), // Start time is in the future
                pickupTimeEnd: dayjs().subtract(1, 'day').toISOString(), // End time is in the past
                available: true
            };

            const response = await request(app)
                .post('/bags')
                .send(newBag);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: pickup time end cannot be in the past!");


            newBag.pickupTimeEnd = dayjs().subtract(1, 'hour').toISOString(); // End time is in the past aswell: 1 hours ago

            const response2 = await request(app)
                .post('/bags')
                .send(newBag);
            
            expect(response2.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response2.body).toHaveProperty('error');
            expect(response2.body.error).toBe("Error: pickup time end cannot be in the past!");


            newBag.pickupTimeEnd = dayjs().subtract(1, 'second').toISOString(); // End time is in the past aswell: 1 second ago
            const response3 = await request(app)
                .post('/bags')
                .send(newBag);
            
            expect(response3.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response3.body).toHaveProperty('error');
            expect(response3.body.error).toBe("Error: pickup time end cannot be in the past!");


        });


        test("invalid price", async () => {
            let newBag = {
                bagType: 'regular',
                estId: 1,
                size: 'small',
                tags: 'tag1',
                price: -10.0, // invalid price (negative value)
                pickupTimeStart: dayjs().toISOString(),
                pickupTimeEnd: dayjs().add(1, 'day').toISOString(),
                available: true
            };

            const response = await request(app)
                .post('/bags')
                .send(newBag);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: invalid price!");


            newBag.price = 0; // invalid price (zero value)

            const response2 = await request(app)
                .post('/bags')
                .send(newBag);

            expect(response2.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response2.body.error).toBe("Error: invalid price!");


            newBag.price = 'invalid-price'; // invalid price (not a number)

            const response3 = await request(app)
                .post('/bags')
                .send(newBag);

            expect(response2.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response2.body.error).toBe("Error: invalid price!");

        });


        test("invalid available", async () => {

            let newBag = {
                bagType: 'regular',
                estId: 1,
                size: 'small',
                tags: 'tag1',
                price: 10.0,
                pickupTimeStart: dayjs().toISOString(),
                pickupTimeEnd: dayjs().add(1, 'day').toISOString(),
                available: 'not-a-boolean' // invalid available (not a boolean)
            };

            const response = await request(app)
                .post('/bags')
                .send(newBag);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe("Error: invalid available value!");


            newBag.available = 1; // invalid available (not a boolean)

            const response2 = await request(app)
                .post('/bags')
                .send(newBag);

            expect(response2.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error');
            expect(response2.body.error).toBe("Error: invalid available value!");


        });



    });


    test("POST /bags - INTERNAL SERVER ERROR", async () => {
        //bagRepo.createBag(newBag) PROMISE REJECTED
        mockBagRepo.createBag.mockRejectedValue(new Error("Database error"));

        let requestBody = {
            bagType: "regular",
            estId: 1,
            size: "medium",
            tags: "prova",
            price: 10.0,
            pickupTimeStart: dayjs().toISOString(),
            pickupTimeEnd: dayjs().add(1, 'day').toISOString(),
            available: true
        };

        //mock the establishmentRepo to return a valid establishment for the given estId
        const establishment = new Establishment(requestBody.estId, 'Test Establishment', null, 'Test Type', '123 Test St');
        mockEstablishmentRepo.getEstablishmentById.mockResolvedValue(establishment);

        const response = await request(app)
            .post('/bags')
            .send(requestBody);

        expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: it's not possible to create the bag!");
    });

    test('PUT /bags/:bagId - update a bag by id', async () => {
        const bagId = 1;
        const updatedBag = {
            bagType: 'regular',
            estId: 1,
            size: 'large',
            tags: 'tag2',
            price: 15.0,
            pickupTimeStart: dayjs().toISOString(),
            pickupTimeEnd: dayjs().add(2, 'day').toISOString(),
            available: false
        };

        //mock the establishmentRepo to return a valid establishment for the given estId
        const establishment = new Establishment(updatedBag.estId, 'Test Establishment', null, 'Test Type', '123 Test St');
        mockEstablishmentRepo.getEstablishmentById.mockResolvedValue(establishment);

        //mock the bagRepo to return null (= success) when updating
        mockBagRepo.updateBag.mockResolvedValue(null); //simulate successful update

        const response = await request(app)
            .put(`/bags/${bagId}`)
            .send(updatedBag);

        expect(response.status).toBe(HttpStatusCodes.OK);
        expect(response.body).toHaveProperty('success');
        expect(response.body.success).toBe("Bag updated successfully!");

    });

    test('PUT /bags/:bagId - BAD REQUEST Error - invalid bagId', async () => {
        const bagToUpdate = {
            bagType: 'regular',
            estId: 1,
            size: 'large',
            tags: 'tag2',
            price: 15.0,
            pickupTimeStart: dayjs().toISOString(),
            pickupTimeEnd: dayjs().add(2, 'day').toISOString(),
            available: false
        };

        const bagIdNaN = 'invalid-id'; //it will turn out to be NaN

        
        const response = await request(app)
            .put(`/bags/${bagIdNaN}`)
            .send(bagToUpdate);

        expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: invalid bag id!");

        //invaliid PUT w/out bagId param
        const response2 = await request(app)
            .put('/bags/')
            .send(bagToUpdate);

        expect(response2.status).toBe(HttpStatusCodes.NOT_FOUND);
        

    });

    test('PUT /bags/:bagId - INTERNAL SERVER ERROR', async () => {
        const bagId = 1;
        const updatedBag = {
            bagType: 'regular',
            estId: 1,
            size: 'large',
            tags: 'tag2',
            price: 15.0,
            pickupTimeStart: dayjs().toISOString(),
            pickupTimeEnd: dayjs().add(2, 'day').toISOString(),
            available: false
        };

        //mock the establishmentRepo to return a valid establishment for the given estId
        const establishment = new Establishment(updatedBag.estId, 'Test Establishment', null, 'Test Type', '123 Test St');
        mockEstablishmentRepo.getEstablishmentById.mockResolvedValue(establishment);

        //mock the bagRepo to return reject the promise when updating
        mockBagRepo.updateBag.mockRejectedValue(new Error("Database error")); //simulate error when updating

        const response = await request(app)
            .put(`/bags/${bagId}`)
            .send(updatedBag);
        
        expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: it's not possible to update the bag!");


    });


    test("GET /bags/:bagId - get a bag by id", async () => {
        const bagId = 1;
        const returnedBag = new Bag(bagId, 1, 'regular', 'small', 'tag1', 10.0, dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), true);
        mockBagRepo.getBagById.mockResolvedValue(returnedBag);

        const response = await request(app)
            .get(`/bags/${bagId}`);

        expect(response.status).toBe(HttpStatusCodes.OK);
        expect(response.body).toEqual(returnedBag);

    });

    test("GET /bags/:bagId - BAD REQUEST Error - invalid id", async () => {
        const bagId = 'invalid-id'; //it will turn out to be NaN
        const response = await request(app)
            .get(`/bags/${bagId}`);

        expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: invalid bag id!");
    });

    test("GET /bags/:bagId - NOT FOUND Error", async () => {
        const bagId = 999; //assuming this bag does not exist
        mockBagRepo.getBagById.mockResolvedValue(null); //simulate bag not found

        const response = await request(app)
            .get(`/bags/${bagId}`);

        expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: Bag not found!");
    });

    test("GET /bags/:bagId - INTERNAL SERVER ERROR", async () => {
        const bagId = 1;
        mockBagRepo.getBagById.mockRejectedValue(new Error("Database error"));

        const response = await request(app)
            .get(`/bags/${bagId}`);

        expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: it's not possible to get the bag!");
    });


    test("GET /bags - get all available bags", async () => {
        let bags = [
            new Bag(1, 1, 'regular', 'small', 'tag1', 10.0, dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), true),
            new Bag(2, 1, 'express', 'large', 'tag2', 20.0, dayjs().toISOString(), dayjs().add(2, 'day').toISOString(), true)
        ];
        mockBagRepo.listAvailable.mockResolvedValue(bags);

        const response = await request(app)
            .get('/bags/');

        expect(response.status).toBe(HttpStatusCodes.OK);
        expect(response.body).toEqual(bags);

        //Verify correct repo method was called
        expect(mockBagRepo.listAvailable).toHaveBeenCalled(); // Ensure listAvailable was called

        expect(mockBagRepo.getBagById).not.toHaveBeenCalled(); // Ensure getBagById was NOT called


        bags[0].available = false; // Set the first bag to not available

        mockBagRepo.listAvailable.mockResolvedValue([bags[1]]); // Mock the repository to return only the second bag
        const response2 = await request(app)
            .get('/bags/');

        expect(response2.status).toBe(HttpStatusCodes.OK);
        expect(response2.body).toEqual([bags[1]]); // Check that only the available bag is returned

        expect(mockBagRepo.listAvailable).toHaveBeenCalled(); // Ensure listAvailable was called again

        expect(mockBagRepo.getBagById).not.toHaveBeenCalled(); // Ensure getBagById was NOT called again

    });

    test("GET /bags?estId=X - get all bags of establishment having X as its id", async () => {
        const estId = 1;
        const bags = [
            // Ensure bags have the correct estId property
            new Bag(1, estId, 'regular', 'small', 'tag1', 10.0, dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), true),
            new Bag(2, estId, 'express', 'large', 'tag2', 20.0, dayjs().toISOString(), dayjs().add(2, 'day').toISOString(), true)
        ];

        // Mock the repository method that the router.get("/") handler calls
        // when the estId query parameter is present.
        mockBagRepo.getBagListByEstId.mockResolvedValue(bags);


        const response = await request(await app) 
            .get('/bags') // Base path
            .query({ estId: estId }); // Add query parameter
        

        expect(response.status).toBe(HttpStatusCodes.OK);
        expect(response.body).toEqual(bags);

        //Verify correct repo method was called
        const establishment = new Establishment(estId, null, null, null);
        expect(mockBagRepo.getBagListByEstId).toHaveBeenCalledWith(establishment); 

        expect(mockBagRepo.listAvailable).not.toHaveBeenCalled(); // Ensure listAvailable was NOT called
        expect(mockBagRepo.getBagById).not.toHaveBeenCalled(); // Ensure getBagById was NOT called
    });

    test("BagItem - POST /bags/:bagId/item - create a new bag item for bag having id :bagId", async () => {
        const validBagId = 1;
        //id, bagId, name, quantity, measurementUnit
        const validBagItemPayload = new BagItem(null, validBagId, 'Apple', 1, 'kg'); 

        const createdBagItem = { id: 1, ...validBagItemPayload };
        mockBagRepo.addItem.mockResolvedValue(createdBagItem); // Simulate successful creation

        const requestBody = {
            name: validBagItemPayload.name,
            quantity: validBagItemPayload.quantity,
            measurementUnit: validBagItemPayload.measurementUnit
        };

        const response = await request(await app)
            .post(`/bags/${validBagId}/item`)
            .send(validBagItemPayload);

        expect(response.status).toBe(HttpStatusCodes.CREATED);
        expect(response.body).toEqual(createdBagItem); // Check the response body -> the created bag item MUST HAVE THE ID


        expect(mockBagRepo.addItem).toHaveBeenCalledWith(validBagId, validBagItemPayload); // Check that the repository method was called with the correct parameters

    });


    describe('BagItem - POST /bags/:bagId/item - BAD REQUEST Errors', () => {

        const validBagId = 1;
        const validBagItemPayload = {
            id: 101,
            name: 'Apple',
            quantity: 1
        };


        test('invalid bagId in route parameter', async () => {
            const invalidBagId = 'not-a-bag-id';
            const bagItemPayload = { id: 1, name: 'Item', quantity: 1 };

            const response = await request(await app)
                .post(`/bags/${invalidBagId}/item`)
                .send(bagItemPayload);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error', 'Error: invalid bag id!');
            expect(mockBagRepo.addItem).not.toHaveBeenCalled(); // Repo method should not be called
        });

        test('invalid item name (empty string)', async () => {
            const invalidBagItemPayload = { ...validBagItemPayload, name: '' }; // Empty name

            const response = await request(await app)
                .post(`/bags/${validBagId}/item`)
                .send(invalidBagItemPayload);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error', 'Error: invalid item name!');
            expect(mockBagRepo.addItem).not.toHaveBeenCalled();
        });

         test('invalid item name (not a string)', async () => {
            const invalidBagItemPayload = { ...validBagItemPayload, name: 123 }; // Not a string

            const response = await request(await app)
                .post(`/bags/${validBagId}/item`)
                .send(invalidBagItemPayload);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error', 'Error: invalid item name!');
            expect(mockBagRepo.addItem).not.toHaveBeenCalled();
        });


        test('invalid item quantity (not a number)', async () => {
            const invalidBagItemPayload = { ...validBagItemPayload, quantity: 'three' }; // Not a number

            const response = await request(await app)
                .post(`/bags/${validBagId}/item`)
                .send(invalidBagItemPayload);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error', 'Error: invalid item quantity!');
            expect(mockBagRepo.addItem).not.toHaveBeenCalled();
        });

         test('invalid item quantity (zero or negative)', async () => {
            const invalidBagItemPayload = { ...validBagItemPayload, quantity: 0 }; // Zero quantity

            const response = await request(await app)
                .post(`/bags/${validBagId}/item`)
                .send(invalidBagItemPayload);

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error', 'Error: invalid item quantity!');
            expect(mockBagRepo.addItem).not.toHaveBeenCalled();

            const invalidBagItemPayload2 = { ...validBagItemPayload, quantity: -1 }; // Negative quantity
             const response2 = await request(await app)
                .post(`/bags/${validBagId}/item`)
                .send(invalidBagItemPayload2);

            expect(response2.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response2.body).toHaveProperty('error', 'Error: invalid item quantity!');
            expect(mockBagRepo.addItem).not.toHaveBeenCalled();
        });
    });

    test('BagItem - POST /bags/:bagId/item - INTERNAL SERVER ERROR', async () => {
        const validBagId = 1;
        const validBagItemPayload = {
            id: 101,
            name: 'Apple',
            quantity: 1
        };

        mockBagRepo.addItem.mockRejectedValue(new Error("Database error")); // Simulate error

        const response = await request(await app)
            .post(`/bags/${validBagId}/item`)
            .send(validBagItemPayload);

        expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe("Error: it's not possible to add the item to the bag!");
    });

    test('BagItem - DELETE /bags/item/:itemId - delete a bag item by id', async () => {
        const bagId = 1;
        const itemId = 101;

        mockBagRepo.removeItem.mockResolvedValue(null); // Simulate successful deletion

        const response = await request(await app)
            .delete(`/bags/item/${itemId}`);

        expect(response.status).toBe(HttpStatusCodes.OK);
        expect(response.body).toHaveProperty('success');
        expect(response.body.success).toBe("Bag item deleted successfully!");
    });



        test('BagItem - DELETE /bags/item/:itemId - BAD_REQUEST - invalid itemId format in route parameter', async () => {
            const invalidItemId = 'not-a-number';
    
            const response = await request(await app) // Assuming 'app' is the Express app instance from beforeEach
                .delete(`/bags/item/${invalidItemId}`); // Adjust path if your router is mounted differently (e.g., just `/item/${invalidItemId}`)
    
            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error', 'Error: invalid bag item id!'); // Adjust error message if different
            expect(mockBagRepo.removeItem).not.toHaveBeenCalled(); // Repo method should not be called
        });
    
        test('BagItem - DELETE /bags/item/:itemId - INTERNAL_SERVER_ERROR', async () => {
            const itemId = 123; // A valid item ID format
    
            // Mock removeItem to throw an error
            const repoError = new Error('Database error during item removal');
            mockBagRepo.removeItem.mockRejectedValue(repoError); // Use mockRejectedValue for async errors
    
            const response = await request(await app) // Assuming 'app' is the Express app instance
                .delete(`/bags/item/${itemId}`); // Adjust path if different
    
            expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
            expect(response.body).toHaveProperty('error', "Error: it's not possible to remove the bag item from the bag!"); // Adjust error message if different
            // Verify bagRepo.removeItem was called before it failed
            expect(mockBagRepo.removeItem).toHaveBeenCalledWith(itemId);
        });
    
    
    

    


describe('Carts Router', () => {

    test('POST /carts/:userId/bags - add a bag to the cart', async () => {
        const bagId = 1;
        const userId = 1;
        const estId = 1;

        //mock bagRepo.getBagById to return a valid bag
        //id, bagType, estId, size, tags, price, items, pickupTimeStart, pickupTimeEnd, available
        const bag = new Bag(bagId, 'regular', estId, 'small', 'tag1', 10.0, [], dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), true);
        mockBagRepo.getBagById.mockResolvedValue(bag);

        //mock cartRepo.addBag to return a valid cartItem
        //for now the users doesn't remove bagItems from the bag
        //id, bag, userId, removed = []
        const cartItem = new CartItem(1, bag, userId, []);
        mockCartRepo.addBag.mockResolvedValue(cartItem); // Simulate successful addition

        const response = await request(await app)
            .post(`/carts/${userId}/bags`)
            .send({ bagId: bagId });

        //since the objects are collapsed (i.e. we don't have bag: Bag {..} but just bag: {...}), we need to mock the response as well
        const cartItemCollapsed = {
            id: 1,
            bag: {
              id: 1,
              bagType: 'regular',
              estId: 1,
              size: 'small',
              tags: 'tag1',
              price: 10,
              items: [],
              pickupTimeStart: bag.pickupTimeStart, // Use the same date as the bag
              pickupTimeEnd: bag.pickupTimeEnd, // Use the same date as the bag
              available: true
            },
            userId: 1,
            removedItems: [],
            addedAt: expect.any(String) //since this varies every time
          };

        expect(response.status).toBe(HttpStatusCodes.CREATED);
        expect(response.body).toEqual(cartItemCollapsed); // Check the response body

        expect(response.body.addedAt).toBeDefined(); // Check that addedAt is defined
        expect(response.body.addedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/); // Check that addedAt is in ISO format and so it's a valid date


    });

    test('POST /carts/:userId/bags - FORBIDDEN: bag is not available', async () => {
        const userId = 1;
        const bagId = 1;

        // Mock the bagRepo.getBagById to return a bag that is not available
        const bag = new Bag(bagId, 'regular', 1, 'small', 'tag1', 10.0, [], dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), false);
        mockBagRepo.getBagById.mockResolvedValue(bag);

        const response = await request(await app)
            .post(`/carts/${userId}/bags`)
            .send({ bagId: bagId });

        expect(response.status).toBe(HttpStatusCodes.FORBIDDEN);
        expect(response.body).toHaveProperty('error', 'Error: bag is not available!'); 

    });

    test("POST /carts/:userId/:bagId - FORBIDDEN: user is trying to add a bag of the same estType of other bags in the cart at the same day", async () => {
        const userId = 1;
        const bagId = 1;
        const estId = 1;

        // Mock the bagRepo.getBagById to return a valid bag
        const bag = new Bag(bagId, 'regular', estId, 'small', 'tag1', 10.0, [], dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), true);
        mockBagRepo.getBagById.mockResolvedValue(bag);

        // Mock the cartRepo.addBag to throw an error if the user tries to add a bag of the same estType of other bags in the cart at the same day
        mockCartRepo.addBag.mockRejectedValue(new Error("You have already added a bag from this establishment today. Please try again tomorrow.")); // Simulate error

        const response = await request(await app)
            .post(`/carts/${userId}/bags`)
            .send({ bagId: bagId });

        expect(response.status).toBe(HttpStatusCodes.FORBIDDEN);
        expect(response.body).toHaveProperty('error', 'Error: You have already added a bag from this establishment today. Please try again tomorrow.'); 

    });


    test('POST /carts/:userId/bags - BAD REQUEST - invalid userId', async () => {
        const invalidUserId = 'invalid-id'; // it will turn out to be NaN
        const bagId = 1;
        const response = await request(await app)
            .post(`/carts/${invalidUserId}/bags`)
            .send({ bagId: bagId });
        
        expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty('error', 'Error: invalid userId!'); 
    });

    test('POST /carts/:userId/bags - BAD REQUEST - invalid bagId', async () => {
        const userId = 1;
        const invalidBagId = 'invalid-id'; // it will turn out to be NaN
        const response = await request(await app)
            .post(`/carts/${userId}/bags`)
            .send({ bagId: invalidBagId });

        expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty('error', 'Error: invalid bagId!'); 
    });


    test("POST /cart/:userId/bagss - NOT FOUND - bag not found", async () => {

        //Mock bagRepo.getBagById to return null (bag not found)
        mockBagRepo.getBagById.mockResolvedValue(null); //Simulate bag not found

        const userId = 1;
        const bagId = 999; //Assuming this bag does not exist!!

        const response = await request(await app)
            .post(`/carts/${userId}/bags`)
            .send({ bagId: bagId });

        expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
        expect(response.body).toHaveProperty('error', 'Error: bag not found!'); 

    });

    test("POST /carts/:userId/bags - INTERNAL SERVER ERROR", async () => {
        const userId = 1;
        const bagId = 1;

        //Mock bagRepo.getBagById to return a valid bag
        const bag = new Bag(bagId, 'regular', 1, 'small', 'tag1', 10.0, [], dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), true);
        mockBagRepo.getBagById.mockResolvedValue(bag);

        //Mock cartRepo.addBag to throw an error
        mockCartRepo.addBag.mockRejectedValue(new Error("Database error")); // Simulate error

        const response = await request(await app)
            .post(`/carts/${userId}/bags`)
            .send({ bagId: bagId });

        expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toHaveProperty('error', "Error: it's not possible to add the bag to the cart!"); 

    });


    test("DELETE /carts/:userId/bags - remove a bag from the cart", async () => {
        const userId = 1;
        const bagId = 1;

        //Mock cartRepo.removeBag to return null (success)
        mockCartRepo.removeBag.mockResolvedValue(null); // Simulate successful removal

        const response = await request(await app)
            .delete(`/carts/${userId}/bags/${bagId}`);

        expect(response.status).toBe(HttpStatusCodes.OK);
        expect(response.body).toHaveProperty('success', 'Bag removed successfully!'); 

    });

    test("DELETE /carts/:userId/bags - BAD REQUEST - invalid userId", async () => {
        const invalidUserId = 'invalid-id'; // it will turn out to be NaN
        const bagId = 1;
        const response = await request(await app)
            .delete(`/carts/${invalidUserId}/bags/${bagId}`);
        
        expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty('error', 'Error: userId is not a number!');
    });

    test("DELETE /carts/:userId/bags - BAD REQUEST - invalid bagId", async () => {
        const userId = 1;
        const invalidBagId = 'invalid-id'; // it will turn out to be NaN
        const response = await request(await app)
            .delete(`/carts/${userId}/bags/${invalidBagId}`);

        expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty('error', 'Error: bagId is not a number!'); 
    });

    test("DELETE /carts/:userId/bags - INTERNAL SERVER ERROR", async () => {
        const userId = 1;
        const bagId = 1;

        //Mock cartRepo.removeBag to throw an error
        mockCartRepo.removeBag.mockRejectedValue(new Error("Database error")); // Simulate error

        const response = await request(await app)
            .delete(`/carts/${userId}/bags/${bagId}`);

        expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toHaveProperty('error', "Error: cannot delete bag!"); 

    });


    test("POST /:userId/personalize/:bagId - personalize a bag", async () => {
        const userId = 1;
        const bagId = 1;
        const removedItems = [1, 2]; // Example removed items

        // Mock the bagRepo.getBagById to return a valid bag
        const bagItem1 = new BagItem(1, bagId, 'item1', 1, 'kg');
        const bagItem2 = new BagItem(2, bagId, 'item2', 2, 'kg');
        const bag = new Bag(bagId, 'regular', 1, 'small', 'tag1', 10.0, [bagItem1, bagItem2], dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), true);
        mockBagRepo.getBagById.mockResolvedValue(bag);

        // Mock the cartRepo.personalizeBag to return a success message
        mockCartRepo.personalizeBag.mockResolvedValue(null);

        const response = await request(await app)
            .post(`/carts/${userId}/personalize/${bagId}`)
            .send({ removedItems: removedItems });

        expect(response.status).toBe(HttpStatusCodes.OK);
        expect(response.body).toHaveProperty('success', 'Bag personalized successfully!'); 

    });

    test("POST /:userId/personalize/:bagId - BAD REQUEST - invalid userId", async () => {
        const invalidUserId = 'invalid-id'; // it will turn out to be NaN
        const bagId = 1;

        const removedItems = [1, 2]; // Example removed items

        const response = await request(await app)
            .post(`/carts/${invalidUserId}/personalize/${bagId}`)
            .send({ removedItems: removedItems });

        expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty('error', 'Error: userId is not a number!');
    });

    test("POST /:userId/personalize/:bagId - BAD REQUEST - invalid bagId", async () => {
        const userId = 1;
        const invalidBagId = 'invalid-id'; // it will turn out to be NaN

        const removedItems = [1, 2]; // Example removed items

        const response = await request(await app)
            .post(`/carts/${userId}/personalize/${invalidBagId}`)
            .send({ removedItems: removedItems });

        expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty('error', 'Error: bagId is not a number!'); 
    });

    describe("POST /:userId/personalize/:bagId - BAD REQUEST - invalid removedItems", () => {
        const userId = 1;
        const bagId = 1;

        test("removedItems is not an array", async () => {
            const removedItems = 'not-an-array'; // Not an array

            const response = await request(await app)
                .post(`/carts/${userId}/personalize/${bagId}`)
                .send({ removedItems: removedItems });

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error', 'Error: removedItems must be an array!'); 
        });

        test("removedItems is an empty array", async () => {
            const removedItems = []; // Empty array

            const response = await request(await app)
                .post(`/carts/${userId}/personalize/${bagId}`)
                .send({ removedItems: removedItems });

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error', 'Error: removedItems is an empty array! You must specify at least one item to remove.'); 
        });

        test("removedItems contains non-numeric values", async () => {
            const removedItems = [1, 'not-a-number', 3]; // Contains a non-numeric value

            const response = await request(await app)
                .post(`/carts/${userId}/personalize/${bagId}`)
                .send({ removedItems: removedItems });

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error', 'Error: all items in removedItems must be valid item IDs!'); 
        });


    });

    describe("POST /:userId/personalize/:bagId - Enforce Constraints", () => {

        test("A non-regular bag cannot be personalized", async () => {
            //cartRepo.personalizeBag should throw an error if the bag is not a regular bag
            //specifically: if (cartItem.bag.bagType !== Bag.TYPE_REGULAR) throw new Error('A non-regular bag cannot be personalized');
            //we have to mock this behavior
            //the simplest way is to say to the mock implementation to throw an error if the bag is not a regular bag
            mockCartRepo.personalizeBag.mockImplementation((userId, bagId, removedItems) => {
                //Simulate cartItem retrieval
                const cartItem = {
                    bag: {
                        bagType: 'surprise' // Simulate a non-regular bag type
                    }
                };

                //Simulate the condition of a non-regular bag -> it goes AGAINST the constraint!
                //this is the real piece of code in the repo!
                if (cartItem.bag.bagType !== Bag.TYPE_REGULAR) throw new Error('A non-regular bag cannot be personalized');

                return null; // Simulate success for regular bags -> IF THIS LINE IS REACHED, THERE'S A PROBLEM!
            });

            const userId = 1;
            const bagId = 1;
            const removedItems = [1, 2]; // Example removed items

            const bagItem1 = new BagItem(1, bagId, 'item1', 1, 'kg');
            const bagItem2 = new BagItem(2, bagId, 'item2', 2, 'kg');
            //SURPRISE BAG
            const bag = new Bag(bagId, 'surprise', 1, 'small', 'tag1', 10.0, [bagItem1, bagItem2], dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), true);

            mockBagRepo.getBagById.mockResolvedValue(bag); // Mock the bag to be a surprise bag

            const response = await request(await app)
                .post(`/carts/${userId}/personalize/${bagId}`)
                .send({ removedItems: removedItems });

            //IT HAS TO RETURN: FORBIDDEN (403)
            expect(response.status).toBe(HttpStatusCodes.FORBIDDEN);
            expect(response.body).toHaveProperty('error', 'Error: A non-regular bag cannot be personalized'); // Check the error message

        });


        test("Cannot remove more than 2 items from the bag!", async () => {
            //cartRepo.personalizeBag should throw an error if the user tries to remove more than 2 items
            //specifically: if (removedItems.length > 2) throw new Error('Cannot remove more than 2 items from the bag!');
            //we have to mock this behavior
            //the simplest way is to say to the mock implementation to throw an error if the user tries to remove more than 2 items
            mockCartRepo.personalizeBag.mockImplementation((userId, bagId, removedItems) => {
                //Simulate cartItem retrieval
                const cartItem = {
                    bag: {
                        bagType: 'regular' //Simulate a regular bag type
                    }
                };
                //Simulate the condition of removing more than 2 items -> it goes AGAINST the constraint!
                //this is the real piece of code in the repo!
                if (removedItems.length > 2) throw new Error('Cannot remove more than 2 items from the bag!');

                return null; // Simulate success for regular bags -> IF THIS LINE IS REACHED, THERE'S A PROBLEM!
            });
            
            const userId = 1;
            const bagId = 1;
            const removedItems = [1, 2, 3]; // Example removed items (more than 2)

            const response = await request(await app)
                .post(`/carts/${userId}/personalize/${bagId}`)
                .send({ removedItems: removedItems });

            //IT HAS TO RETURN: BAD REQUEST (400)
            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error', 'Error: Cannot remove more than 2 items from the bag!'); // Check the error message

        });


        test("Item with ID X is not in the bag", async () => {
            //cartRepo.personalizeBag should throw an error if the item is not in the bag
            //specifically: if (!cartItem.bag.items.some(item => item.id === removedItemId)) throw new Error(`Item with ID ${removedItemId} is not in the bag`);
            //we have to mock this behavior
            //the simplest way is to say to the mock implementation to throw an error if the item is not in the bag
            mockCartRepo.personalizeBag.mockImplementation((userId, bagId, removedItems) => {
                //Simulate cartItem retrieval
                const cartItem = {
                    bag: {
                        bagType: 'regular', //Simulate a regular bag type
                        items: [new BagItem(1, bagId, 'item1', 1, 'kg')] // Simulate items in the bag
                    }
                };


                //this is the real piece of code in the repo!
                for (const bagItemIdToRemove of removedItems) {
                    //check the cartItem actually contains the item to be removed
                    if (!cartItem.bag.items.some(bagItem => bagItem.id === bagItemIdToRemove)) {
                        throw new Error(`Item with ID ${bagItemIdToRemove} is not in the bag`);
                    }
                }

                return null; // Simulate success for regular bags -> IF THIS LINE IS REACHED, THERE'S A PROBLEM!
            });

            const userId = 1;
            const bagId = 1;
            const removedItems = [9999]; // Example removed items (not in the bag)

            const response = await request(await app)
                .post(`/carts/${userId}/personalize/${bagId}`)
                .send({ removedItems: removedItems });

            //IT HAS TO RETURN: NOT FOUND (404)
            expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
            expect(response.body).toHaveProperty('error', `Error: Item with ID ${removedItems[0]} is not in the bag`); // Check the error message

        });
        
        
    });






});


//Reservations Router
describe('Reservations Router', () => {

    test("POST /reservations/:userId - create a reservation", async () => {

        //we have to mock a cart having some items in it
        const userId = 1;

        //BAGITEM: id, bagId, name, quantity, measurementUnit
        const bagItem1 = new BagItem(1, 1, 'tomato', 1, 'kg');
        const bagItem2 = new BagItem(2, 1, 'water', 2, 'kg');
        //BAG: id, bagType, estId, size, tags, price, items, pickupTimeStart, pickupTimeEnd, available
        //SUPPONSE DIFFERENT EST IDs IN ORDER TO RESPECT THE CONSTRAINT
        const cartItem1 = new CartItem(1, new Bag(1, 'regular', 1, 'small', 'tag1', 10.0, [bagItem1], dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), true), userId, []);
        const cartItem2 = new CartItem(2, new Bag(2, 'surprise', 2, 'large', 'tag2', 20.0, [bagItem2], dayjs().toISOString(), dayjs().add(2, 'day').toISOString(), true), userId, []);


        const cart = new Cart(userId); // Create a cart with the items
        cart.addItem(cartItem1); 
        cart.addItem(cartItem2); 

        // Mock the cartRepo.getCartByUserId to return the cart
        mockCartRepo.getCartByUserId.mockResolvedValue(cart); // Simulate successful retrieval of the cart

        //all the bags are available at the time of reservation
        //we have to mock bagRepo.checkBagAvailable to return true for all bags
        mockBagRepo.checkBagAvailable.mockResolvedValue(true); // Simulate successful check for bag availability

        //suppose the use has not other reservations at the same time for the same estId
        //so we mock  await resRepo.checkEstablishmentContraint(userId, reservationTime, estId); to always return false
        mockReservationRepo.checkEstablishmentContraint.mockResolvedValue(false); // Simulate successful check for establishment constraint
    
        //lastly, we need to mock resRepo.createReservation(newReservation)
        //create a reservation object to return
        //1 RESERVATION FOR EACH CART ITEM

        const reservationId = 1;
        //id, userId, cartItem, createdAt, canceledAt = null
        const reservation1 = new Reservation(reservationId, userId, cartItem1, dayjs().toISOString()); //FOR CART ITEM 1

        const reservation2 = new Reservation(reservationId + 1, userId, cartItem2, dayjs().toISOString()); //FOR CART ITEM 2

        // Mock createReservation to return different values on subsequent calls
        mockReservationRepo.createReservation
        .mockResolvedValueOnce(reservation1) // First call returns reservation1
        .mockResolvedValueOnce(reservation2); // Second call returns reservation2

        const response = await request(app) 
        .post(`/reservations/${userId}`)
        .send();

        expect(response.status).toBe(HttpStatusCodes.CREATED); 
        expect(response.body).toEqual(toPlainObject(response.body)); 
        expect(response.body).toHaveLength(2); //Check that there are 2 reservations in the response
        expect(response.body[0].id).toBe(reservation1.id); //Check the first reservation ID
        expect(response.body[1].id).toBe(reservation2.id); //Check the second reservation ID


        expect(mockReservationRepo.createReservation).toHaveBeenCalledTimes(2);

    
    });


    describe("POST /reservations/:userId - Errors", () => {
        test("BAD REQUEST - invalid userId", async () => {
            const invalidUserId = 'invalid-id'; // it will turn out to be NaN
            const response = await request(await app)
                .post(`/reservations/${invalidUserId}`)
                .send(); // No body needed for this test

            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error', 'Error: userId is not a number!'); // Adjust error message if different
        });


        test("BAD REQUEST - user has no cart", async () => {  
            const userId = 1;

            // Mock the cartRepo.getCartByUserId to return null (no cart found)
            mockCartRepo.getCartByUserId.mockResolvedValue(null); // Simulate no cart found

            const response = await request(await app)
                .post(`/reservations/${userId}`)
                .send(); 

            
            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error', 'Error: User has no cart!'); // Adjust error message if different
        });

        test("BAD REQUEST - user's cart is empty", async () => {
            const userId = 1;

            // Mock the cartRepo.getCartByUserId to return an empty cart
            const emptyCart = new Cart(userId); // Create an empty cart
            mockCartRepo.getCartByUserId.mockResolvedValue(emptyCart); // Simulate successful retrieval of the empty cart

            const response = await request(await app)
                .post(`/reservations/${userId}`)
                .send(); 

            
            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error', 'Error: User\'s cart is empty!'); // Adjust error message if different
        });


        test("FORBIDDEN - bag already expired", async () => {
            const userId = 1;
            const bagItem1 = new BagItem(1, 1, 'tomato', 1, 'kg');
            const bagItem2 = new BagItem(2, 1, 'water', 2, 'kg');
            //BAG: id, bagType, estId, size, tags, price, items, pickupTimeStart, pickupTimeEnd, available
            //SUPPONSE DIFFERENT EST IDs IN ORDER TO RESPECT THE CONSTRAINT
            const cartItem1 = new CartItem(1, new Bag(1, 'regular', 1, 'small', 'tag1', 10.0, [bagItem1], dayjs().subtract(2, 'day').toISOString(), dayjs().subtract(1, 'day').toISOString(), true), userId, []);
            const cartItem2 = new CartItem(2, new Bag(2, 'surprise', 2, 'large', 'tag2', 20.0, [bagItem2], dayjs().subtract(3, 'day').toISOString(), dayjs().subtract(2, 'day').toISOString(), true), userId, []);


            const cart = new Cart(userId); // Create a cart with the items
            cart.addItem(cartItem1); 
            cart.addItem(cartItem2); 

            // Mock the cartRepo.getCartByUserId to return the cart
            mockCartRepo.getCartByUserId.mockResolvedValue(cart); // Simulate successful retrieval of the cart

            const response = await request(await app)
                .post(`/reservations/${userId}`)
                .send(); 

            
            expect(response.status).toBe(HttpStatusCodes.FORBIDDEN);
            expect(response.body).toHaveProperty('error', `Error: Cart Item (having ID ${cartItem1.bag.id}) already expired!`); // Adjust error message if different
        });


        test("BAD REQUEST - cart item is empty", async () => {
            const userId = 1;
            const bagItem1 = new BagItem(1, 1, 'tomato', 1, 'kg');
            const bagItem2 = new BagItem(2, 1, 'water', 2, 'kg');
            //BAG: id, bagType, estId, size, tags, price, items, pickupTimeStart, pickupTimeEnd, available
            //SUPPONSE DIFFERENT EST IDs IN ORDER TO RESPECT THE CONSTRAINT
            const cartItem1 = new CartItem(1, new Bag(1, 'regular', 1, 'small', 'tag1', 10.0, [], dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), true), userId, []);
            const cartItem2 = new CartItem(2, new Bag(2, 'surprise', 2, 'large', 'tag2', 20.0, [], dayjs().toISOString(), dayjs().add(2, 'day').toISOString(), true), userId, []);


            const cart = new Cart(userId); // Create a cart with the items
            cart.addItem(cartItem1); 
            cart.addItem(cartItem2); 

            // Mock the cartRepo.getCartByUserId to return the cart
            mockCartRepo.getCartByUserId.mockResolvedValue(cart); // Simulate successful retrieval of the cart

            const response = await request(await app)
                .post(`/reservations/${userId}`)
                .send(); 

            
            expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty('error', `Error: Cart Item (having ID ${cartItem1.bag.id}) is empty!`); // Adjust error message if different
        });


        test("FORBIDDEN - bag is not available anymore at the time of the reservation", async () => {
            const userId = 1;
            const bagItem1 = new BagItem(1, 1, 'tomato', 1, 'kg');
            const bagItem2 = new BagItem(2, 1, 'water', 2, 'kg');
            //BAG: id, bagType, estId, size, tags, price, items, pickupTimeStart, pickupTimeEnd, available
            //SUPPONSE DIFFERENT EST IDs IN ORDER TO RESPECT THE CONSTRAINT
            const cartItem1 = new CartItem(1, new Bag(1, 'regular', 1, 'small', 'tag1', 10.0, [bagItem1], dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), false), userId, []);
            const cartItem2 = new CartItem(2, new Bag(2, 'surprise', 2, 'large', 'tag2', 20.0, [bagItem2], dayjs().toISOString(), dayjs().add(2, 'day').toISOString(), true), userId, []);


            const cart = new Cart(userId); // Create a cart with the items
            cart.addItem(cartItem1); 
            cart.addItem(cartItem2); 

            // Mock the cartRepo.getCartByUserId to return the cart
            mockCartRepo.getCartByUserId.mockResolvedValue(cart); // Simulate successful retrieval of the cart

            //we have to mock resRepo.createReservation to throw an error if the bag is not available
            //throw new Error("Bag is not available anymore!");

            mockReservationRepo.createReservation.mockRejectedValue(new Error("Bag is not available anymore!")); // Simulate error


            const response = await request(await app)
                .post(`/reservations/${userId}`)
                .send(); 

            
            expect(response.status).toBe(HttpStatusCodes.FORBIDDEN);
            expect(response.body).toHaveProperty('error', `Error: Bag is not available anymore!`); // Adjust error message if different
        });

        test("FORBIDDEN - user has already a reservation for the same establishment at the same day", async () => {
            const userId = 1;
            const bagItem1 = new BagItem(1, 1, 'tomato', 1, 'kg');
            const bagItem2 = new BagItem(2, 1, 'water', 2, 'kg');
            //BAG: id, bagType, estId, size, tags, price, items, pickupTimeStart, pickupTimeEnd, available
            //SUPPONSE DIFFERENT EST IDs IN ORDER TO RESPECT THE CONSTRAINT
            const cartItem1 = new CartItem(1, new Bag(1, 'regular', 1, 'small', 'tag1', 10.0, [bagItem1], dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), true), userId, []);
            const cartItem2 = new CartItem(2, new Bag(2, 'surprise', 2, 'large', 'tag2', 20.0, [bagItem2], dayjs().toISOString(), dayjs().add(2, 'day').toISOString(), true), userId, []);


            const cart = new Cart(userId); // Create a cart with the items
            cart.addItem(cartItem1); 
            cart.addItem(cartItem2); 

            // Mock the cartRepo.getCartByUserId to return the cart
            mockCartRepo.getCartByUserId.mockResolvedValue(cart); // Simulate successful retrieval of the cart

            //we have to mock resRepo.checkEstablishmentContraint to return true (user has already a reservation for the same establishment at the same time)
            mockReservationRepo.checkEstablishmentContraint.mockResolvedValue(true); // Simulate error


            const response = await request(await app)
                .post(`/reservations/${userId}`)
                .send(); 

            
            expect(response.status).toBe(HttpStatusCodes.FORBIDDEN);
            expect(response.body).toHaveProperty('error', `Cart Item (having ID 1) already reserved by other user!`); // Adjust error message if different
        });

        test("INTERNAL SERVER ERROR", async () => {

             //we have to mock a cart having some items in it
            const userId = 1;

            //BAGITEM: id, bagId, name, quantity, measurementUnit
            const bagItem1 = new BagItem(1, 1, 'tomato', 1, 'kg');
            const bagItem2 = new BagItem(2, 1, 'water', 2, 'kg');
            //BAG: id, bagType, estId, size, tags, price, items, pickupTimeStart, pickupTimeEnd, available
            //SUPPONSE DIFFERENT EST IDs IN ORDER TO RESPECT THE CONSTRAINT
            const cartItem1 = new CartItem(1, new Bag(1, 'regular', 1, 'small', 'tag1', 10.0, [bagItem1], dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), true), userId, []);
            const cartItem2 = new CartItem(2, new Bag(2, 'surprise', 2, 'large', 'tag2', 20.0, [bagItem2], dayjs().toISOString(), dayjs().add(2, 'day').toISOString(), true), userId, []);


            const cart = new Cart(userId); // Create a cart with the items
            cart.addItem(cartItem1); 
            cart.addItem(cartItem2); 

            // Mock the cartRepo.getCartByUserId to return the cart
            mockCartRepo.getCartByUserId.mockResolvedValue(cart); // Simulate successful retrieval of the cart

            //all the bags are available at the time of reservation
            //we have to mock bagRepo.checkBagAvailable to return true for all bags
            mockBagRepo.checkBagAvailable.mockResolvedValue(true); // Simulate successful check for bag availability

            //suppose the use has not other reservations at the same time for the same estId
            //so we mock  await resRepo.checkEstablishmentContraint(userId, reservationTime, estId); to always return false
            mockReservationRepo.checkEstablishmentContraint.mockResolvedValue(false); // Simulate successful check for establishment constraint


            // Mock the reservationRepo.createReservation to throw an error
            mockReservationRepo.createReservation.mockRejectedValue(new Error("Database error")); // Simulate error

            const response = await request(await app)
                .post(`/reservations/${userId}`)
                .send(); 

            console.log(response.body); // Log the response body for debugging
            expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
            expect(response.body).toHaveProperty('error', "Error: it's not possible to create the reservation!"); // Adjust error message if different
        });
    });


    test("DELETE /reservations/:userId/:reservationId - delete a reservation", async () => {
        const userId = 1;
        const reservationId = 1;

        // Mock the reservationRepo.deleteReservation to return null (success)
        mockReservationRepo.cancelReservation.mockResolvedValue(null); // Simulate successful deletion

        const response = await request(await app)
            .delete(`/reservations/${reservationId}`);

        expect(response.status).toBe(HttpStatusCodes.OK);
        expect(response.body).toHaveProperty('success', 'Reservation deleted successfully!'); // Adjust success message if different
    });

    test("DELETE /reservations/:userId/:reservationId - INTERNAL SERVER ERROR", async () => {
        const reservationId = 1;

        // Mock the reservationRepo.deleteReservation to throw an error
        mockReservationRepo.cancelReservation.mockRejectedValue(new Error("Database error")); // Simulate error

        const response = await request(await app)
            .delete(`/reservations/${reservationId}`);

        expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toHaveProperty('error', "Error: cannot delete reservation!"); // Adjust error message if different
    });

        

    test("GET /reservations/:userId - get all reservations for a user", async () => {
        const userId = 1;

        // Mock the reservationRepo.getReservationsByUserId to return an array of reservations
        const reservation1 = new Reservation(1, userId, new CartItem(1, new Bag(1, 'regular', 1, 'small', 'tag1', 10.0, [], dayjs().toISOString(), dayjs().add(1, 'day').toISOString(), true), userId, []), dayjs().toISOString());
        const reservation2 = new Reservation(2, userId, new CartItem(2, new Bag(2, 'surprise', 2, 'large', 'tag2', 20.0, [], dayjs().toISOString(), dayjs().add(2, 'day').toISOString(), true), userId, []), dayjs().toISOString());

        mockReservationRepo.listReservationsByUser.mockResolvedValue([reservation1, reservation2]); // Simulate successful retrieval of reservations

        const response = await request(await app)
            .get(`/reservations/user/${userId}`);

        expect(response.status).toBe(HttpStatusCodes.OK);
        expect(response.body).toEqual(response.body.map(toPlainObject));
        expect(response.body).toHaveLength(2); 
        expect(response.body[0]).toHaveProperty('id', reservation1.id); // Check the first reservation
        expect(response.body[1]).toHaveProperty('id', reservation2.id); // Check the second reservation
        
    });

    test("GET /reservations/:userId - BAD REQUEST - invalid userId", async () => {
        const invalidUserId = 'invalid-id'; // it will turn out to be NaN
        const response = await request(await app)
            .get(`/reservations/user/${invalidUserId}`);

        expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty('error', 'Error: userId is not a number!'); // Adjust error message if different
    });

    test("GET /reservations/:userId - INTERNAL SERVER ERROR", async () => {
        const userId = 1;

        // Mock the reservationRepo.listReservationsByUser to throw an error
        mockReservationRepo.listReservationsByUser.mockRejectedValue(new Error("Database error")); // Simulate error

        const response = await request(await app)
            .get(`/reservations/user/${userId}`);

        expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toHaveProperty('error', "Error: cannot retrieve reservations!"); // Adjust error message if different
    });
       
});
