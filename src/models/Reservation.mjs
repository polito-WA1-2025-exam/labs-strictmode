import dayjs from 'dayjs';
import Bag from './Bag.mjs';

class Reservation {
    static STATUS_PENDING = 'pending';
    static STATUS_CONFIRMED = 'confirmed';
    static STATUS_CANCELED = 'canceled';

    constructor(id, user, cartItems) {
        this.id = id;
        this.user = user;
        this.createdAt = dayjs().toDate();
        this.cartItems = cartItems;
        this.status = Reservation.STATUS_PENDING;
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
        if (this.cartItems.every(item => !item.bag.isReserved())) {
            this.cartItems.forEach(item => {
                item.bag.setReservedBy(this.user.id); // Track reserving user
            });
            this.status = Reservation.STATUS_CONFIRMED;
            return true;
        }
        this.status = Reservation.STATUS_CANCELED;
        return false;
    }

    cancel() {
        const now = dayjs();
        this.status = Reservation.STATUS_CANCELED;
        this.cartItems.forEach(item => {
            if (item.bag.pickupStart > now) {
                item.bag.setReservedBy(null);
            }
        });
    }
}

export default Reservation;
