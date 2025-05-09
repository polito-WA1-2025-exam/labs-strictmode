import { describe, expect, test, beforeEach, beforeAll } from 'vitest';
import { createDb } from "../../database";
import { BagRepo, UserRepo, CartRepo, ReservationRepo, EstablishmentRepo, BagItemRepo, CartItemRepo } from "../repos/index.mjs";
import dayjs from 'dayjs';
import e from 'express';

async function createTestDbRepos() {
    let db = await createDb(":memory:");
    return {
        bagRepo: new BagRepo(db),
        userRepo: new UserRepo(db),
        cartRepo: new CartRepo(db),
        resRepo: new ReservationRepo(db),
        estRepo: new EstablishmentRepo(db),
        bagItRepo: new BagItemRepo(db),
        cartItRepo: new CartItemRepo(db),
    };
}

// User Repository Tests
describe('UserRepo', () => {
    test('should create and retrieve a user', async () => {
        const { userRepo } = await createTestDbRepos();
        const user = {
            name: 'Test User',
            assignedName: 'Test',
            familyName: 'User',
            email: 'test@example.com',
            password: 'password123'
        };

        const addedUser = await userRepo.createUser(user);
        expect(addedUser).toBeDefined();

        const retrievedUser = await userRepo.getUserById(addedUser.id);
        console.log(retrievedUser)
        expect(retrievedUser).toBeDefined();
        expect(retrievedUser.assignedName).toBe(user.assignedName);
        expect(retrievedUser.familyName).toBe(user.familyName);
        expect(retrievedUser.email).toBe(user.email);
    });


    test('should update an existing user', async () => {
        const { userRepo } = await createTestDbRepos();
        // Create initial user
        const user = {
            name: 'Test User',
            assignedName: 'Test',
            familyName: 'User',
            email: 'test@example.com',
            password: 'password123'
        };
        
        const addedUser = await userRepo.createUser(user);
        expect(addedUser).toBeDefined();
        
        // Update user information
        addedUser.email = 'updated@example.com';
        addedUser.assignedName = 'Updated';
        addedUser.familyName = 'Name';
        
        await userRepo.updateUser(addedUser);
        
        // Retrieve updated user
        const updatedUser = await userRepo.getUserById(addedUser.id);
        expect(updatedUser).toBeDefined();
        expect(updatedUser.email).toBe('updated@example.com');
        expect(updatedUser.assignedName).toBe('Updated');
        expect(updatedUser.familyName).toBe('Name');
    });

    
    test('should delete an existing user', async () => {
        const { userRepo } = await createTestDbRepos();
        // Create initial user
        const user = {
            name: 'Delete Test',
            assignedName: 'Delete',
            familyName: 'Test',
            email: 'delete@example.com',
            password: 'password123'
        };
        
        const addedUser = await userRepo.createUser(user);
        expect(addedUser).toBeDefined();
        
        // Delete the user
        await userRepo.deleteUser(addedUser.id);
        
        // Try to retrieve deleted user
        const deletedUser = await userRepo.getUserById(addedUser.id);
        expect(deletedUser).toBeNull();
    });
    
    test('should handle non-existent user retrieval', async () => {
        const { userRepo } = await createTestDbRepos();
        
        // Try to retrieve a user with an ID that doesn't exist
        const nonExistingUser = await userRepo.getUserById(99999);
        expect(nonExistingUser).toBeNull();
    });
    
    test('should handle duplicate email creation', async () => {
        const { userRepo } = await createTestDbRepos();
        
        const user1 = {
            name: 'First User',
            assignedName: 'First',
            familyName: 'User',
            email: 'duplicate@example.com',
            password: 'password123'
        };
        
        const user2 = {
            name: 'Second User',
            assignedName: 'Second',
            familyName: 'User',
            email: 'duplicate@example.com', // Same email as user1
            password: 'password456'
        };
        
        // Create first user
        const addedUser1 = await userRepo.createUser(user1);
        expect(addedUser1).toBeDefined();
        
        // Attempt to create second user with same email
        try {
            await userRepo.createUser(user2);
            // If we get here, the test should fail because an error should have been thrown
            expect(true).toBe(false); // Force test failure
        } catch (error) {
            // Expect an error due to duplicate email
            expect(error).toBeDefined();
        }
    });
});


//Establishment Repository Tests
describe('EstablishmentRepo', () => {

    let establishmentRepo;
    let bagsRepo;
    beforeEach(async () => {
        const {estRepo, bagRepo} = await createTestDbRepos();
        establishmentRepo = estRepo;
        bagsRepo = bagRepo;
    });

    test('should create a new establishment and retrieve it with bags', async () => {
        const newEstablishment = {
            name: 'Test Establishment',
            bags: [], // Initially no bags
            estType: 'Restaurant',
            address: '123 Test St'
        }
        const createdEstablishment = await establishmentRepo.createEstablishment(newEstablishment);

        expect(createdEstablishment.id).toBeDefined();
        expect(createdEstablishment.name).toBe('Test Establishment');
        expect(createdEstablishment.estType).toBe('Restaurant');
        expect(createdEstablishment.address).toBe('123 Test St');
        expect(createdEstablishment.bags).toEqual([]); // Initially no bags



        //Retrireve the establishment by ID
        const fetchedEstablishment = await establishmentRepo.getEstablishmentById(1);
        expect(fetchedEstablishment).toBeDefined();
        expect(fetchedEstablishment.name).toBe(newEstablishment.name);
        expect(fetchedEstablishment.estType).toBe(newEstablishment.estType);
        expect(fetchedEstablishment.address).toBe(newEstablishment.address);
        expect(fetchedEstablishment.bags).toEqual(newEstablishment.bags); // Initially no bags




        // Optionally, create a bag associated with this establishment and check retrieval
        
        
        const allFetchedEstablishments = await establishmentRepo.listAllEstablishments();
        console.log(allFetchedEstablishments)
        expect(allFetchedEstablishments).toBeDefined();
        expect(allFetchedEstablishments).toHaveLength(1);
        expect(allFetchedEstablishments[0].id).toBe(createdEstablishment.id);

        /**
         * @constructor
         * @param {number} id - Unique identifier for the bag.
         * @param {string} bagType - Type of the bag (e.g., "regular", "surprise").
         * @param {number} estId - The establishment ID associated with the bag.
         * @param {string} size - "small", "medium", "large".
         * @param {Array<string>} tags - Example: ["vegan", "gluten free"].
         * @param {number} price - The price of the bag.
         * @param {Array<Object>} items - Array of items in the bag.
         * @param {string} pickupTimeStart - The start time for pickup in ISO 8601 format.
         * @param {string} pickupTimeEnd - The end time for pickup in ISO 8601 format.
         * @param {boolean} available
         */
        const newBag = await bagsRepo.createBag({
            bagType: 'regular',
            estId: createdEstablishment.id,
            size: 'medium',
            tags: 'gluten free, lactose free',
            price: 10.99,
            items: null, //items will be properly tested in the bagRepo Test Suite
            pickupTimeStart: "2021-12-01",
            pickupTimeEnd: "2026-12-01",
            available: true
        });

        const bagItem1 = {
            name: 'Tomato',
            quantity: 2,
            measurementUnit: 'kg',
        };

        const bagItem2 = {
            name: 'Lettuce',
            quantity: 1,
            measurementUnit: 'kg',
        };

        const bagItem3 = {
            name: 'Carrot',
            quantity: 3,
            measurementUnit: 'kg',
        };

        newBag.items = [bagItem1, bagItem2, bagItem3];

        const fetchedEstablishmentWithBags = await establishmentRepo.getEstablishmentById(createdEstablishment.id);
        expect(fetchedEstablishmentWithBags).toBeDefined();
        expect(fetchedEstablishmentWithBags.name).toBe(newEstablishment.name);
        expect(fetchedEstablishmentWithBags.bags).toBeDefined();
        expect(fetchedEstablishmentWithBags.bags).toHaveLength(1);
        
        
        
    });


    test('should update an existing establishment', async () => {
        const newEstablishment = {
            name: 'Test Establishment',
            bags: [], // Initially no bags
            estType: 'Restaurant',
            address: '123 Test St'
        }
        const createdEstablishment = await establishmentRepo.createEstablishment(newEstablishment);

        expect(createdEstablishment.id).toBeDefined();
        expect(createdEstablishment.name).toBe(newEstablishment.name);
        expect(createdEstablishment.estType).toBe(newEstablishment.estType);
        expect(createdEstablishment.address).toBe(newEstablishment.address);
        expect(createdEstablishment.bags).toEqual(newEstablishment.bags); // Initially no bags

    
        const originalEstIndex = createdEstablishment.id;

        // Update the establishment
        createdEstablishment.name = 'Updated Establishment';
        createdEstablishment.estType = 'Cafe';
        createdEstablishment.address = '456 Updated St';

        await establishmentRepo.updateEstablishment(createdEstablishment);


        // Retrieve the updated establishment
        const updatedEstablishment = await establishmentRepo.getEstablishmentById(originalEstIndex);
        expect(updatedEstablishment).toBeDefined();
        expect(updatedEstablishment.id).toBe(originalEstIndex);
        expect(updatedEstablishment).toBeDefined();
        expect(updatedEstablishment.name).toBe('Updated Establishment');
        expect(updatedEstablishment.estType).toBe('Cafe');
        expect(updatedEstablishment.address).toBe('456 Updated St');


        //List all establishments
        const allFetchedEstablishments = await establishmentRepo.listAllEstablishments();
        expect(allFetchedEstablishments).toBeDefined();
        expect(allFetchedEstablishments).toHaveLength(1);
        expect(allFetchedEstablishments[0].id).toBe(originalEstIndex);
        expect(allFetchedEstablishments[0].name).toBe(updatedEstablishment.name);
        expect(allFetchedEstablishments[0].estType).toBe(updatedEstablishment.estType);
        expect(allFetchedEstablishments[0].address).toBe(updatedEstablishment.address);
        expect(allFetchedEstablishments[0].bags).toEqual(updatedEstablishment.bags); // Initially no bags



    });


    test('should delete an existing establishment', async () => {
        const newEstablishment = {
            name: 'Test Establishment',
            bags: [], // Initially no bags
            estType: 'Restaurant',
            address: '123 Test St'
        }
        const createdEstablishment = await establishmentRepo.createEstablishment(newEstablishment);

        expect(createdEstablishment.id).toBeDefined();
        expect(createdEstablishment.name).toBe(newEstablishment.name);
        expect(createdEstablishment.estType).toBe(newEstablishment.estType);
        expect(createdEstablishment.address).toBe(newEstablishment.address);
        expect(createdEstablishment.bags).toEqual(newEstablishment.bags); // Initially no bags


        // Delete the establishment
        await establishmentRepo.deleteEstablishment(createdEstablishment.id);

        //Try to retrieve the deleted establishment
        const deletedEstablishment = await establishmentRepo.getEstablishmentById(createdEstablishment.id);
        expect(deletedEstablishment).toBeNull();


        //List all establishments
        const allFetchedEstablishments = await establishmentRepo.listAllEstablishments();
        expect(allFetchedEstablishments).toBeDefined();
        expect(allFetchedEstablishments).toHaveLength(0); // No establishments should be present after deletion

    });


    test('should handle non-existent establishment retrieval', async () => {

        const nonExistingEstablishment = await establishmentRepo.getEstablishmentById(99999);
        expect(nonExistingEstablishment).toBeNull(); // Expect null for non-existent establishment


    });

    test('should handle duplicate establishment creation', async () => {
        const newEstablishment = {
            name: 'Test Establishment',
            bags: [], // Initially no bags
            estType: 'Restaurant',
            address: '123 Test St'
        }
        const createdEstablishment = await establishmentRepo.createEstablishment(newEstablishment);

        expect(createdEstablishment.id).toBeDefined();
        expect(createdEstablishment.name).toBe(newEstablishment.name);
        expect(createdEstablishment.estType).toBe(newEstablishment.estType);
        expect(createdEstablishment.address).toBe(newEstablishment.address);
        expect(createdEstablishment.bags).toEqual(newEstablishment.bags); // Initially no bags


        // Attempt to create a duplicate establishment
        try {
            await establishmentRepo.createEstablishment(newEstablishment);
            // If we get here, the test should fail because an error should have been thrown from the db
            expect(true).toBe(false); // Force test failure
        } catch (error) {
            // Expect an error form the db due to duplicate establishment
            expect(error).toBeDefined();
        }

    });


    test('should handle deleting non-existent establishment', async () => {

        // Attempt to delete an establishment that doesn't exist
        await establishmentRepo.deleteEstablishment(99999); // No error should be thrown

        // Try to retrieve the deleted establishment
        try {
            const deletedEstablishment = await establishmentRepo.getEstablishmentById(99999);
            expect(true).toBe(false); // Force test failure if no error is thrown
        } catch (error) {
            // Expect an error due to non-existent establishment
            expect(error).toBeDefined();
        }


    });

    test('should save the correct number of establishments', async () => {
        const newEstablishment = {
            name: 'Test Establishment',
            bags: [], // Initially no bags
            estType: 'Restaurant',
            address: '123 Test St'
        }
        const createdEstablishment = await establishmentRepo.createEstablishment(newEstablishment);

        expect(createdEstablishment.id).toBeDefined();
        expect(createdEstablishment.name).toBe(newEstablishment.name);
        expect(createdEstablishment.estType).toBe(newEstablishment.estType);
        expect(createdEstablishment.address).toBe(newEstablishment.address);
        expect(createdEstablishment.bags).toEqual(newEstablishment.bags); // Initially no bags


        //Add a second establishment
        const newEstablishment2 = {
            name: 'Test Establishment 2',
            bags: [], // Initially no bags
            estType: 'Fast Food',
            address: '789 Fast St'
        }

        const createdEstablishment2 = await establishmentRepo.createEstablishment(newEstablishment2);
        expect(createdEstablishment2.id).toBeDefined();
        expect(createdEstablishment2.name).toBe(newEstablishment2.name);
        expect(createdEstablishment2.estType).toBe(newEstablishment2.estType);
        expect(createdEstablishment2.address).toBe(newEstablishment2.address);
        expect(createdEstablishment2.bags).toEqual([]); // Initially no bags


        //List all establishments
        const allFetchedEstablishments = await establishmentRepo.listAllEstablishments();
        expect(allFetchedEstablishments).toBeDefined();
        expect(allFetchedEstablishments).toHaveLength(2);
        expect(allFetchedEstablishments[0].id).toBe(createdEstablishment.id);
        expect(allFetchedEstablishments[0].name).toBe(createdEstablishment.name);
        expect(allFetchedEstablishments[0].estType).toBe(createdEstablishment.estType);
        expect(allFetchedEstablishments[0].address).toBe(createdEstablishment.address);
        expect(allFetchedEstablishments[0].bags).toEqual(createdEstablishment.bags); // Initially no bags
        expect(allFetchedEstablishments[1].id).toBe(createdEstablishment2.id);
        expect(allFetchedEstablishments[1].name).toBe(createdEstablishment2.name);
        expect(allFetchedEstablishments[1].estType).toBe(createdEstablishment2.estType);
        expect(allFetchedEstablishments[1].address).toBe(createdEstablishment2.address);
        expect(allFetchedEstablishments[1].bags).toEqual(createdEstablishment2.bags); // Initially no bags


        //Now delete the first establishment
        await establishmentRepo.deleteEstablishment(createdEstablishment.id);

        //List all establishments again
        const allFetchedEstablishmentsAfterDelete = await establishmentRepo.listAllEstablishments();
        expect(allFetchedEstablishmentsAfterDelete).toBeDefined();
        expect(allFetchedEstablishmentsAfterDelete).toHaveLength(1); // Only one establishment should remain
    });
});


//Bag Repository Tests
describe('BagRepo', () => {

    let establishmentRepo;
    let bagsRepo;

    //since the db has the foreign key contraints that the estId referenced by the bags must exist, we create a mockup establishment
    let newEstablishment = {
        name: 'Test Establishment',
        bags: [], // Initially no bags
        estType: 'Restaurant',
        address: '123 Test St'
    }
    let createdEstablishment;

    let newBag = {
        bagType: 'regular',
        estId: null, //this will be set to the createdEstablishment.id in the beforeEach
        size: 'medium',
        tags: 'gluten free, lactose free',
        price: 10.99,
        items: null, //items will be properly tested in the bagRepo Test Suite
        pickupTimeStart: "2021-06-01", 
        pickupTimeEnd: "2026-12-01",
        available: true
    } 

    beforeEach(async () => {
        const {estRepo, bagRepo} = await createTestDbRepos();
        establishmentRepo = estRepo;
        bagsRepo = bagRepo;

        //create the establishment for the tests
        createdEstablishment = await establishmentRepo.createEstablishment(newEstablishment);
        expect(createdEstablishment).toBeDefined();
        expect(createdEstablishment.id).toBeDefined();

        //set the estId of the newBag to the createdEstablishment.id
        newBag.estId = createdEstablishment.id;

    });


    test('should create a new bag and retrieve it', async () => {

        //in this first test, bag.items is null, so we will not test it here

        const createdBag = await bagsRepo.createBag(newBag);


        expect(createdBag.id).toBeDefined();
        expect(createdBag.bagType).toBe(newBag.bagType);
        expect(createdBag.estId).toBe(newBag.estId);
        expect(createdBag.size).toBe(newBag.size);
        expect(createdBag.tags).toEqual(newBag.tags);
        expect(createdBag.price).toBe(newBag.price);
        //since bag objects have dayjd dates, we need to check if the date is the same so we first need to format it to a string
        expect(createdBag.pickupTimeStart.format('YYYY-MM-DD')).toBe("2021-06-01");
        expect(createdBag.pickupTimeEnd.format('YYYY-MM-DD')).toBe("2026-12-01");
        expect(createdBag.available).toBe(true);

        expect(createdBag.items).toBeNull(); // Items should be null initially since here we didn't add any items
        


    });


    test('should add bagItems and correctly associate them with the bag', async () => {



        //add three bag items to the bag
        /**
         * @param {number} bagId
         * @param {number} id - Unique id for the item. Unique within the bag.
         * @param {string} name
         * @param {number} quantity - Must always be greater than 0.
         * @param {string} measurementUnit - Unit of measurement for the quantity (e.g., "kg", "g", "units").
         **/

        const bagItem1 = {
            name: 'Tomato',
            quantity: 2,
            measurementUnit: 'kg',
        };

        const bagItem2 = {
            name: 'Lettuce',
            quantity: 1,
            measurementUnit: 'kg',
        };


        const bagItem3 = {
            name: 'Carrot',
            quantity: 3,
            measurementUnit: 'kg',
        };


        newBag.items = [bagItem1, bagItem2, bagItem3];


        const createdBag = await bagsRepo.createBag(newBag);

        expect(createdBag.id).toBeDefined();
        expect(createdBag.bagType).toBe(newBag.bagType);
        expect(createdBag.estId).toBe(newBag.estId);
        expect(createdBag.size).toBe(newBag.size);
        expect(createdBag.tags).toEqual(newBag.tags);
        expect(createdBag.price).toBe(newBag.price);
        //since bag objects have dayjd dates, we need to check if the date is the same so we first need to format it to a string
        expect(createdBag.pickupTimeStart.format('YYYY-MM-DD')).toBe("2021-06-01");
        expect(createdBag.pickupTimeEnd.format('YYYY-MM-DD')).toBe("2026-12-01");
        expect(createdBag.available).toBe(true);

        //bagItems check 
        //check items length
        expect(createdBag.items).toBeDefined();
        expect(createdBag.items).toHaveLength(3); // Three items added

        //check the items are correct
        expect(createdBag.items[0].name).toBe(bagItem1.name);
        expect(createdBag.items[0].quantity).toBe(bagItem1.quantity);
        expect(createdBag.items[0].measurementUnit).toBe(bagItem1.measurementUnit);
        expect(createdBag.items[1].name).toBe(bagItem2.name);
        expect(createdBag.items[1].quantity).toBe(bagItem2.quantity);
        expect(createdBag.items[1].measurementUnit).toBe(bagItem2.measurementUnit);
        expect(createdBag.items[2].name).toBe(bagItem3.name);
        expect(createdBag.items[2].quantity).toBe(bagItem3.quantity);
        expect(createdBag.items[2].measurementUnit).toBe(bagItem3.measurementUnit);


    });

    test("should completely reconstruct the bag from the db (along with all its bagItems)", async () => {
        //VERY IMPORTANT TEST!!!


        //add three bag items to the bag
        /**
         * @param {number} bagId
         * @param {number} id - Unique id for the item. Unique within the bag.
         * @param {string} name
         * @param {number} quantity - Must always be greater than 0.
         * @param {string} measurementUnit - Unit of measurement for the quantity (e.g., "kg", "g", "units").
         **/

        const bagItem1 = {
            name: 'Tomato',
            quantity: 2,
            measurementUnit: 'kg',
        };

        const bagItem2 = {
            name: 'Orange',
            quantity: 1,
            measurementUnit: 'kg',
        };


        const bagItem3 = {
            name: 'Carrot',
            quantity: 3,
            measurementUnit: 'kg',
        };


        newBag.items = [bagItem1, bagItem2, bagItem3];


        const createdBag = await bagsRepo.createBag(newBag);

        //GET BAG BY ID using the getBagById method of the bagRepo to build the bag completely from what's retrieved from the db
        //this function is VERY important to be tested
        const fetchedBag = await bagsRepo.getBagById(createdBag.id);
        expect(fetchedBag).toBeDefined();
        expect(fetchedBag.id).toBe(createdBag.id);
        expect(fetchedBag.bagType).toBe(newBag.bagType);
        expect(fetchedBag.estId).toBe(newBag.estId);
        expect(fetchedBag.size).toBe(newBag.size);
        expect(fetchedBag.tags).toEqual(newBag.tags);
        expect(fetchedBag.price).toBe(newBag.price);
        //since bag objects have dayjd dates, we need to check if the date is the same so we first need to format it to a string
        expect(fetchedBag.pickupTimeStart.format('YYYY-MM-DD')).toBe("2021-06-01");
        expect(fetchedBag.pickupTimeEnd.format('YYYY-MM-DD')).toBe("2026-12-01");

        expect(fetchedBag.available).toBe(true);

        //bagItems check
        //check items length
        expect(fetchedBag.items).toBeDefined();
        expect(fetchedBag.items).toHaveLength(3); // Three items added

        //check the items are correct
        expect(fetchedBag.items[0].name).toBe(bagItem1.name);
        expect(fetchedBag.items[0].quantity).toBe(bagItem1.quantity);
        expect(fetchedBag.items[0].measurementUnit).toBe(bagItem1.measurementUnit);
        expect(fetchedBag.items[1].name).toBe(bagItem2.name);
        expect(fetchedBag.items[1].quantity).toBe(bagItem2.quantity);
        expect(fetchedBag.items[1].measurementUnit).toBe(bagItem2.measurementUnit);
        expect(fetchedBag.items[2].name).toBe(bagItem3.name);
        expect(fetchedBag.items[2].quantity).toBe(bagItem3.quantity);
        expect(fetchedBag.items[2].measurementUnit).toBe(bagItem3.measurementUnit);
    });


    test("should change bag availability and correctly retrieve it (with both methods)", async () => {



        //create a new bag
        const createdBag = await bagsRepo.createBag(newBag);


        //set the bag to unavailable
        bagsRepo.setAvailable(createdBag.id, false);

        //retrieve the bag and check if it is unavailable
        const fetchedBag = await bagsRepo.getBagById(createdBag.id);

        expect(fetchedBag).toBeDefined();
        expect(fetchedBag.id).toBe(createdBag.id);
        //AVAILABILITY CHECK
        expect(fetchedBag.available).toBeDefined();
        expect(fetchedBag.available).toBe(false); // Bag should be unavailable now


        //use the new method: checkBagAvailable(bagId)
        const availability = await bagsRepo.checkBagAvailable(createdBag.id);
        expect(availability).toBeDefined(); //it should not be null since the bag is defined
        expect(availability).toBe(false); // Bag should be unavailable now
    });

    test("should check bag availability correctly", async () => {
        //create a new bag
        const createdBag = await bagsRepo.createBag(newBag);
        expect(createdBag).toBeDefined();
        expect(createdBag.id).toBeDefined();

        //retrieve availability of the bag
        const availability = await bagsRepo.checkBagAvailable(createdBag.id);
        //it should be available since we just created it and didn't set it to unavailable
        expect(availability).toBeDefined(); //it should not be null since the bag is defined
        expect(availability).toBe(true); // Bag should be available now

        //now crete an unavailable bag
        let newBag2 = {
            bagType: 'regular',
            estId: null, //this will be set to the createdEstablishment.id in the beforeEach
            size: 'medium',
            tags: 'gluten free, lactose free',
            price: 10.99,
            items: null, //items will be properly tested in the bagRepo Test Suite
            pickupTimeStart: "2021-06-01", 
            pickupTimeEnd: "2026-12-01",
            available: false // Set to unavailable
        } 

        //create the bag
        const createdBag2 = await bagsRepo.createBag(newBag2);
        expect(createdBag2).toBeDefined();
        expect(createdBag2.id).toBeDefined();

        //retrieve availability of the bag
        const availability2 = await bagsRepo.checkBagAvailable(createdBag2.id);
        expect(availability2).toBeDefined(); //it should not be null since the bag is defined
        expect(availability2).toBe(false); // Bag should be unavailable now
    });

    test("should handle bags updates correctly", async () => {
    
        const newBag = {
            bagType: 'big',
            estId: createdEstablishment.id,
            size: 'medium',
            tags: 'gluten free, lactose free',
            price: 10.99,
            items: null, //items will be properly tested in the bagRepo Test Suite
            pickupTimeStart: "2021-06-01", 
            pickupTimeEnd: "2026-12-01",
            available: true
        }


        //create a new bag
        const createdBag = await bagsRepo.createBag(newBag);

        //1. here we everything apart from establishment id since we have a foreign key constraint
        //for now also items are set to null
        //modify bag fields
        const updatedBag = {
            id: createdBag.id,
            bagType: 'small',
            estId: createdEstablishment.id,
            size: 'large',
            tags: 'vegan, gluten free',
            price: 20.99,
            items: null, //items will be properly tested in the bagRepo Test Suite
            pickupTimeStart: "2025-06-01", 
            pickupTimeEnd: "2027-12-01",
            available: false
        }

        //update the bag
        await bagsRepo.updateBag(updatedBag);

        //retrieve the bag and check if it is updated
        const updatedBagRes = await bagsRepo.getBagById(updatedBag.id);

        //compare
        expect(updatedBagRes).toBeDefined();
        expect(updatedBagRes.id).toBe(updatedBag.id);
        expect(updatedBagRes.bagType).toBe(updatedBag.bagType);
        expect(updatedBagRes.estId).toBe(updatedBag.estId);
        expect(updatedBagRes.size).toBe(updatedBag.size);
        expect(updatedBagRes.tags).toEqual(updatedBag.tags);
        expect(updatedBagRes.price).toBe(updatedBag.price);
        expect(updatedBagRes.pickupTimeStart.format('YYYY-MM-DD')).toBe(updatedBag.pickupTimeStart);
        expect(updatedBagRes.pickupTimeEnd.format('YYYY-MM-DD')).toBe(updatedBag.pickupTimeEnd);
        expect(updatedBagRes.available).toBe(updatedBag.available);
        expect(updatedBagRes.items).toBeNull(); // Items should be null initially since here we didn't add any items
    });


});

//BagItem Repository Tests
describe('BagItemRepo', () => {
    let establishmentRepo;
    let bagsRepo;
    let bagItemsRepo;

    //since the db has the foreign key contraints that the estId referenced by the bags must exist, we create a mockup establishment
    //alredy create also the bag
    let newEstablishment = {
        name: 'Test Establishment',
        bags: [], // Initially no bags
        estType: 'Restaurant',
        address: '123 Test St'
    }
    const newBag = {
        bagType: 'big',
        estId: 1, //set manually 1 since in this test suite we just have the new establishment created
        size: 'medium',
        tags: 'gluten free, lactose free',
        price: 10.99,
        items: null, //items will be properly tested in the bagRepo Test Suite
        pickupTimeStart: "2021-06-01", 
        pickupTimeEnd: "2026-12-01",
        available: true
    }
    let createdEstablishment;
    let createdBag;

    beforeEach(async () => {
        const {estRepo, bagRepo, bagItRepo} = await createTestDbRepos();
        establishmentRepo = estRepo;
        bagsRepo = bagRepo;
        bagItemsRepo = bagItRepo;

        //create the establishment for the tests
        createdEstablishment = await establishmentRepo.createEstablishment(newEstablishment);
        expect(createdEstablishment).toBeDefined();
        expect(createdEstablishment.id).toBeDefined();


        //create the bag
        createdBag = await bagsRepo.createBag(newBag);
        expect(createdBag).toBeDefined();
        expect(createdBag.id).toBeDefined();
        expect(createdBag.estId).toBe(createdEstablishment.id);
    });



    test("should add bagItems to an already existing bag", async () => {

        //add bagItems to the already existing bag
        const bagItem1 = {
            name: 'Ketchup',
            quantity: 1,
            measurementUnit: 'spoons',
            bagId: createdBag.id // Associate with the created bag
        };

        const createdBagItem = await bagItemsRepo.createBagItem(bagItem1);
        expect(createdBagItem).toBeDefined();
        expect(createdBagItem.id).toBeDefined();
        expect(createdBagItem.bagId).toBe(createdBag.id); // Check if the bagItem is associated with the correct bag
       
    });

    test("should retrieve bagItems by bagId", async () => {
        //add bagItems to the already existing bag
        const bagItem1 = {
            name: 'Ketchup',
            quantity: 1,
            measurementUnit: 'spoons',
            bagId: createdBag.id // Associate with the created bag
        };

        const createdBagItem = await bagItemsRepo.createBagItem(bagItem1);
        expect(createdBagItem).toBeDefined();
        expect(createdBagItem.id).toBeDefined();

        //retrieve the bagItems by bagId
        const bagItemRetrieved = await bagItemsRepo.getBagItemById(createdBag.id);
        //check if it's bagItem1
        expect(bagItemRetrieved).toBeDefined();
        expect(bagItemRetrieved.id).toBe(createdBagItem.id);
        expect(bagItemRetrieved.bagId).toBe(createdBagItem.bagId); 
        expect(bagItemRetrieved.name).toBe(createdBagItem.name);
        expect(bagItemRetrieved.quantity).toBe(createdBagItem.quantity);
        expect(bagItemRetrieved.measurementUnit).toBe(createdBagItem.measurementUnit);
    });

    test("should update an existing bagItem", async () => {
        //add bagItems to the already existing bag
        const bagItem1 = {
            name: 'Ketchup',
            quantity: 1,
            measurementUnit: 'spoons',
            bagId: createdBag.id // Associate with the created bag
        };

        const createdBagItem = await bagItemsRepo.createBagItem(bagItem1);
        expect(createdBagItem).toBeDefined();
        expect(createdBagItem.id).toBeDefined();



        //update bag Item
        const updatedBagItem = {
            id: createdBagItem.id,
            bagId: createdBag.id, // Keep the same bagId
            name: 'Mustard',
            quantity: 2,
            measurementUnit: 'ounces'
        };

        await bagItemsRepo.updateItem(updatedBagItem);

        //retrieve the updated bagItem
        const updatedBagItemRetrieved = await bagItemsRepo.getBagItemById(createdBag.id);
        //check if the updates are correct
        expect(updatedBagItemRetrieved).toBeDefined();
        expect(updatedBagItemRetrieved.id).toBe(updatedBagItem.id);
        expect(updatedBagItemRetrieved.bagId).toBe(updatedBagItem.bagId);
        expect(updatedBagItemRetrieved.name).toBe(updatedBagItem.name);
        expect(updatedBagItemRetrieved.quantity).toBe(updatedBagItem.quantity);
        expect(updatedBagItemRetrieved.measurementUnit).toBe(updatedBagItem.measurementUnit);


    });


    test("shuld delete an existing bagItem", async () => {
        //add bagItems to the already existing bag
        const bagItem1 = {
            name: 'Ketchup',
            quantity: 1,
            measurementUnit: 'spoons',
            bagId: createdBag.id // Associate with the created bag
        };

        const createdBagItem = await bagItemsRepo.createBagItem(bagItem1);
        expect(createdBagItem).toBeDefined();
        expect(createdBagItem.id).toBeDefined();


        //delete the bagItem
        await bagItemsRepo.deleteBagItem(createdBagItem.id);

        //try to retrieve the deleted bagItem
        const deletedBagItem = await bagItemsRepo.getBagItemById(createdBag.id);
        expect(deletedBagItem).toBeNull(); // Expect null for non-existent establishment

    });

    test("should handle non-existent bagItem retrieval", async () => {
        // Try to retrieve a bagItem with an ID that doesn't exist
        const nonExistingBagItem = await bagItemsRepo.getBagItemById(99999);
        expect(nonExistingBagItem).toBeNull(); // Expect null for non-existent establishment
    });

    test("should retrieve bagItems assigned to a specific bag", async () => {

        //getBagItemListByBagItemId
        const bagItem1 = {
            name: 'Ketchup',
            quantity: 1,
            measurementUnit: 'spoons',
            bagId: createdBag.id // Associate with the created bag
        };

        const bagItem2 = {
            name: 'Mustard',
            quantity: 2,
            measurementUnit: 'ounces',
            bagId: createdBag.id // Associate with the created bag
        };

        const createdBagItem = await bagItemsRepo.createBagItem(bagItem1);
        expect(createdBagItem).toBeDefined();
        expect(createdBagItem.id).toBeDefined();

        const createdBagItem2 = await bagItemsRepo.createBagItem(bagItem2);
        expect(createdBagItem2).toBeDefined();
        expect(createdBagItem2.id).toBeDefined();


        //retrieve the bagItems by bagId
        const bagItemsRetrieved = await bagItemsRepo.getBagItemListByBagId(createdBag.id);
        //check if it's bagItem1 and bagItem2
        expect(bagItemsRetrieved).toBeDefined();
        expect(bagItemsRetrieved).toHaveLength(2); // Two items added
        expect(bagItemsRetrieved[0].id).toBe(createdBagItem.id);
        expect(bagItemsRetrieved[0].bagId).toBe(createdBagItem.bagId);
        expect(bagItemsRetrieved[0].name).toBe(createdBagItem.name);
        expect(bagItemsRetrieved[0].quantity).toBe(createdBagItem.quantity);
        expect(bagItemsRetrieved[0].measurementUnit).toBe(createdBagItem.measurementUnit);
        expect(bagItemsRetrieved[1].id).toBe(createdBagItem2.id);
        expect(bagItemsRetrieved[1].bagId).toBe(createdBagItem2.bagId);
        expect(bagItemsRetrieved[1].name).toBe(createdBagItem2.name);
        expect(bagItemsRetrieved[1].quantity).toBe(createdBagItem2.quantity);
        expect(bagItemsRetrieved[1].measurementUnit).toBe(createdBagItem2.measurementUnit);

    });


});


//Cart Repo Testing
describe('CartRepo', () => {
    let establishmentRepo;
    let bagsRepo;
    let bagItemsRepo;
    let usRepo;
    let crtRepo;


   

    //since the db has the foreign key contraints that the estId referenced by the bags must exist, we create a mockup establishment
    //alredy create also the bag
    let newEstablishment = {
        name: 'Test Establishment',
        bags: [], // Initially no bags
        estType: 'Restaurant',
        address: '123 Test St'
    }
    const newBag = {
        bagType: 'regular',
        estId: 1, //set manually 1 since in this test suite we just have the new establishment created
        size: 'medium',
        tags: 'gluten free, lactose free',
        price: 10.99,
        items: null, //items will be properly tested in the bagRepo Test Suite
        pickupTimeStart: "2021-06-01", 
        pickupTimeEnd: "2026-12-01",
        available: true
    }
    const bagItem1 = {
        name: 'Tomato',
        quantity: 2,
        measurementUnit: 'kg',
    };
    const bagItem2 = {
        name: 'Lettuce',
        quantity: 1,
        measurementUnit: 'kg',
    };
    const bagItem3 = {
        name: 'Carrot',
        quantity: 3,
        measurementUnit: 'kg',
    };


    newBag.items = [bagItem1, bagItem2, bagItem3];

    const user = {
        name: 'Test User',
        assignedName: 'Test',
        familyName: 'User',
        email: 'test@example.com',
        password: 'password123'
    };


    let createdEstablishment;
    let createdBag;
    let createdUser;

    beforeEach(async () => {
        const {userRepo, cartRepo, estRepo, bagRepo, bagItRepo} = await createTestDbRepos();
        establishmentRepo = estRepo;
        bagsRepo = bagRepo;
        bagItemsRepo = bagItRepo;
        usRepo = userRepo;
        crtRepo = cartRepo;

        //create the establishment for the tests
        createdEstablishment = await establishmentRepo.createEstablishment(newEstablishment);
        expect(createdEstablishment).toBeDefined();
        expect(createdEstablishment.id).toBeDefined();


        //create the bag
        createdBag = await bagsRepo.createBag(newBag);
        expect(createdBag).toBeDefined();
        expect(createdBag.id).toBeDefined();
        expect(createdBag.estId).toBe(createdEstablishment.id);
        expect(createdBag.items).toBeDefined();
        expect(createdBag.items).toHaveLength(3); // Three items added
        console.log("CIUPPA ITEMSSSSS: ", createdBag.items);

        //create the user
        createdUser = await usRepo.createUser(user);
        expect(createdUser).toBeDefined();
        expect(createdUser.id).toBeDefined();
    });

    test("should add a bag as cartItem and retrieve cart having the added cartItem", async () => {
        //add createdBag to the createdUser cart

        const cartItem = await crtRepo.addBag(createdUser.id, createdBag);
        expect(cartItem).toBeDefined();
        expect(cartItem.id).toBeDefined();
        //check correctness of cartItem
        expect(cartItem.bag.id).toBe(createdBag.id); 
        expect(cartItem.userId).toBe(createdUser.id); 

        //check if the user's cart has got the cartItem
        const cart = await crtRepo.getCartByUserId(createdUser.id);


        expect(cart).toBeDefined();

        //check if cart is correctly associated with the user
        expect(cart.userId).toBeDefined();
        expect(cart.userId).toBe(createdUser.id);

        //check if the cartItem is in the cart
        expect(cart.items).toBeDefined();
        expect(cart.items).toHaveLength(1); // One item added to the cart

        //check if the cartItem is correct
        expect(cart.items[0].id).toBeDefined();
        expect(cart.items[0].id).toBe(cartItem.id); 
        expect(cart.items[0].bag.id).toBe(cartItem.bag.id); 
        expect(cart.items[0].userId).toBe(cartItem.userId); 



    });

    test("should handle multiple cartItems into one cart", async () => {

        //create a second bag
        //SINCE WE HAVE THE CONSTRAINT THAT THE USER CANNOT ADD > 1 BAG FROM THE SAME ESTABLISHMENT, we create a second bag from ANOTHER ESTABLISHMENT
        //also mind that the key contraint on estId must is enforced by the db, so we create a new establishment first

        const newEst2 = {
            name: 'Test Establishment2',
            bags: [], // Initially no bags
            estType: 'Slow Food',
            address: '127 Ace Ave'
        }

        const createdEstablishment2 = await establishmentRepo.createEstablishment(newEst2);
        expect(createdEstablishment2).toBeDefined();
        expect(createdEstablishment2.id).toBeDefined();
        expect(createdEstablishment2.id).toBeGreaterThan(createdEstablishment.id); // Check if the new establishment has a different ID
        expect(createdEstablishment2.id).toBe(2);

        const newBag2 = {
            bagType: 'regular',
            estId: createdEstablishment2.id,
            size: 'large',
            tags: 'high protein, low carb',
            price: 10.99,
            items: null, //items will be properly tested in the bagRepo Test Suite
            pickupTimeStart: "2021-06-01", 
            pickupTimeEnd: "2026-12-01",
            available: true
        }
        const bagItem4 = {
            name: 'Potato',
            quantity: 2,
            measurementUnit: 'kg',
        };

        newBag2.items = [bagItem4];

        //add the second bag
        const createdBag2 = await bagsRepo.createBag(newBag2);
        expect(createdBag2).toBeDefined();
        expect(createdBag2.id).toBeDefined();
        expect(createdBag2.estId).toBe(createdEstablishment2.id);
        expect(createdBag2.items).toBeDefined();
        expect(createdBag2.items).toHaveLength(1); // just 1 item added


        //add createdBag to the cart of user createdUser
        const cartItem = await crtRepo.addBag(createdUser.id, createdBag);


        console.log("LA QUIETE DOPO LA TEMPESTA: ", cartItem);
        //add createdBag2 to the cart of user createdUser
        //EXPECT ERROR
        const cartItem2 = await crtRepo.addBag(createdUser.id, createdBag2);

        //retrieve the cart of user createdUser
        const cart = await crtRepo.getCartByUserId(createdUser.id);
        expect(cart).toBeDefined();
        expect(cart.userId).toBeDefined();
        expect(cart.userId).toBe(createdUser.id);
        expect(cart.items).toBeDefined();
        //count the number of items in the cart
        expect(cart.items).toHaveLength(2); // Two items added to the cart

        //check if the first cartItem is correct
        expect(cart.items[0].id).toBeDefined();
        expect(cart.items[0].id).toBe(cartItem.id);
        expect(cart.items[0].bag.id).toBe(cartItem.bag.id);
        expect(cart.items[0].userId).toBe(cartItem.userId);

        //check if the second cartItem is correct
        expect(cart.items[1].id).toBeDefined();
        expect(cart.items[1].id).toBe(cartItem2.id);
        expect(cart.items[1].bag.id).toBe(cartItem2.bag.id);
        expect(cart.items[1].userId).toBe(cartItem2.userId);

    });

    test("should be able to add bags of different establishments on the same day", async () => {

        const newEst2 = {
            name: 'Test Establishment2',
            bags: [], // Initially no bags
            estType: 'Slow Food',
            address: '127 Ace Ave'
        }

        const createdEstablishment2 = await establishmentRepo.createEstablishment(newEst2);
        expect(createdEstablishment2).toBeDefined();
        expect(createdEstablishment2.id).toBeDefined();
        expect(createdEstablishment2.id).toBeGreaterThan(createdEstablishment.id); // Check if the new establishment has a different ID
        expect(createdEstablishment2.id).toBe(2);

        const newBag2 = {
            bagType: 'regular',
            estId: createdEstablishment2.id,
            size: 'large',
            tags: 'high protein, low carb',
            price: 10.99,
            items: null, //items will be properly tested in the bagRepo Test Suite
            pickupTimeStart: "2021-06-01", 
            pickupTimeEnd: "2026-12-01",
            available: true
        }
        const bagItem4 = {
            name: 'Potato',
            quantity: 2,
            measurementUnit: 'kg',
        };

        newBag2.items = [bagItem4];

        //add the second bag
        const createdBag2 = await bagsRepo.createBag(newBag2);
        expect(createdBag2).toBeDefined();
        expect(createdBag2.id).toBeDefined();
        expect(createdBag2.estId).toBe(createdEstablishment2.id);
        expect(createdBag2.items).toBeDefined();
        expect(createdBag2.items).toHaveLength(1); // just 1 item added


        //add createdbag

        //expect no error 
        const cartItem = await crtRepo.addBag(createdUser.id, createdBag);


        //add createdBag2 to the cart of user createdUser
        //no error since the establishment is different
        const cartItem2 = await crtRepo.addBag(createdUser.id, createdBag2);
        expect(cartItem2).toBeDefined();
        expect(cartItem2.id).toBeDefined();
        expect(cartItem2.bag.id).toBe(createdBag2.id);
        expect(cartItem2.userId).toBe(createdUser.id);
        expect(cartItem2.bag.items).toBeDefined();
        expect(cartItem2.bag.estId).toBe(createdBag2.estId); // Check if the bagItem is associated with the correct bag

    });


    test("should not be able to add bags of the same establishment on the same day", async () => {


        const newBagSameEst = {
            bagType: 'regular',
            estId: createdEstablishment.id,
            size: 'large',
            tags: 'high protein, low carb',
            price: 10.99,
            items: null, //items will be properly tested in the bagRepo Test Suite
            pickupTimeStart: "2021-06-01", 
            pickupTimeEnd: "2026-12-01",
            available: true
        }
        const bagItem4 = {
            name: 'Potato',
            quantity: 2,
            measurementUnit: 'kg',
        };

        newBagSameEst.items = [bagItem4];

        //add the second bag
        const createdBag2 = await bagsRepo.createBag(newBagSameEst);
        expect(createdBag2).toBeDefined();
        expect(createdBag2.id).toBeDefined();
        expect(createdBag2.estId).toBe(createdEstablishment.id);
        expect(createdBag2.items).toBeDefined();
        expect(createdBag2.items).toHaveLength(1); // just 1 item added


        //add createdbag

        //expect no error 
        const cartItem = await crtRepo.addBag(createdUser.id, createdBag);


        //add createdBag2 to the cart of user createdUser
        //EXPECT ERROR
        await expect(crtRepo.addBag(createdUser.id, createdBag2)).rejects.toThrow(
            'You have already added a bag from this establishment today. Please try again tomorrow.'
        );

    });

    test("should handle cartItem removal from the cart", async () => {

        const cartItem = await crtRepo.addBag(createdUser.id, createdBag);
        expect(cartItem).toBeDefined();
        expect(cartItem.id).toBeDefined();

        //retrieve the cart of user createdUser
        let cart = await crtRepo.getCartByUserId(createdUser.id);
        expect(cart).toBeDefined();
        expect(cart.userId).toBeDefined();
        expect(cart.userId).toBe(createdUser.id);

        //prior to removal, check if the cart has the cartItem
        expect(cart.items).toBeDefined();
        expect(cart.items).toHaveLength(1); // One item added to the cart


        //remove the cartItem from the cart of user createdUser

        await crtRepo.removeBag(createdUser.id, cartItem.id);

        //retrieve the cart of user createdUser
        cart = await crtRepo.getCartByUserId(createdUser.id);
        expect(cart).toBeDefined();
        expect(cart.userId).toBeDefined();
        expect(cart.userId).toBe(createdUser.id);
        
        //since the cart should have NO cartItems, cart.items should be null
        expect(cart.items).toBeNull(); // No items in the cart after removal

    });

    test("should handle cartItem removal of a non-existent bag", async () => {

        //as of now the cart of createdUser has no bags
        const cart = await crtRepo.getCartByUserId(createdUser.id);
        expect(cart).toBeDefined();
        expect(cart.userId).toBeDefined();
        expect(cart.userId).toBe(createdUser.id);
        //since the cart should have NO cartItems, cart.items should be null
        expect(cart.items).toBeNull(); // No items in the cart after removal


        //Now, try removing a non-existent bag from the cart of user createdUser
        const res = await crtRepo.removeBag(9999, 99999); 
        //expect null, no errors should be thrown since the bagId and userId are not in the DB
        expect(res).toBeNull(); // No items in the cart after removal
    });


    test("should handle bags personalization (i.e. bagItems removal)", async () => {

        const cartItem = await crtRepo.addBag(createdUser.id, createdBag);
        expect(cartItem).toBeDefined();
        expect(cartItem.id).toBeDefined();
        //check correctness of cartItem
        expect(cartItem.bag.id).toBe(createdBag.id); 
        expect(cartItem.userId).toBe(createdUser.id); 
        //check it has 3 items
        expect(cartItem.bag.items).toBeDefined();
        expect(cartItem.bag.items).toHaveLength(3); // Three items added to the cartItem

        let cart = await crtRepo.getCartByUserId(createdUser.id);
        expect(cart).toBeDefined();
        expect(cart.userId).toBeDefined();
        expect(cart.userId).toBe(createdUser.id);
        //check if the cartItem is in the cart
        expect(cart.items).toBeDefined();
        expect(cart.items).toHaveLength(1); // One item added to the cart
        expect(cart.items[0].id).toBeDefined();
        expect(cart.items[0].id).toBe(cartItem.id);
        expect(cart.items[0].bag.id).toBe(cartItem.bag.id);
        expect(cart.items[0].userId).toBe(cartItem.userId);
        expect(cart.items[0].bag.items).toBeDefined();
        expect(cart.items[0].bag.items).toHaveLength(3); // Three items added to the cartItem


        //remove bagItem3 - Lettuce - of createdBag from the cart of user createdUser
        //after this the cartItem should have 2 items (bagItems) left

        
        const removedItems = await crtRepo.personalizeBag(createdUser.id, createdBag.id, [2]); 
        
        //check now cartItem has just zero items
        cart = await crtRepo.getCartByUserId(createdUser.id);
        expect(cart).toBeDefined();
        expect(cart.userId).toBeDefined();
        expect(cart.userId).toBe(createdUser.id);
        //check if the cartItem is in the cart
        expect(cart.items).toBeDefined();
        expect(cart.items).toHaveLength(1); // One cartItem in the cart
        expect(cart.items[0].id).toBeDefined();
        expect(cart.items[0].id).toBe(cartItem.id);
        expect(cart.items[0].bag.id).toBe(cartItem.bag.id);
        expect(cart.items[0].userId).toBe(cartItem.userId);

        //check if the bagItem whose index is 2 was correctly removed from the cartItem
        expect(cart.items[0].removedItems).toBeDefined();
        expect(cart.items[0].removedItems).toHaveLength(1); // One item removed from the cartItem
        expect(cart.items[0].removedItems[0]).toBeDefined();
        expect(cart.items[0].removedItems[0]).toBe(2)


    });


    test("should not be able to personalize not regular bags", async () => {
        const surpriseBag = {
            bagType: 'surprise',
            estId: 1, //set manually 1 since in this test suite we just have the new establishment created
            size: 'medium',
            tags: 'gluten free, lactose free',
            price: 10.99,
            items: null, //items will be properly tested in the bagRepo Test Suite
            pickupTimeStart: "2021-06-01", 
            pickupTimeEnd: "2026-12-01",
            available: true
        }

        const bagItem1 = {
            name: 'Tomato',
            quantity: 2,
            measurementUnit: 'kg',
        };

        surpriseBag.items = [bagItem1];

        //add bag
        const createdSurpriseBag = await bagsRepo.createBag(surpriseBag);
        expect(createdSurpriseBag).toBeDefined();
        expect(createdSurpriseBag.id).toBeDefined();
        expect(createdSurpriseBag.estId).toBe(createdEstablishment.id);
        //SURPRISE BAG CHECK
        expect(createdSurpriseBag.bagType).toBe(surpriseBag.bagType); // Check if the bagType is 'surprise'
        expect(createdSurpriseBag.items).toBeDefined();
        expect(createdSurpriseBag.items).toHaveLength(1); // One item added to the bag

        //add bag to cart
        const cartItem = await crtRepo.addBag(createdUser.id, createdSurpriseBag);
        expect(cartItem).toBeDefined();
        expect(cartItem.id).toBeDefined();
        expect(cartItem.bag.id).toBe(createdSurpriseBag.id);
        expect(cartItem.bag.bagType).toBe(createdSurpriseBag.bagType); // Check if the bagType is 'surprise'

        //try to remove the bagItem from the cartItem
        //it's expected an error to be thrown since the bagType is not 'regular'
        //expected throw: "A non-regular bag cannot be personalized"
        await expect(crtRepo.personalizeBag(createdUser.id, createdSurpriseBag.id, [0])).rejects.toThrow("A non-regular bag cannot be personalized");
    });

    test("should not be able to remove > 2 items for regular bags - all in one removal", async () => {

        //createdBag is already a regular bag having 3 items
        //try to remove all of the three items from the cartItem all in once and expect an error to be thrown

        const cartItem = await crtRepo.addBag(createdUser.id, createdBag);
        expect(cartItem).toBeDefined();
        expect(cartItem.id).toBeDefined();
        //check correctness of cartItem
        expect(cartItem.bag.id).toBe(createdBag.id); 
        expect(cartItem.userId).toBe(createdUser.id); 
        //check it has 3 items
        expect(cartItem.bag.items).toBeDefined();
        expect(cartItem.bag.items).toHaveLength(3); // Three items added to the cartItem


        //REMOVE ALL THE ITEMS FROM THE CARTITEM
        await expect(crtRepo.personalizeBag(createdUser.id, createdBag.id, [0, 1, 2])).rejects.toThrow("Cannot remove more than 2 items from the bag!");
    });


    test("should not be able to remove > 2 items for regular bags - one by one removal", async () => {
        //in this case we try to remove 3 items one by one, so we expect an error to be thrown anyway
        //createdBag is already a regular bag having 3 items

        const cartItem = await crtRepo.addBag(createdUser.id, createdBag);
        expect(cartItem).toBeDefined();
        expect(cartItem.id).toBeDefined();
        //check correctness of cartItem
        expect(cartItem.bag.id).toBe(createdBag.id); 
        expect(cartItem.userId).toBe(createdUser.id); 
        //check it has 3 items
        expect(cartItem.bag.items).toBeDefined();
        expect(cartItem.bag.items).toHaveLength(3); // Three items added to the cartItem


        //1. remove bagItem 0 -> removedItems ha length 1 -> no errors to be thrown
        await crtRepo.personalizeBag(createdUser.id, createdBag.id, [1]);

        //check now cartItem has just 1 item in the removedItems array
        let cart = await crtRepo.getCartByUserId(createdUser.id);
        expect(cart).toBeDefined();
        expect(cart.userId).toBeDefined();
        expect(cart.userId).toBe(createdUser.id);
        expect(cart.items).toBeDefined();
        expect(cart.items).toHaveLength(1); // One cartItem in the cart
        expect(cart.items[0].removedItems).toBeDefined();
        expect(cart.items[0].removedItems).toHaveLength(1); // One item removed from the cartItem
        expect(cart.items[0].removedItems[0]).toBeDefined();
        expect(cart.items[0].removedItems[0]).toBe(1)


        //2. remove bagItem 1 -> removedItems ha length 2 -> no errors to be thrown
        await crtRepo.personalizeBag(createdUser.id, createdBag.id, [2]);

        //check now cartItem has just 2 ite2 in the removedItems array
        cart = await crtRepo.getCartByUserId(createdUser.id);
        expect(cart).toBeDefined();
        expect(cart.userId).toBeDefined();
        expect(cart.userId).toBe(createdUser.id);
        expect(cart.items).toBeDefined();
        expect(cart.items).toHaveLength(1); // One cartItem in the cart
        expect(cart.items[0].removedItems).toBeDefined();
        expect(cart.items[0].removedItems).toHaveLength(2); // One item removed from the cartItem
        expect(cart.items[0].removedItems[0]).toBeDefined();
        expect(cart.items[0].removedItems[0]).toBe(1)
        expect(cart.items[0].removedItems[1]).toBeDefined();
        expect(cart.items[0].removedItems[1]).toBe(2)


        //3. remove bagItem 2 -> removedItems ha length 3 -> EXPECT AN ERROR TO BE THROWN
        await expect(crtRepo.personalizeBag(createdUser.id, createdBag.id, [0])).rejects.toThrow("Cannot remove more than 2 items from the bag!");
        //check still 2 and NOT 3 items in the removedItems array
        cart = await crtRepo.getCartByUserId(createdUser.id);
        expect(cart).toBeDefined();
        expect(cart.userId).toBeDefined();
        expect(cart.userId).toBe(createdUser.id);
        expect(cart.items).toBeDefined();
        expect(cart.items).toHaveLength(1); // One cartItem in the cart
        expect(cart.items[0].removedItems).toBeDefined();
        expect(cart.items[0].removedItems).toHaveLength(2); // One item removed from the cartItem
        expect(cart.items[0].removedItems[0]).toBeDefined();
        expect(cart.items[0].removedItems[0]).toBe(1)
        expect(cart.items[0].removedItems[1]).toBeDefined();
        expect(cart.items[0].removedItems[1]).toBe(2)
    });


    test("should not remove unexisting bagItem from the cartItem", async () => {
        //createdBag is already a regular bag having 3 items

        const cartItem = await crtRepo.addBag(createdUser.id, createdBag);
        expect(cartItem).toBeDefined();
        expect(cartItem.id).toBeDefined();
        //check correctness of cartItem
        expect(cartItem.bag.id).toBe(createdBag.id); 
        expect(cartItem.userId).toBe(createdUser.id); 
        //check it has 3 items
        expect(cartItem.bag.items).toBeDefined();
        expect(cartItem.bag.items).toHaveLength(3); // Three items added to the cartItem


        //try to remove a non-existent bagItem from the cartItem
        //error: Item with ID 9999 is not in the bag
        const unexistingId = 9999; 
        await expect(crtRepo.personalizeBag(createdUser.id, createdBag.id, [unexistingId])).rejects.toThrow(`Item with ID ${unexistingId} is not in the bag`);
    });

    test("should handle case where passed array of bag Items to be removed is empty or null", async () => {
        //createdBag is already a regular bag having 3 items

        const cartItem = await crtRepo.addBag(createdUser.id, createdBag);
        expect(cartItem).toBeDefined();
        expect(cartItem.id).toBeDefined();
        //check correctness of cartItem
        expect(cartItem.bag.id).toBe(createdBag.id); 
        expect(cartItem.userId).toBe(createdUser.id); 
        //check it has 3 items
        expect(cartItem.bag.items).toBeDefined();
        expect(cartItem.bag.items).toHaveLength(3); // Three items added to the cartItem

        await expect(crtRepo.personalizeBag(createdUser.id, createdBag.id, [])).rejects.toThrow(`You must specify at least one item to remove`);


        //now try with null
        await expect(crtRepo.personalizeBag(createdUser.id, createdBag.id, null)).rejects.toThrow(`You must specify at least one item to remove`);
    });

});


//Cart Item Repo Testing
describe('CartItemRepo', () => {
    let establishmentRepo;
    let bagsRepo;
    let bagItemsRepo;
    let usRepo;
    let crtRepo;
    let criRepo;


    //since the db has the foreign key contraints that the estId referenced by the bags must exist, we create a mockup establishment
    //alredy create also the bag
    let newEstablishment = {
        name: 'Test Establishment',
        bags: [], // Initially no bags
        estType: 'Restaurant',
        address: '123 Test St'
    }
    const newBag = {
        bagType: 'big',
        estId: 1, //set manually 1 since in this test suite we just have the new establishment created
        size: 'medium',
        tags: 'gluten free, lactose free',
        price: 10.99,
        items: null, //items will be properly tested in the bagRepo Test Suite
        pickupTimeStart: "2021-06-01", 
        pickupTimeEnd: "2026-12-01",
        available: true
    }
    const bagItem1 = {
        name: 'Tomato',
        quantity: 2,
        measurementUnit: 'kg',
    };
    const bagItem2 = {
        name: 'Lettuce',
        quantity: 1,
        measurementUnit: 'kg',
    };
    const bagItem3 = {
        name: 'Carrot',
        quantity: 3,
        measurementUnit: 'kg',
    };


    newBag.items = [bagItem1, bagItem2, bagItem3];

    const user = {
        name: 'Test User',
        assignedName: 'Test',
        familyName: 'User',
        email: 'prova@gmail.com',
        password: 'password123'
    };



    let createdEstablishment;
    let createdBag;
    let createdUser;
    let createdCartItem;

    beforeEach(async () => {
        const {userRepo, cartRepo, estRepo, bagRepo, bagItRepo, cartItRepo} = await createTestDbRepos();
        establishmentRepo = estRepo;
        bagsRepo = bagRepo;
        bagItemsRepo = bagItRepo;
        usRepo = userRepo;
        crtRepo = cartRepo;
        criRepo = cartItRepo;

        //create the establishment for the tests
        createdEstablishment = await establishmentRepo.createEstablishment(newEstablishment);
        expect(createdEstablishment).toBeDefined();
        expect(createdEstablishment.id).toBeDefined();


        //create the bag
        createdBag = await bagsRepo.createBag(newBag);
        expect(createdBag).toBeDefined();
        expect(createdBag.id).toBeDefined();
        expect(createdBag.estId).toBe(createdEstablishment.id);
        expect(createdBag.items).toBeDefined();
        expect(createdBag.items).toHaveLength(3); // Three items added to the bag

        //create the user
        createdUser = await usRepo.createUser(user);
        expect(createdUser).toBeDefined();
        expect(createdUser.id).toBeDefined();

        //create tha cartItem for the user createdUser
         //cart item
        const newcartItem = {
            userId: createdUser.id,
            bag: createdBag,
            removedItems: [] // Initially no items removed
        };

        createdCartItem = await criRepo.createCartItem(newcartItem);
        expect(createdCartItem).toBeDefined();
        expect(createdCartItem.id).toBeDefined();
        expect(createdCartItem.userId).toBe(createdUser.id); // Check if the cartItem is associated with the correct user
        expect(createdCartItem.bag.id).toBe(createdBag.id); // Check if the cartItem is associated with the correct bag


    });

    test("should retrieve cartItem by its id", async () => {

        //retrieve the cartItem by id
        
        const cartItemRetrieved = await criRepo.getCartItemById(createdCartItem.id); 
        console.log("CART ITEM RETRIEVED: ", cartItemRetrieved);
        //check if it's correct
        expect(cartItemRetrieved).toBeDefined();
        expect(cartItemRetrieved.id).toBe(createdCartItem.id);
        expect(cartItemRetrieved.userId).toBe(createdCartItem.userId);
        expect(cartItemRetrieved.bag.id).toBe(createdCartItem.bag.id); // Check if the bag ID is correct
        expect(cartItemRetrieved.bag.items).toBeDefined();
        expect(cartItemRetrieved.bag.items).toHaveLength(3); // Three items added to the cartItem
    });


    test("should get userId by cartItemId", async () => {

        const fetchedUserId = await criRepo.getUserIdByCartItemId(createdCartItem.id);
        expect(fetchedUserId).toBeDefined();
        expect(fetchedUserId).toBe(createdCartItem.userId); 
        expect(fetchedUserId).toBe(createdUser.id); 
    });

    test("should properly delete a cartItem by its id", async () => {

        //delete the cartItem by id
        const res = await criRepo.deleteCartItem(createdCartItem.id); 
        //res needs to be null
        expect(res).toBeNull(); 

        //try to retrieve the deleted cartItem by id
        const cartItemRetrieved = await criRepo.getCartItemById(createdCartItem.id); 
        expect(cartItemRetrieved).toBeNull(); // Expect null for non-existent cart item

    });


    test("should handle deletion of non-existent cartItem", async () => {
        // Try to delete a cartItem with an ID that doesn't exist
        const nonExistingCartItemId = 99999;
        const res = await criRepo.deleteCartItem(nonExistingCartItemId); 
        expect(res).toBeNull(); 
    });


    test("should delete a cartItem by bagId and userId", async () => {

        //delete the cartItem by bagId and userId
        const res = await criRepo.deleteCartItemByBagIdUserId(createdBag.id, createdUser.id); 
        //res needs to be null
        expect(res).toBeNull(); 

        //try to retrieve the deleted cartItem by id
        const cartItemRetrieved = await criRepo.getCartItemById(createdCartItem.id); 
        expect(cartItemRetrieved).toBeNull(); // Expect null for non-existent cart item

    });


    test("should get the cart Item List by userId", async () => {

        //check if the user's cart has got the cartItem
        let cartItemList = await criRepo.getCartItemListByUserId(createdUser.id);


        expect(cartItemList).toBeDefined();
        expect(cartItemList).toHaveLength(1); // One item added to the cart

        //check if cart is correctly associated with the user
        expect(cartItemList[0].userId).toBeDefined();
        expect(cartItemList[0].userId).toBe(createdUser.id);

        //check if the cartItem is in the cart
        expect(cartItemList[0].id).toBeDefined();
        expect(cartItemList[0].id).toBe(createdCartItem.id); 
        expect(cartItemList[0].bag.id).toBe(createdCartItem.bag.id); 
        expect(cartItemList[0].userId).toBe(createdCartItem.userId);


        //now add another cartItem to the user createdUser

        const newBag2 = {
            bagType: 'regular',
            estId: 1, //set manually 1 since in this test suite we just have the new establishment created
            size: 'large',
            tags: '/',
            price: 20.99,
            items: null, //items will be properly tested in the bagRepo Test Suite
            pickupTimeStart: "2021-06-01", 
            pickupTimeEnd: "2026-12-01",
            available: true
        }

        //create the bag
        const createdBag2 = await bagsRepo.createBag(newBag2);
        expect(createdBag2).toBeDefined();
        expect(createdBag2.id).toBeDefined();
        expect(createdBag2.estId).toBe(createdEstablishment.id);

        const newcartItem2 =
        {
            userId: createdUser.id,
            bag: createdBag2,
            removedItems: [] // Initially no items removed
        };

        const createdCartItem2 = await criRepo.createCartItem(newcartItem2);
        expect(createdCartItem2).toBeDefined();
        expect(createdCartItem2.id).toBeDefined();
        expect(createdCartItem2.userId).toBe(createdUser.id); 
        expect(createdCartItem2.bag.id).toBe(createdBag2.id); 


        //retrieve again the cartItemList by userId
        cartItemList = await criRepo.getCartItemListByUserId(createdUser.id);
        expect(cartItemList).toBeDefined();
        expect(cartItemList).toHaveLength(2); // Two items added to the cart
        //check if cart is correctly associated with the user
        expect(cartItemList[0].userId).toBeDefined();
        expect(cartItemList[0].userId).toBe(createdUser.id);

        //check if the cartItem is in the cart
        expect(cartItemList[0].id).toBeDefined();
        expect(cartItemList[0].id).toBe(createdCartItem.id); 
        expect(cartItemList[0].bag.id).toBe(createdCartItem.bag.id); 
        expect(cartItemList[0].userId).toBe(createdCartItem.userId);

        //check if cart is correctly associated with the user
        expect(cartItemList[1].userId).toBeDefined();
        expect(cartItemList[1].userId).toBe(createdUser.id);

        //check if the cartItem is in the cart
        expect(cartItemList[1].id).toBeDefined();
        expect(cartItemList[1].id).toBe(createdCartItem2.id); 
        expect(cartItemList[1].bag.id).toBe(createdCartItem2.bag.id); 
        expect(cartItemList[1].userId).toBe(createdCartItem2.userId);
    });

});


//Reservation Repo Testing
describe('ReservationRepo', () => {

    let establishmentRepo;
    let bagsRepo;
    let bagItemsRepo;
    let usRepo;
    let crtRepo;
    let criRepo;
    let rsRepo;


    //since the db has the foreign key contraints that the estId referenced by the bags must exist, we create a mockup establishment
    //alredy create also the bag
    let newEstablishment = {
        name: 'Test Establishment',
        bags: [], // Initially no bags
        estType: 'Restaurant',
        address: '123 Test St'
    }
    const newBag = {
        bagType: 'big',
        estId: 1, //set manually 1 since in this test suite we just have the new establishment created
        size: 'medium',
        tags: 'gluten free, lactose free',
        price: 10.99,
        items: null, //items will be properly tested in the bagRepo Test Suite
        pickupTimeStart: "2021-06-01", 
        pickupTimeEnd: "2026-12-01",
        available: true
    }
    const bagItem1 = {
        name: 'Tomato',
        quantity: 2,
        measurementUnit: 'kg',
    };
    const bagItem2 = {
        name: 'Lettuce',
        quantity: 1,
        measurementUnit: 'kg',
    };
    const bagItem3 = {
        name: 'Carrot',
        quantity: 3,
        measurementUnit: 'kg',
    };


    newBag.items = [bagItem1, bagItem2, bagItem3];

    const user = {
        name: 'Test User',
        assignedName: 'Test',
        familyName: 'User',
        email: 'prova@gmail.com',
        password: 'password123'
    };



    let createdEstablishment;
    let createdBag;
    let createdUser;
    let createdCartItem;
    let userCart;

    beforeEach(async () => {
        const {userRepo, cartRepo, resRepo, estRepo, bagRepo} = await createTestDbRepos();
        establishmentRepo = estRepo;
        bagsRepo = bagRepo;
        usRepo = userRepo;
        crtRepo = cartRepo;
        rsRepo = resRepo;

        //create the establishment for the tests
        createdEstablishment = await establishmentRepo.createEstablishment(newEstablishment);
        expect(createdEstablishment).toBeDefined();
        expect(createdEstablishment.id).toBeDefined();


        //create the bag
        createdBag = await bagsRepo.createBag(newBag);
        expect(createdBag).toBeDefined();
        expect(createdBag.id).toBeDefined();
        expect(createdBag.estId).toBe(createdEstablishment.id);
        expect(createdBag.items).toBeDefined();
        expect(createdBag.items).toHaveLength(3); // Three items added to the bag

        //create the user
        createdUser = await usRepo.createUser(user);
        expect(createdUser).toBeDefined();
        expect(createdUser.id).toBeDefined();

        //add bag to createdUser's cart
        createdCartItem = await crtRepo.addBag(createdUser.id, createdBag);
        expect(createdCartItem).toBeDefined();
        expect(createdCartItem.id).toBeDefined();
        expect(createdCartItem.userId).toBe(createdUser.id); // Check if the cartItem is associated with the correct user
        expect(createdCartItem.bag.id).toBe(createdBag.id); // Check if the cartItem is associated with the correct bag

        //retrieve user cart
        userCart = await crtRepo.getCartByUserId(createdUser.id);
        expect(userCart).toBeDefined();
        expect(userCart.userId).toBeDefined();
        expect(userCart.userId).toBe(createdUser.id);
        expect(userCart.items).toBeDefined();
        expect(userCart.items).toHaveLength(1); // One item added to the cart
        expect(userCart.items[0].id).toBeDefined();
        expect(userCart.items[0].id).toBe(createdCartItem.id);

    });


    test("should create a reservation and correctly retrieve it", async () => {
        //create the reservation
        //constructor(id, userId, cartItem, createdAt) {
        const dateRef = dayjs().format('YYYY-MM-DD'); // Use current date for createdAt
        const reserv = {
            userId: createdUser.id,
            cartItem: createdCartItem,
            createdAt: dateRef
        }

        const createdReservation = await rsRepo.createReservation(reserv);
        expect(createdReservation).toBeDefined();
        expect(createdReservation.id).toBeDefined();
        expect(createdReservation.userId).toBe(createdUser.id); // Check if the reservation is associated with the correct user
        expect(createdReservation.cartItem.id).toBe(createdCartItem.id); // Check if the reservation is associated with the correct cartItem


        //now attempt to retrieve the reservation by cartItemId
        const fetchedReservation = await rsRepo.getReservationByCartItemId(createdCartItem.id);
        console.log("FETCHED RESERVATION: ", fetchedReservation);
        expect(fetchedReservation).toBeDefined();
        expect(fetchedReservation.id).toBeDefined();
        expect(fetchedReservation.userId).toBe(createdUser.id); 
        expect(fetchedReservation.cartItem.id).toBe(createdCartItem.id); 
        expect(fetchedReservation.cartItem.bag.id).toBe(createdBag.id); 
        expect(fetchedReservation.createdAt).toBeDefined();
        expect(fetchedReservation.createdAt.isSame(dayjs(dateRef, 'YYYY-MM-DD'), 'day')).toBe(true); 
    });


    test("should list reservation for each establishment", async () => {
        const dateRef = dayjs().format('YYYY-MM-DD'); //Use current date for createdAt
        const reserv = {
            userId: createdUser.id,
            cartItem: createdCartItem,
            createdAt: dateRef
        }

        const createdReservation = await rsRepo.createReservation(reserv);
        expect(createdReservation).toBeDefined();
        expect(createdReservation.id).toBeDefined();
        expect(createdReservation.userId).toBe(createdUser.id); // Check if the reservation is associated with the correct user
        expect(createdReservation.cartItem.id).toBe(createdCartItem.id); // Check if the reservation is associated with the correct cartItem


        const estId = createdEstablishment.id; 

        const fetchedReservations = await rsRepo.listReservationsByEstablishment(estId);
        //check we fetched just one reservation
        expect(fetchedReservations).toBeDefined();
        expect(fetchedReservations).toHaveLength(1); //One reservation made by the user

        //check the one reservation we fetched is the one we created
        expect(fetchedReservations[0]).toBeDefined();
        expect(fetchedReservations[0].userId).toBe(createdUser.id);
        expect(fetchedReservations[0].cartItem.id).toBe(createdCartItem.id);
        expect(fetchedReservations[0].cartItem.bag.id).toBe(createdBag.id);
    });

    test("should cancel a reservation (without deleting it)", async () => {
        //create the reservation
        const dateRef = dayjs().format('YYYY-MM-DD'); //Use current date for createdAt
        const reserv = {
            userId: createdUser.id,
            cartItem: createdCartItem,
            createdAt: dateRef
        }


        const createdReservation = await rsRepo.createReservation(reserv);
        expect(createdReservation).toBeDefined();
        expect(createdReservation.cartItem.id).toBe(createdCartItem.id); // Check if the reservation is associated with the correct cartItem
        expect(createdReservation.userId).toBe(createdUser.id); // Check if the reservation is associated with the correct user

        //SET canceledAt to the current date
        createdReservation.canceledAt = dateRef;

        console.log("CANCELED RESERVATION: ", createdReservation);

        //delete the reservation by id
        const res = await rsRepo.cancelReservation(createdReservation); 
        //res needs to be null -> cancelling successfully done
        expect(res).toBeNull(); 

        //try to retrieve the canceled reservation by id
        const fetchedReservation = await rsRepo.getReservationByCartItemId(createdCartItem.id); 
        expect(fetchedReservation).toBeDefined(); 
        expect(fetchedReservation.cartItem.id).toBe(createdCartItem.id);
        //check canceledAt is NOT NULL 
        expect(fetchedReservation.canceledAt).toBeDefined();
        expect(fetchedReservation.canceledAt.isSame(dayjs(dateRef, 'YYYY-MM-DD'), 'day')).toBe(true); // Check if the canceledAt date is correct

    });


    describe('Listing reservations made by a user (Active, Canceled, All)', () => {

        let createdReservation; 
        let createdReservation2; 

        beforeEach(async () => {
            const dateRef = dayjs().format('YYYY-MM-DD'); // Use current date for createdAt
            const reserv = {
                userId: createdUser.id,
                cartItem: createdCartItem,
                createdAt: dateRef
            }

            createdReservation = await rsRepo.createReservation(reserv);
            expect(createdReservation).toBeDefined();
            expect(createdReservation.id).toBeDefined();
            expect(createdReservation.userId).toBe(createdUser.id); // Check if the reservation is associated with the correct user
            expect(createdReservation.cartItem.id).toBe(createdCartItem.id);


            //Now do another reservation and then cancel it
            const est2 = {
                name: 'Test Establishment 2',
                bags: [], // Initially no bags
                estType: 'Restaurant',
                address: '123 Test St 2'
            }

            const createdEstablishment2 = await establishmentRepo.createEstablishment(est2);
            expect(createdEstablishment2).toBeDefined();
            expect(createdEstablishment2.id).toBeDefined();

            const bag2 = {
                bagType: 'regular',
                estId: createdEstablishment2.id, 
                size: 'medium',
                tags: 'gluten free, lactose free',
                price: 10.99,
                items: null, 
                pickupTimeStart: "2021-06-01", 
                pickupTimeEnd: "2026-12-01",
                available: true
            }

            const createdBag2 = await bagsRepo.createBag(bag2);
            expect(createdBag2).toBeDefined();
            expect(createdBag2.id).toBeDefined();
            expect(createdBag2.estId).toBe(createdEstablishment2.id);

            //reserv this second bag
            const cartItem2 = await crtRepo.addBag(createdUser.id, createdBag2);
            expect(cartItem2).toBeDefined();
            expect(cartItem2.id).toBeDefined();
            expect(cartItem2.userId).toBe(createdUser.id); // Check if the cartItem is associated with the correct user
            expect(cartItem2.bag.id).toBe(createdBag2.id); // Check if the cartItem is associated with the correct bag


            const reserv2 = {
                userId: createdUser.id,
                cartItem: cartItem2,
                createdAt: dateRef
            }

            createdReservation2 = await rsRepo.createReservation(reserv2);
            expect(createdReservation2).toBeDefined();
            expect(createdReservation2.id).toBeDefined();
            expect(createdReservation2.userId).toBe(createdUser.id); // Check if the reservation is associated with the correct user


            //Now cancel the second reservation
            createdReservation2.canceledAt = dateRef;

            const res = await rsRepo.cancelReservation(createdReservation2);
            //res needs to be null -> cancelling successfully done
            expect(res).toBeNull();

        });

        test("should list all the active (i.e. NOT canceled) reservations made by user", async () => {


            //Now retieve JUST THE ACTIVE RESERVATIONS (i.e. NOT CANCELED) made by the user
            const activeReservations = await rsRepo.listReservationsByUser(createdUser.id, 'active');
            //expect JUST the first reservation to be in the list
            expect(activeReservations).toBeDefined();
            expect(activeReservations).toHaveLength(1); // One active reservation made by the user
            //check it's actually the first reservation we created
            expect(activeReservations[0]).toBeDefined();
            expect(activeReservations[0].id).toBe(createdReservation.id);
            expect(activeReservations[0].canceledAt).toBeNull(); // Check if canceledAt is null for active reservation
            expect(activeReservations[0].cartItem.id).toBe(createdCartItem.id); // Check if the cartItem is correct
        });

        test("should list all the canceled reservations made by user", async () => {

            //Now retieve JUST THE CANCELED RESERVATIONS made by the user
            const canceledReservations = await rsRepo.listReservationsByUser(createdUser.id, 'canceled');
            //expect JUST the second reservation to be in the list
            expect(canceledReservations).toBeDefined();
            expect(canceledReservations).toHaveLength(1); // One canceled reservation made by the user
            //check it's actually the second reservation we created and then canceled
            expect(canceledReservations[0]).toBeDefined();
            expect(canceledReservations[0].id).toBe(createdReservation2.id);
            expect(canceledReservations[0].canceledAt).toBeDefined(); // Check if canceledAt is not null for canceled reservation
            expect(canceledReservations[0].cartItem.id).toBe(createdReservation2.cartItem.id); // Check if the cartItem is correct
        });


        test("should list all the reservations made by user (active and canceled)", async () => {

            //Now retieve ALL THE RESERVATIONS made by the user
            const allReservations = await rsRepo.listReservationsByUser(createdUser.id, 'all');
            //expect both the reservations to be in the list
            expect(allReservations).toBeDefined();
            expect(allReservations).toHaveLength(2); // Two reservations made by the user
            //check it's actually both the reservations we created
            expect(allReservations[0]).toBeDefined();
            expect(allReservations[0].id).toBe(createdReservation.id);
            expect(allReservations[0].canceledAt).toBeNull(); // Check if canceledAt is null for active reservation
            expect(allReservations[0].cartItem.id).toBe(createdCartItem.id); // Check if the cartItem is correct
            expect(allReservations[1]).toBeDefined();
            expect(allReservations[1].id).toBe(createdReservation2.id);
            expect(allReservations[1].canceledAt).toBeDefined(); // Check if canceledAt is not null for canceled reservation
            expect(allReservations[1].cartItem.id).toBe(createdReservation2.cartItem.id); // Check if the cartItem is correct
        });


    });

    test("should check Establishment contraint: each user can reserve just one bag per establishment at a day", async () => {
        //make the reservation for the first bag
        const dateRef = dayjs().format('YYYY-MM-DD'); // Use current date for createdAt
        const reserv = {
            userId: createdUser.id,
            cartItem: createdCartItem,
            createdAt: dateRef
        }

        const createdReservation = await rsRepo.createReservation(reserv);
        expect(createdReservation).toBeDefined();
        expect(createdReservation.id).toBeDefined();
        expect(createdReservation.userId).toBe(createdUser.id); // Check if the reservation is associated with the correct user
        expect(createdReservation.cartItem.id).toBe(createdCartItem.id);

        //another bag of the same establishment
        const bagSameEst = {
            bagType: 'regular',
            estId: createdEstablishment.id, 
            size: 'medium',
            tags: 'gluten free, lactose free',
            price: 10.99,
            items: null, 
            pickupTimeStart: "2021-06-01", 
            pickupTimeEnd: "2026-12-01",
            available: true
        }
        const createdBagSameEst = await bagsRepo.createBag(bagSameEst);

        //simulate a second reservation (without actualy committing it to the db)
        const reservSameEst = {
            userId: createdUser.id,
            cartItem: {
                id: null, // Set to null for simulation
                bag: createdBagSameEst,
                removedItems: [] 
            },
            createdAt: dateRef
        }


        //test the function: checkEstablishmentContraint(userId, createdAt, estId)
        const check = await rsRepo.checkEstablishmentContraint(createdUser.id, reservSameEst.createdAt, createdEstablishment.id);
        //TRUE is the user has a reservation for the same establishment at the same day
        //FALSE otherwise
        //in this case it should be TRUE
        expect(check).toBe(true); // User has a reservation for the same establishment at the same day


        //Now create a second est
        const est2 = {
            name: 'Test Establishment 2',
            bags: [], // Initially no bags
            estType: 'Restaurant',
            address: '123 Test St 2'
        }

        const createdEstablishment2 = await establishmentRepo.createEstablishment(est2);
        expect(createdEstablishment2).toBeDefined();
        expect(createdEstablishment2.id).toBeDefined();


        //change the est of the second bag to the new one
        bagSameEst.estId = createdEstablishment2.id;
        const createdBagSameEst2 = await bagsRepo.createBag(bagSameEst);
        expect(createdBagSameEst2).toBeDefined();
        expect(createdBagSameEst2.id).toBeDefined();
        expect(createdBagSameEst2.estId).toBe(createdEstablishment2.id);

        //Now make again a second reservation for the second bag without actually committing it to the db
        const reservSameEst2 = {
            userId: createdUser.id,
            cartItem: {
                id: null, // Set to null for simulation
                bag: createdBagSameEst2,
                removedItems: [] 
            },
            createdAt: dateRef
        }

        //let's check the constraint in this case
        const check2 = await rsRepo.checkEstablishmentContraint(createdUser.id, reservSameEst2.createdAt, createdEstablishment2.id);
        //it should be FALSE this time since the user has no reservation for the second establishment at the same day
        expect(check2).toBe(false); 
    });

    //TODO: TEST DI CON BAG AVAILABILITY (i.e. bag was available during cart but at the moment of reservation it was not available anymore)

});

