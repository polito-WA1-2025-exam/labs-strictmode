import sqlite3 from 'sqlite3';
import dayjs from 'dayjs';
import {pathDbFromRepos, connect} from '../../database/index.js';
import Cart from '../models/index.mjs'
import { BagRepo, CartItemRepo, RemovedRepo } from './index.mjs';

/**
 * Class representing a repository for managing a shopping cart.
 */
export class CartRepo {
    
    constructor() {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }
    
    /**
     * Add a bag to the user's cart.
     * @param {UserId} userId
     * @param {bagId} bagId
     * @param {CartItem} cartItem;
     */
    async addBag(userId, bagId) {
        let cartItemRepo = new CartItemRepo();
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
        let cartItemRepo = new CartItemRepo();
        await cartItemRepo.deleteCartItem(cartItem.id);
    }

    /**
     * Returns an object with all the items in the user's cart.
     * @param {number} userId
     * @returns {Cart}
     */
    async getCart(userId) {
        let cartItemRepo = new CartItemRepo();
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
        let cartItemRepo = new CartItemRepo();
        let cartItem = cartItemRepo.getCartItemByBagIdUserID(bagId, userId);

        let removedRepo = new RemovedRepo();
        removedItems.forEach(bagItemId => {
            removedRepo.createRemoved(bagItemId, cartItem.id);
        })

    }
}