import dayjs from 'dayjs';

/** A Bag is managed by an establishment. 
 * It can be reserved by a single user at a time */ 
export class Bag {
    static TYPE_SURPRISE = "surprise";
    static TYPE_REGULAR = "regular";

    /**
     * @constructor
     * @param {number} id - Unique identifier for the bag.
     * @param {string} bagType - Type of the bag (e.g., "regular", "surprise").
     * @param {number} estId - The establishment ID associated with the bag.
     * @param {number} size - "small", "medium", "large".
     * @param {Array<string>} tags - Example: ["vegan", "gluten free"].
     * @param {number} price - The price of the bag.
     * @param {string} pickupTimeStart - The start time for pickup in ISO 8601 format.
     * @param {string} pickupTimeEnd - The end time for pickup in ISO 8601 format.
     * @param {boolean} available
     */
    constructor(id, bagType, estId, size, tags, price, items, pickupTimeStart, pickupTimeEnd, available) {
        this.id = id;
        this.bagType = bagType;
        this.estId = estId;
        this.size = size;
        this.tags = tags;
        this.price = price; 
        this.items = items;
        this.pickupTimeStart = dayjs(pickupTimeStart);
        this.pickupTimeEnd = dayjs(pickupTimeEnd);
        this.available = available
    }



    addItem(item) {
        //Returns true if success, otherwise false

        if (this.bagType == Bag.TYPE_REGULAR) {
            this.items.push(item);
            return true;
        }

        //it bag type is not regular, bagItems are randomized and cannot be specifically added 
        console.log("Cannot add specific item to surprise bags");
        return false;
    }

    isReserved() {
        return this.reservedBy !== null;
    }
}

export default Bag;
