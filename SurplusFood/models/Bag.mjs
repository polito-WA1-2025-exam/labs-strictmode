import dayjs from 'dayjs';

class Bag {
    constructor(id, bagType, estId, food, price, pickUpDays, status ="not taken") {
        this.id = id;
        this.bagType = bagType;
        this.estId = estId;
        this.food = food;
        this.price = price; 
        this.status = status;
        this.pickUpDays = dayjs(pickUpDays, 'day').format('YYYY-MM-DD HH:mm:ss');
        this.bagItems = [];

    }



    addBagItem(bagItem) {
        //Returns true if success, otherwise false

        if (this.bagType.toLowerCase() === "regular") {
            this.bagItems.push(bagItem);
            return true;
        }

        //it bag type is not regular, bagItems are randomized and cannot be specifically added 
        console.log("Cannot add specific food items to surprise bags");
        return false;
    }


    removeBagItem(bagItemId){
        //Returns true if success, otherwise false

        if (this.bagType.toLowerCase === "regular"){
            if (this.removedItems.length >= 2) {
                console.log("Maximum limit of removable items exceeded");
                return false;
            }

            //retrieve the index of the items to be removed

            const idx = this.bagItems.findIndex(x => x.id === bagItemId);

            if (idx == -1){
                console.log("Item not found");
                return false;
            } 

            this.bagItems.splice(idx, 1)[0];
            return true;
        } else {
            console.log("Bag type must be regular to remove items from the bag")
            return false;
        }

    }
}

export default Bag;
