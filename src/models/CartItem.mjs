import Bag from "./Bag.mjs";
import dayjs from 'dayjs';

/** A CartItem is a bag added to a cart. It can be personalized by the user, 
 * who can remove some items from the bag or add special requests.
 * A special request can be "no peanuts" or "no animal products (vegan)", for example.
 * Multiple CartItems can contain the same bag, but with different user personalizations.
 */


export class CartItem {
    /**
     * Creates an instance of CartItem.
     * 
     * @constructor
     * @param {number} id - The ID of the cart item.
     * @param {Object} bag - The bag associated with the cart item.
     * @param {number} userId - The ID of the user who added the bag to the cart.
     * @param {Array<string>} [removedItems=[]] - An array of item IDs to be removed from the bag.
     */
    constructor(id, bag, userId, removed = []) {
        this.id = id;
        this.bag = bag;
        this.userId = userId;

        this.removedItems = [];

        if (removed.length > 0){

            //also here check if contraints are satisfied:
            if (this.bag.bagType !== Bag.TYPE_REGULAR) throw new Error('A non-regular bag cannot be personalized');
            if (removed.length > 2) throw new Error('Cannot remove more than 2 items');


            //check first that the ids in removed are actually in the bag:
            for (const itemToBeRemoved of removed) {
                //check cartItemId is the same as the right cartItem
                if (itemToBeRemoved.cartItemId !== this.id) {
                    throw new Error(`Wrong cartItemID`);
                }

                console.log("ITEM TO BE REMOVED: ", itemToBeRemoved);
                if (!this.bag.items.some(bagItem => bagItem.id === itemToBeRemoved.bagItemId)) {
                    throw new Error(`Item with ID ${itemToBeRemoved.bagItemId} is not in the bag`);
                }
            }

            this.removedItems = removed.map(item => item.bagItemId);
        }

        /*
        for (let item of removed) {
            console.log("Adding item to removedItems: ", item);
            this.removeItem(item.bagItemId);
        }
        */

        this.addedAt = dayjs(); // Track cart addition time


        //console.log("FINAL CART ITEM + REMOVED: ", this);
    }

    /**
     * Adds an item to the list of removed items.
     * Only 2 items can be removed from a regular bag.
     * No items can be removed from a surprise bag.
     * 
     * @param {string} itemId - The ID of the item to be removed.
     * @throws {Error} Throws an error if the bag is not of type regular or removedItems >= 2.
     * @returns {void}
     */
    removeItem(itemId) {
        if (this.bag.bagType !== Bag.TYPE_REGULAR || this.removedItems.length >= 2)
            throw new Error('Cannot remove more items');

        console.log("BAGGGGGGGGG: ", this.bag);


        if (this.bag.items.some(item => item.itemId === itemId)) {
            this.removedItems = [...new Set([...this.removedItems, itemId])];
            console.log("Removed items: ", this.removedItems);
        } 
    }
}

export default CartItem;