import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get `__dirname` equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new database or open an existing one
const dbPath = path.join(__dirname, 'reservation_system.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) {
      console.error('Error enabling foreign keys:', err.message);
      return;
    }

    // Run all creation statements in a transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Create USER table
      db.run(`CREATE TABLE IF NOT EXISTS USER (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(20),
        password VARCHAR(20),
        prefixPhoneNumber INTEGER,
        phoneNumber INTEGER,
        assignedName VARCHAR(20),
        familyName VARCHAR(20)
      )`, handleError);

      // Create BAG table
      db.run(`CREATE TABLE IF NOT EXISTS BAG (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        estId INTEGER,
        size VARCHAR(20),
        bagType VARCHAR(20),
        tags VARCHAR(200),
        price REAL,
        pickupTimeStart DATE,
        pickUpTimeEnd DATE,
        available BOOLEAN,
        FOREIGN KEY (estId) REFERENCES ESTABLISHMENT(id)
      )`, handleError);

      // Create BAG_ITEM table
      db.run(`CREATE TABLE IF NOT EXISTS BAG_ITEM (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bagId INTEGER,
        name VARCHAR(20),
        quantity REAL,
        measurementUnit VARCHAR(5),
        FOREIGN KEY (bagId) REFERENCES BAG(id)
      )`, handleError);

      // Create ESTABLISHMENT table
      db.run(`CREATE TABLE IF NOT EXISTS ESTABLISHMENT (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(20),
        password VARCHAR(20),
        prefixPhoneNumber INTEGER,
        phoneNumber INTEGER,
        contactEmail VARCHAR(20),
        name VARCHAR(20),
        estType VARCHAR(20)
      )`, handleError);

      // Create CART_ELEMENT table
      db.run(`CREATE TABLE IF NOT EXISTS CART_ELEMENT (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        bagId INTEGER, 
        bagItemId INTEGER,
        included_in_cart BOOLEAN,
        FOREIGN KEY (userId) REFERENCES USER (id),
        FOREIGN KEY (bagId) REFERENCES BAG (id),
        FOREIGN KEY (bagItemId) REFERENCES BAG_ITEM (id)
      )`, handleError)

      // Create PURCHASE table
      db.run(`CREATE TABLE IF NOT EXISTS PURCHASE (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservationId INTEGER,
        cartElementId INTEGER,
        FOREIGN KEY (reservationId) REFERENCES RESERVATION(id),
        FOREIGN KEY (cartElementId) REFERENCES CART_ELEMENT(id)
      )`, handleError); 

      // Create RESERVATION table
      db.run(`CREATE TABLE IF NOT EXISTS RESERVATION (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        createdAt DATE,
        canceledAt DATE NULL,
        totPrice REAL,
        FOREIGN KEY (userId) REFERENCES USER(id)
      )`, handleError); 

      // Create index to improve performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_bag_item_bagid ON BAG_ITEM(bagId)`, handleError);

      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Error committing transaction:', err.message);
          return;
        }
        console.log('Database schema created successfully.');

        // Close the database connection
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
            return;
          }
          console.log('Database connection closed.');
        });
      });
    });
  });
});

// Error handler function
function handleError(err) {
  if (err) {
    console.error('SQL Error:', err.message);
    db.run('ROLLBACK');
    db.close();
  }
}
