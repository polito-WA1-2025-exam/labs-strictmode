class Cart {
    constructor(id, userId, bags) {
        this.id = id;
        this.userId = userId;
        this.bags = bags;
    }

    totPrice() {
        return this.bags.reduce((acc, bag) => acc + (bag.price || 0), 0);
    }
}

export default Cart;
