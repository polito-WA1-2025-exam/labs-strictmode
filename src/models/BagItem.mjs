export class BagItem {
    /**
     * @param {number} bagId
     * @param {number} id - Unique id for the item. Unique within the bag.
     * @param {string} name
     * @param {number} quantity - Must always be greater than 0.
     */
    constructor(bagId, id, name, quantity) {
        this.bagId = bagId;
        this.id = id;
        this.name = name;
        this.quantity = quantity;
    }
}

export default BagItem;