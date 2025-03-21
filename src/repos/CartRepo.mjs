import Cart from "../models/Cart.mjs";

/**
 * Class representing a repository for managing a shopping cart.
 */
export class CartRepo {
    constructor() {
    }
    
    /**
     * Add a bag to the user's cart.
     * @param {number} userId
     * @param {number} bagId
     */
    addBag(userId, bagId) {}

    /**
     * Remove a bag from the user's cart.
     * @param {number} userId
     * @param {number} bagId
     */
    removeBag(userId, bagId) {}

    /**
     * Returns an object with all the items (=bags) in the user's cart.
     * @param {number} userId
     * @returns {Cart}
     */
    getCart(userId) {}

    /**
     * Updates the set of removed items for a bag in the user's cart.
     * @param {number} userId
     * @param {number} bagId - The ID of the bag.
     * @param {number[]} removedItems - The updated list of removed item IDs
     */
    personalizeBag(userId, bagId, removedItems) {}
}