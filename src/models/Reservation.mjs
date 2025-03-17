import dayjs from 'dayjs';
import Bag from './Bag.mjs';

class Reservation {
    constructor(id, user, cartItems) {
        this.id = id;
        this.user = user;
        this.createdAt = dayjs().toDate();
        this.cartItems = cartItems;
        this.canceledAt = null;
    }

    validateCartItems(items) {
        // Check pickup times are in future
        items.forEach(item => {
            if (item.bag.pickupStartItem <= this.createdAt) {
                throw new Error('Cannot reserve expired bags');
            }
        });
        return items;
    }

    confirm() {
        // This flow must be converted for the database
        if (this.cartItems.every(item => !item.bag.isReserved())) {
            this.cartItems.forEach(item => {
                item.bag.setReservedBy(this.user.id); // Track reserving user
            });
            return true;
        }
        return false;
    }

    cancel() {
        const now = dayjs();
        this.canceledAt = now;
        this.cartItems.forEach(item => {
            if (item.bag.pickupStart > now) {
                item.bag.setReservedBy(null);
            }
        });
    }
}

export default Reservation;
