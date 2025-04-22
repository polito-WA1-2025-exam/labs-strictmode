import { describe, expect, test, beforeEach } from 'vitest';
import { createDb } from "../../database";
import { BagRepo, UserRepo, CartRepo, ReservationRepo, EstablishmentRepo } from "../repos/index.mjs";
import dayjs from 'dayjs';

async function createTestDbRepos() {
    let db = await createDb(":memory:");
    return {
        bagRepo: new BagRepo(db),
        userRepo: new UserRepo(db),
        cartRepo: new CartRepo(db),
        resRepo: new ReservationRepo(db),
        estRepo: new EstablishmentRepo(db)
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
    beforeEach(async () => {
        const {estRepo, bagRepo} = await createTestDbRepos();
        establishmentRepo = estRepo;
        bagsRepo = bagRepo;
    });


    test('should create a new bag and retrieve it', async () => {
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
        expect(createdEstablishment.bags).toEqual([]); // Initially no bags


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
        expect(createdEstablishment.bags).toEqual([]); // Initially no bags


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

        const newEstablishment = {
            name: 'Test Establishment',
            bags: [], // Initially no bags
            estType: 'Restaurant',
            address: '123 Test St'
        }
        const createdEstablishment = await establishmentRepo.createEstablishment(newEstablishment);

        expect(createdEstablishment).toBeDefined();
        expect(createdEstablishment.id).toBeDefined();


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


    


});
