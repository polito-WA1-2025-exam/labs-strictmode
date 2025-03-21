import CartItem from "./CartItem.mjs";

/** A class may contain multiple personalized bags, CartItems.
 * No more than one bag per establishment per day can be added to the cart. */
export class Cart {
    constructor(userId) {
        this.userId = userId;
        this.items = [];
    }

    /**
     * Adds an item to the cart.
     * 
     * @param {CartItem} item - The item to be added to the cart.
     * @throws {Error} Throws an error if there is already a bag from the same establishment on the same day.
     * @returns {CartItem} The newly added item.
     */
    addItem(cartItem) {
        // Validate establishment/day constraint
        const existing = this.items.find(item =>
            item.bag.estId === cartItem.bag.estId && 
            item.bag.pickupTimeStart.isSame(cartItem.bag.pickupTimeStart, 'day')
        );

        if (existing) throw new Error('One bag per establishment per day');


        this.items.push(cartItem);
        return cartItem;
    }

    returnCartItems() {
        return this.items;
    }
}

export default Cart;