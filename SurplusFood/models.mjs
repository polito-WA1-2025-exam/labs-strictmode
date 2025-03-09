// Each bag is specific to an establishment
function Bag(id, bagType, estId, food) {
    this.id = id;                               //id of the bag
    this.bagType = bagType;                     //type: either regular or surprise   
    this.estId = estId;                         //id of the establishment supplying the bag
    this.food = food;                           //content of the bag (displayed only if regular)
    this.price                                  //price of the bag
}
function User(id, email, assignedName, familyName, allergies) {
    this.id = id;                                   //user's id
    this.assignedName = assignedName;               //user's name
    this.familyName = familyName;                   //user's surname
    this.email = email;                             //user's e-mail
    this.allergies = allergies;                     //array of user's allergies/special requests  
}
function Establishment(id, name, bags, estType) {
    this.id = id;                                   //establishment id
    this.name = name;                               //establishment name
    this.bags = bags;                               //array of bags
    this.estType = estType                          //establishment type (store or restaurant)
}
function Reservation(id, userId, createdAt, startAt, endAt) {
    this.id = id;                                   //reservation id
    this.userId = userId;                           //users's id of the users who made the reservation
    this.estId = estId;                             //establishment id of the establishment supplying the reserved bag
    this.createdAt = createdAt;                     //timestamp when the order is created
    this.startAt = startAt;                         //timestamp when pick up range starts
    this.endAt = endAt;                             //timestamp when pick up range ends
                                                    //pickup range = [startAt ; endAt]
}
function Cart(id, userId, bags) {
    this.id = id;                                   //cart id      
    this.userId = userId;                           //user's id of the cart owner
    this.bags = bags;                               //array of bags

    this.totPrice = () => {
        //function to return the total price considering all the added bags

        return this.bags.reduce((acc, el) => acc + el, 0)
    }
}


function Reservations() {
    this.list = []


}