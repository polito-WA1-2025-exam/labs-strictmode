import {Cart, CartItem} from '../models/index.mjs'
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
    async addBag(userId, bag) {
        let cartItemRepo = new CartItemRepo(this.DB);
                                   //id, bagId, userId, removedItems
        let cartItem = new CartItem(null, bag, userId, []);
        cartItem = await cartItemRepo.createCartItem(cartItem);
        console.log('Cart Item created successfully: ', cartItem);
        return cartItem;
    }


    /**
     * Remove a bag from the user's cart.
     * @param {CartItem} cartItem
     * @returns
     */
    async removeBag(userId, bagId) {
        let cartItemRepo = new CartItemRepo(this.DB);
        return await cartItemRepo.deleteCartItemByBagIdUserId(bagId, userId);
    }

    /**
     * Returns an object with all the items (=bags) in the user's cart.
     * @param {number} userId
     * @returns {Cart}
     */
    async getCartByUserId(userId) {
        let cartItemRepo = new CartItemRepo(this.DB);
        let cartItem_list = await cartItemRepo.getCartItemListByUserId(userId);

        console.log("FUCKING CARTITEM_LIST: ", cartItem_list);

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