import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from '../src/server/crypto.mjs';

// Get `__dirname` equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new database or open an existing one

export function createDb(dbPath, insertSampleDataParam = false) {
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
          email VARCHAR(100),
          password VARCHAR(20),
          assignedName VARCHAR(100),
          familyName VARCHAR(100)
        )`, handleError);

        // ESTABLISHMENT: Each record is an establishment that offers 0 or N bags to users.
        // Create ESTABLISHMENT table
        db.run(`CREATE TABLE IF NOT EXISTS ESTABLISHMENT (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(20),
          estType VARCHAR(20),
          address VARCHAR(200)
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
          addedAt DATE NULL,
          FOREIGN KEY (bagId) REFERENCES BAG (id),
          FOREIGN KEY (userId) REFERENCES USER (id)
        )`, handleError);

        // REMOVED: Each record is a bagItem removed from a cartItem.
        db.run(`CREATE TABLE IF NOT EXISTS REMOVED (
          bagItemId INTEGER,
          cartItemId INTEGER,
          PRIMARY KEY (bagItemId, cartItemId)
        )`, handleError);

        // RESERVATION: Each record is a reservation of just 1 cartItem.
        // Since for each cartItem ordered there is only 1 reservation, the reservation has cartItemId as a PRIMARY KEY.
        // Create RESERVATION table
        db.run(`CREATE TABLE IF NOT EXISTS RESERVATION (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cartItemId INTEGER,
          userId INTEGER,
          createdAt DATE,
          canceledAt DATE NULL DEFAULT NULL,
          FOREIGN KEY (cartItemId) REFERENCES CART_ITEM(id)
        )`, handleError);

        // Create index to improve performance
        db.run(`CREATE INDEX IF NOT EXISTS idx_bag_item_bagid ON BAG_ITEM(bagId)`, handleError);
        db.run(`CREATE INDEX IF NOT EXISTS idx_cart_item_bagid ON CART_ITEM(bagId)`, handleError);

        console.log("Trying to commit...");
        // Commit the transaction
        db.run('COMMIT', async (err) => {
          if (err) {
            console.error('Error committing transaction:', err.message);
            reject(err);
            return;
          }
          console.log('Database schema created successfully.');
          console.log('checking insertSampleData:', insertSampleDataParam);
          if (insertSampleDataParam) {
            try {
              await insertSampleData(db);
              resolve(db);
            } catch (e) {
              console.error('Error inserting sample data:', e.message);
              db.run('ROLLBACK');
              reject(e);
            }

          } else {
            resolve(db);
          }
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

  async function insertSampleData(db) {
    return new Promise(async (resolveInsert, rejectInsert) => {
      try {
        db.run('BEGIN TRANSACTION');

        const hashed = await hashPassword("123");
        db.run(`INSERT INTO USER (email, password, assignedName, familyName) VALUES (?, ?, ?, ?)`,
          ["test@gmail.com", hashed, "test", "test"], handleError);

        db.run(`INSERT INTO ESTABLISHMENT (name, estType, address) VALUES (?, ?, ?)`,
          ["testEstablishment", "testType", "testAddress"], function (err) {
            if (err) return rejectInsert(err);

            const estId = this.lastID;
            db.run(`INSERT INTO BAG (estId, size, bagType, tags, price, pickupTimeStart, pickupTimeEnd, available)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [estId, "testSize", "testBagType", "testTags", 10.0, "2024-10-01", "2025-10-03", 1], function (err) {
                if (err) return rejectInsert(err);

                const bagId = this.lastID;
                db.run(`INSERT INTO BAG_ITEM (bagId, name, quantity, measurementUnit)
                        VALUES (?, ?, ?, ?)`,
                  [bagId, "testItem", 1.0, "kg"], handleError);

                db.run('COMMIT', (err) => {
                  if (err) {
                    console.error('Error committing sample data transaction:', err.message);
                    db.run('ROLLBACK');
                    rejectInsert(err);
                  } else {
                    console.log('Sample data inserted successfully.');
                    resolveInsert();
                  }
                });
              });
          });

      } catch (e) {
        console.error('Error inserting sample data:', e.message);
        db.run('ROLLBACK');
        rejectInsert(e);
      }
    });


  }

  return promise;
}