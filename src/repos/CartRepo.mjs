import sqlite3 from 'sqlite3';
import {pathDbFromRepos, connect} from '../../database/index.js';
import Cart from '../models/index.mjs'
import { BagRepo, CartSingleElementRepo } from './index.mjs';

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
     * @param {User} user
     * @param {Bag} bag
     */
    async addBag(user, bag) {
        let addedAt = new Date();
        let bagRepo = new BagRepo();
        let bagItem_list = bagRepo.getItems(bag);
        let cartSingleElementRepo = new CartSingleElementRepo();

        bagItem_list.forEach(bagItem => {
            cartSingleElementRepo.createCartSingleElement(user, bagItem, addedAt);
        })
    }

    /**
     * Remove a bag from the user's cart.
     * @param {User} user
     * @param {Bag} bag
     */
    async removeBag(user, bag) {
        let bagItem_list = bag.getItems(bag);
        let cartSingleElementRepo = new CartSingleElementRepo();

        bagItem_list.forEach(bagItem => {
            cartSingleElementRepo.deleteCartSingleElement(user, bagItem);
        })
    }

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

    // removedItems -> it might be saved as a string in the DB. THe string contains IDs of bag Items 

    async personalizeBag(userId, bagId, removedItems) {}
}