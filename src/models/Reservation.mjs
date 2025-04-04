import dayjs from 'dayjs';
import Bag from './Bag.mjs';

export class Reservation {
    constructor(id, user, cartItem, createdAt) {
        this.id = id;
        this.user = user;
        this.createdAt = createdAt;
        this.cartItem = cartItem;
        this.canceledAt = null;    
    }
}

export default Reservation;
