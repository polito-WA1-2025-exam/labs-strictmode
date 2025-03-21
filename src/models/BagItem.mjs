export class BagItem {
    /**
     * @param {number} bagId
     * @param {number} id - Unique id for the item. Unique within the bag.
     * @param {string} name
     * @param {number} quantity - Must always be greater than 0.
     * @param {string} measurementUnit - Unit of measurement for the quantity (e.g., "kg", "g", "units").
     */
    constructor(bagId, id, name, quantity, measurementUnit, removed=false) {
        this.bagId = bagId;
        this.id = id;
        this.name = name;
        this.quantity = quantity;
        this.measurementUnit = measurementUnit;
    }
}

export default BagItem;