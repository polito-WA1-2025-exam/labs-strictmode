import dayjs from 'dayjs';
import Bag from './Bag.mjs';

export class Reservation {
    constructor(id, userId, cartItem, createdAt, canceledAt = null) {
        this.id = id;
        this.userId = userId;
        this.createdAt = createdAt;
        this.cartItem = cartItem;
        this.canceledAt = canceledAt;
    }
}

export default Reservation;
