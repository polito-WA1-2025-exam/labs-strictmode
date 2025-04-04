import dayjs from 'dayjs';
import Bag from './Bag.mjs';

export class Reservation {
    constructor(id, user) {
        this.id = id;
        this.user = user;
        this.createdAt = dayjs().toDate();
        this.cartItemList = [];       // bag
        this.canceledAt = null;
        this.totPrice = null;
    }
}

export default Reservation;
