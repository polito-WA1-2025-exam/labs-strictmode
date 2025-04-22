import { describe, expect, test, beforeEach } from 'vitest';
import { createDb } from "../../database";
import { BagRepo, UserRepo, CartRepo, ReservationRepo, EstablishmentRepo, BagItemRepo, CartItemRepo } from "../repos/index.mjs";
import dayjs from 'dayjs';

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

    beforeEach(async () => {
        const {estRepo, bagRepo} = await createTestDbRepos();
        establishmentRepo = estRepo;
        bagsRepo = bagRepo;

        //create the establishment for the tests
        createdEstablishment = await establishmentRepo.createEstablishment(newEstablishment);
        expect(createdEstablishment).toBeDefined();
        expect(createdEstablishment.id).toBeDefined();
    });


    test('should create a new bag and retrieve it', async () => {


        //Create a new bag

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


    test('should add bagItems, correctly associate them with the bag and retrieve them', async () => {


        //Create a new bag

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


    test("should change bag availability and correctly retrieve it", async () => {


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


        //set the bag to unavailable
        bagsRepo.setAvailable(createdBag.id, false);

        //retrieve the bag and check if it is unavailable
        const fetchedBag = await bagsRepo.getBagById(createdBag.id);

        expect(fetchedBag).toBeDefined();
        expect(fetchedBag.id).toBe(createdBag.id);
        //AVAILABILITY CHECK
        expect(fetchedBag.available).toBeDefined();
        expect(fetchedBag.available).toBe(false); // Bag should be unavailable now
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
        const newBag2 = {
            bagType: 'big',
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

        newBag2.items = [bagItem4];

        //add the second bag
        const createdBag2 = await bagsRepo.createBag(newBag2);
        expect(createdBag2).toBeDefined();
        expect(createdBag2.id).toBeDefined();
        expect(createdBag2.estId).toBe(createdEstablishment.id);
        expect(createdBag2.items).toBeDefined();
        expect(createdBag2.items).toHaveLength(1); // just 1 item added


        //add createdBag to the cart of user createdUser
        const cartItem = await crtRepo.addBag(createdUser.id, createdBag);

        //add createdBag2 to the cart of user createdUser
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

});

