import Bag from "./models/Bag.mjs";
import User from "./models/User.mjs";
import Establishment from "./models/Establishment.mjs";
import Reservation from "./models/Reservation.mjs";
import Cart from "./models/Cart.mjs";
import Reservations from "./models/Reservations.mjs";
import Food from "./models/Food.mjs";


//Example to test the models
const user1 = new User(1, "mail@esempio.com", "Forza", "Toro", ["peanuts"]);
const bag1 = new Bag(1, "regular", 101, "Sandwich", "2025-03-13 10:00:00", "2025-03-14 12:00:00");
bag1.price = 5.99;

const est1 = new Establishment(101, "Bakery", [bag1], "store");

const reservation1 = new Reservation(1, user1.id, est1.id, "2025-03-14 11:00:00");

const reservations = new Reservations();
reservations.add(reservation1);

console.log("User Reservations:", reservations.getByUser(user1.id));