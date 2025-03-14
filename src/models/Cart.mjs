class Cart {
    constructor(id, userId, listBag) {
        this.id = id;
        this.userId = userId;
        this.listBag = listBag;
    }

    totPrice() {
        return this.listBag.reduce((acc, bag) => acc + (bag.price || 0), 0);
    }
}

export default Cart;
