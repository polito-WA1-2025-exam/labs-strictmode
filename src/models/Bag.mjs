import dayjs from 'dayjs';


class Bag {
    static STATUS_NOT_TAKEN = "not taken";
    static STATUS_TAKEN = "taken";

    static TYPE_SURPRISE = "surprise";
    static TYPE_REGULAR = "regular";

    /**
     * Creates an instance of Bag.
     * 
     * @constructor
     * @param {number} id - Unique identifier for the bag.
     * @param {string} bagType - Type of the bag (e.g., "regular", "surprise").
     * @param {number} estId - The establishment ID associated with the bag.
     * @param {number} price - The price of the bag.
     * @param {string} pickupTimeStart - The start time for pickup in ISO 8601 format.
     * @param {string} pickupTimeEnd - The end time for pickup in ISO 8601 format.
     * @param {string} [status=Bag.STATUS_NOT_TAKEN] - The status of the bag.
     * @param {Array} items - The items in the bag.
     */
    constructor(id, bagType, estId, price, pickupTimeStart, pickupTimeEnd, status=Bag.STATUS_NOT_TAKEN) {
        this.id = id;
        this.bagType = bagType;
        this.estId = estId;
        this.price = price; 
        this.status = status;
        this.items = [];
        this.pickupTimeStart = dayjs(pickupTimeStart).format('YYYY-MM-DD HH:mm:ss');
        this.pickupTimeEnd = dayjs(pickupTimeEnd).format('YYYY-MM-DD HH:mm:ss');
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


    removeItem(item){
        //Returns true if success, otherwise false

        itemId = item.id;

        if (this.bagType.toLowerCase === "regular"){
            if (this.removedItems.length >= 2) {
                console.log("Maximum limit of removable items exceeded");
                return false;
            }

            //retrieve the index of the items to be removed

            const idx = this.bagItems.findIndex(x => x.id === itemId);

            if (idx == -1){
                console.log("Item not found");
                return false;
            } 

            this.items.splice(idx, 1)[0];
            return true;
        } else {
            console.log("Bag type must be regular to remove items from the bag")
            return false;
        }

    }
}

export default Bag;
