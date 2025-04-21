import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get `__dirname` equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new database or open an existing one

export function createDb(dbPath) {
  let { promise, resolve, reject } = Promise.withResolvers();
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database', err.message);
      reject(err);
      return;
    }
    console.log('Connected to the SQLite database.');

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        console.error('Error enabling foreign keys:', err.message);
        reject(err);
        return;
      }

      // Run all creation statements in a transaction
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // USER: Each record is a user already registered into the platform.
        // Create USER table
        db.run(`CREATE TABLE IF NOT EXISTS USER (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email VARCHAR(20),
          password VARCHAR(20),
          assignedName VARCHAR(20),
          familyName VARCHAR(20)
        )`, handleError);

        // ESTABLISHMENT: Each record is an establishment that offers 0 or N bags to users.
        // Create ESTABLISHMENT table
        db.run(`CREATE TABLE IF NOT EXISTS ESTABLISHMENT (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(20),
          estType VARCHAR(20)
        )`, handleError);

        // BAG: Each record is a bag that contains multiple elements inside (bagItem).
        // Each bag can be modified by the user by removing a maximum of 2 bagItem from the bag.
        // Create BAG table
        db.run(`CREATE TABLE IF NOT EXISTS BAG (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          estId INTEGER,
          size VARCHAR(20),
          bagType VARCHAR(20),
          tags VARCHAR(200),
          price REAL,
          pickupTimeStart DATE,
          pickupTimeEnd DATE,
          available BOOLEAN,
          FOREIGN KEY (estId) REFERENCES ESTABLISHMENT(id)
        )`, handleError);

        // BAG_ITEM: Each record is an element of a Bag.
        // Create BAG_ITEM table
        db.run(`CREATE TABLE IF NOT EXISTS BAG_ITEM (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bagId INTEGER,
          name VARCHAR(20),
          quantity REAL,
          measurementUnit VARCHAR(5),
          FOREIGN KEY (bagId) REFERENCES BAG(id)
        )`, handleError);

        // CART_ITEM: Each cart item is a bag that the user added to his cart.
        // This table is required because multiple users can add the same bag into the cart.
        // Create CART_ITEM table
        db.run(`CREATE TABLE IF NOT EXISTS CART_ITEM (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bagId INTEGER,
          userId INTEGER,
          FOREIGN KEY (bagId) REFERENCES BAG (id),
          FOREIGN KEY (userId) REFERENCES USER (id)
        )`, handleError);

        // REMOVED: Each record is a bagItem removed from a cartItem.
        // 2 cartItems of 2 different users might be the same bag with different bagItems removed.
        // Create REMOVED table
        db.run(`CREATE TABLE IF NOT EXISTS REMOVED (
          bagItemId INTEGER,
          cartItemId INTEGER,
          PRIMARY KEY (bagItemId, cartItemId)
        )`, handleError);

        // RESERVATION: Each record is a reservation of just 1 cartItem.
        // Since for each cartItem ordered there is only 1 reservation, the reservation has cartItemId as a PRIMARY KEY.
        // Create RESERVATION table
        db.run(`CREATE TABLE IF NOT EXISTS RESERVATION (
          cartItemId INTEGER,
          createdAt DATE,
          canceledAt DATE NULL,
          FOREIGN KEY (cartItemId) REFERENCES CART_ITEM(id)
        )`, handleError);

        // Create index to improve performance
        db.run(`CREATE INDEX IF NOT EXISTS idx_bag_item_bagid ON BAG_ITEM(bagId)`, handleError);

        console.log("Trying to commit...");
        // Commit the transaction
        db.run('COMMIT', (err) => {
          if (err) {
            console.error('Error committing transaction:', err.message);
            reject(err);
            return;
          }
          console.log('Database schema created successfully.');
          resolve(db);
        });
      });
    });
  });

  function handleError(err) {
    if (err) {
      console.error('SQL Error:', err.message);
      db.run('ROLLBACK');
      db.close();
    }
  }

  return promise;
}