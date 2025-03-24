export class BagItem {
    /**
     * @param {number} bagId
     * @param {number} id - Unique id for the item. Unique within the bag.
     * @param {string} name
     * @param {number} quantity - Must always be greater than 0.
     * @param {string} measurementUnit - Unit of measurement for the quantity (e.g., "kg", "g", "units").
     * @param {boolean} removed
     */
    constructor(id, bagId, name, quantity, measurementUnit, removed=false) {
        this.id = id;
        this.bagId = bagId;
        this.name = name;
        this.quantity = quantity;
        this.measurementUnit = measurementUnit;
    }
}

export default BagItem;