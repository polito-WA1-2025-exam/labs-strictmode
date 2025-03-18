import dayjs from 'dayjs';
import Bag from './Bag.mjs';

class Reservation {
    constructor(id, user, cartItem) {
        this.id = id;
        this.user = user;
        this.createdAt = dayjs().toDate();
        this.cartItem = cartItem;
        this.canceledAt = null;
    }
}

export default Reservation;
