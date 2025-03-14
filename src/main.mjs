import Bag from "./models/Bag.mjs";
import User from "./models/User.mjs";
import Establishment from "./models/Establishment.mjs";
import Reservation from "./models/Reservation.mjs";
import Cart from "./models/Cart.mjs";
import Reservations from "./models/Reservations.mjs";
import BagItem from "./models/BagItem.mjs";
import assert from "node:assert/strict";


//Example to test the models
const user1 = new User(1, "mail@esempio.com", "Forza", "Toro", ["peanuts"]);

const bag1 = new Bag(1, "regular", 101, 5, "2025-03-13 10:00:00", "2025-03-14 12:00:00");
bag1.addItem(new BagItem(1, "Sandwich", 1, 1));
bag1.addItem(new BagItem(2, "Apple", 1, 1));
assert.equal(bag1.items.length, 2);

const est1 = new Establishment(101, "Bakery", [bag1], "store");

const reservation1 = new Reservation(1, user1.id, est1.id, "2025-03-14 11:00:00");

const reservations = new Reservations();
reservations.add(reservation1);

console.log("User Reservations:", reservations.getByUser(user1.id));