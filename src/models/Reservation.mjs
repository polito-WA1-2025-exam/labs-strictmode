import dayjs from 'dayjs';
import Bag from './Bag.mjs';

export class Reservation {
    constructor(cartItem, user) {
        this.cartItem = cartItem;
        this.user = user;
        this.createdAt = dayjs().toDate();
        this.canceledAt = null;
    }
}

export default Reservation;
