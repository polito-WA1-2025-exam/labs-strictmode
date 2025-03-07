// Each bag is specific to an establishment
function Bag(id, bagType, estId, food) {
    this.id = id;
    this.bagType = bagType;
    this.estId = estId;
    this.food = food;
    this.price
}
function User(id, email, assignedName, familyName) {
    this.id = id;
    this.assignedName = assignedName;
    this.familyName = familyName;
    this.email = email;
}
function Establishment(id, name, bags) {
    this.id = id;
    this.name = name;
    this.bags = bags;
}
function Reservation(id, userId, createdAt, startAt, endAt) {
    this.id = id;
    this.userId = userId;
    this.estId = estId;
    this.createdAt = createdAt;
    this.startAt = startAt;
    this.endAt = endAt;
}
function Cart(id, userId, bags) {
    this.id = id;
    this.userId = userId;
    this.bags = bags;

    this.totPrice = () => {
        return this.bags.reduce((acc, el) => accl + el, 0)
    }
}


function Reservations() {
    this.list = []


}