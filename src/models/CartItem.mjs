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
     * @param {Object} bag - The bag object containing items.
     * @param {Array<string>} [removedItems=[]] - An array of item IDs to be removed from the bag.
     */
    constructor(id, bag, removedItems = []) {
        this.id = id;
        this.bag = bag;

        this.removedItems = [];
        for (let item of removedItems) {
            this.removeItem(item);
        }

        this.addedAt = dayjs(); // Track cart addition time
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
        if (this.bag.items.some(item => item.itemId === itemId)) return;        // check if present in bag

        this.removedItems = [...new Set([...this.removedItems, itemId])];
    }
}

export default CartItem;