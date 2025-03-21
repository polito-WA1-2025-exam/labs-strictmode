import {Bag, User, Establishment, Reservation, Cart, BagItem, CartItem} from "./models/index.mjs";
import assert from "node:assert/strict";


//Example to test the models
const user1 = new User(1, "mail@esempio.com", "Forza", "Toro", ["peanuts"]);

const bag1 = new Bag(1, Bag.TYPE_REGULAR, 101, 5, "2025-03-13 10:00:00", "2025-03-14 12:00:00");
bag1.addItem(new BagItem(1, 1, "Sandwich", 1));
bag1.addItem(new BagItem(1, 2, "Apple", 1));
assert.equal(bag1.items.length, 2);

const est1 = new Establishment(101, "Bakery", [bag1], "store");

const reservation1 = new Reservation(1, user1.id, est1.id, "2025-03-14 11:00:00");

// Cart Tests
console.log("\n---- CART TESTS ----");
est1.bags = [bag1]; // Add bag1 to establishment 101

// Create a second bag for testing
const bag2 = new Bag(2, Bag.TYPE_REGULAR, 102, 10, "2025-03-13 14:00:00", "2025-03-14 16:00:00");
bag2.addItem(new BagItem(2, 3, "Chocolate Bar", 2));
const est2 = new Establishment(102, "Coffee Shop", [bag2], "store");
est2.bags = [bag2]; // Add bag2 to establishment 102


// Test cart creation
const cart = new Cart(user1.id);
assert.equal(cart.items.length, 0, "Cart should start empty");
console.log("Cart creation test: PASSED");

// Test adding items to cart
const cartItem1 = cart.addItem(new CartItem(bag1));
assert.equal(cart.items.length, 1, "Cart should have 1 item");
assert.equal(cartItem1.bag, bag1, "Cart item should reference the correct bag");
assert.equal(cartItem1.removedItems.length, 0, "Cart item should have no removed items initially");
console.log("Adding item to cart test: PASSED");

// Test adding a second bag
const removedItems = [1]; // Remove item with ID 1 (Sandwich)
const cartItem2 = cart.addItem(new CartItem(bag2, removedItems));

assert.equal(cart.items.length, 2, "Cart should have 2 items");
assert.equal(cartItem2.bag, bag2, "Second cart item should reference the correct bag");
assert.equal(cartItem2.removedItems.length, 1, "Second cart item should have 1 removed item");
console.log("Adding personalized item to cart test: PASSED");

// Test one bag per establishment per day constraint
try {
    // Create a third bag from the same establishment as bag1 (est1)
    const bag3 = new Bag(3, "regular", 101, 7, "2025-03-13 16:00:00", "2025-03-14 18:00:00");
    cart.addItem(new CartItem(bag3));
    assert.fail("Should not allow adding a second bag from the same establishment on the same day");
} catch (error) {
    assert.equal(error.message, "One bag per establishment per day", "Should throw correct error message");
    console.log("One bag per establishment per day constraint test: PASSED");
}

// Test CartItem functionality - removing items
const newBag = new Bag(4, "regular", 103, 8, "2025-03-15 10:00:00", "2025-03-15 12:00:00");
newBag.addItem(new BagItem(4, 5, "Salad", 1));
newBag.addItem(new BagItem(4, 6, "Fruit", 1));
newBag.addItem(new BagItem(4, 7, "Dessert", 1));

const cartItem = new CartItem(newBag);
assert.equal(cartItem.removedItems.length, 0, "CartItem should start with no removed items");

cartItem.removeItem(5); // Remove the salad
assert.equal(cartItem.removedItems.length, 1, "CartItem should have 1 removed item");
assert.equal(cartItem.removedItems[0], 5, "Removed item ID should match");

cartItem.removeItem(6); // Remove the fruit
assert.equal(cartItem.removedItems.length, 2, "CartItem should have 2 removed items");

try {
    cartItem.removeItem(7); // Try to remove a third item - should throw an error
    assert.fail("Should not allow removing more than 2 items from a regular bag");
} catch (error) {
    console.log("CartItem removeItem test: PASSED");
}

console.log("CartItem removeItem test: PASSED");
console.log("All Cart tests passed!");