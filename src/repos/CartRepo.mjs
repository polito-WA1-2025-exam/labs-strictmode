import {Cart, CartItem, Bag} from '../models/index.mjs'
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
        //console.log('Cart Item created successfully: ', cartItem);
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

        //if removedItems is either null or empty, throw an error:
        if (removedItems === null || removedItems.length === 0) throw new Error('You must specify at least one item to remove');
        let cartItemRepo = new CartItemRepo(this.DB);
        let cartItem = await cartItemRepo.getCartItemByBagIdUserID(bagId, userId);

        //first satisfy these contraints:
        /*
        * Adds an item to the list of removed items.
        * Only 2 items can be removed from a regular bag.
        * No items can be removed from a surprise bag.
        */
        if (cartItem.bag.bagType !== Bag.TYPE_REGULAR) throw new Error('A non-regular bag cannot be personalized');
        //this is the check for wether the user attempts to remove items all in once:
        if (removedItems.length > 2) throw new Error('Cannot remove more than 2 items from the bag!');
        //but we also have to check wether the cartItem has already < 2 removed Items and the user tries to remove more:
        if (cartItem.removedItems.length + removedItems.length > 2) throw new Error('Cannot remove more than 2 items from the bag!');

        //also check that the bagItems ids in removed are actually in the bag:
        for (const bagItemIdToRemove of removedItems) {
            //check the cartItem actually contains the item to be removed
            if (!cartItem.bag.items.some(bagItem => bagItem.id === bagItemIdToRemove)) {
                throw new Error(`Item with ID ${bagItemIdToRemove} is not in the bag`);
            }
        }

        //if the contraints are satisfied, update the removed items in the cartItem
        let removedRepo = new RemovedRepo(this.DB);
        await Promise.all(removedItems.map(bagItemId => {
            return removedRepo.createRemoved(bagItemId, cartItem.id);
        }));

    }


}