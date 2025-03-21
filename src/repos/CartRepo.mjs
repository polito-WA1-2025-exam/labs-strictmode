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
    async addBag(userId, bagId) {}

    /**
     * Remove a bag from the user's cart.
     * @param {number} userId
     * @param {number} bagId
     */
    async removeBag(userId, bagId) {}

    /**
     * Returns an object with all the items in the user's cart.
     * @param {number} userId
     * @returns {Cart}
     */
    async getCart(userId) {}

    /**
     * Updates the set of removed items for a bag in the user's cart.
     * @param {number} userId
     * @param {number} bagId - The ID of the bag.
     * @param {number[]} removedItems - The updated list of removed item IDs
     */
    async personalizeBag(userId, bagId, removedItems) {}
}