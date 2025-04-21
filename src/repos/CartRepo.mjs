import Cart from '../models/index.mjs'
import { CartItemRepo, RemovedRepo } from './index.mjs';

/**
 * Class representing a repository for managing a shopping cart.
 */
export class CartRepo {
    constructor(db) {
        this.DB = db;
    }
    
    /**
     * Add a bag to the user's cart.
     * @param {UserId} userId
     * @param {bagId} bagId
     * @param {CartItem} cartItem;
     */
    async addBag(userId, bagId) {
        let cartItemRepo = new CartItemRepo(this.DB);
        let cartItem = new CartItem(bagId, userId, []);
        cartItem = await cartItemRepo.createCartItem(cartItem, userId);
        return cartItem;
    }

    /**
     * Remove a bag from the user's cart.
     * @param {CartItem} cartItem
     * @returns
     */
    async removeBag(userId, bagId) {
        let cartItemRepo = new CartItemRepo(this.DB);
        await cartItemRepo.deleteCartItem(cartItem.id);
    }

    /**
     * Returns an object with all the items (=bags) in the user's cart.
     * @param {number} userId
     * @returns {Cart}
     */
    async getCart(userId) {
        let cartItemRepo = new CartItemRepo(this.DB);
        let cartItem_list = await cartItemRepo.getCartItemListByUserId(userId);

        let cart = new Cart(userId);
        cart.items = cartItem_list;

        return cart;
    }

    /**
     * Updates the set of removed items for a bag in the user's cart.
     * @param {number} userId
     * @param {number} bagId - The ID of the bag.
     * @param {number[]} removedItems - The updated list of removed item IDs
     */

    // removedItems -> it might be saved as a string in the DB. THe string contains IDs of bag Items 

    async personalizeBag(userId, bagId, removedItems) {
        let cartItemRepo = new CartItemRepo(this.DB);
        let cartItem = await cartItemRepo.getCartItemByBagIdUserID(bagId, userId);

        let removedRepo = new RemovedRepo(this.DB);
        await Promise.all(removedItems.map(bagItemId => {
            return removedRepo.createRemoved(bagItemId, cartItem.id);
        }));

    }
}