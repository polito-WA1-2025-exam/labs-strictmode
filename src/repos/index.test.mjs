import { describe, expect, test } from 'vitest';
import { createDb } from "../../database";
import { BagRepo, UserRepo, CartRepo, ReservationRepo, EstablishmentRepo } from "../repos/index.mjs";

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
