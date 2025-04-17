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
});
