const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database or open existing one
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
        userId INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(20),
        password VARCHAR(20),
        prefixPhoneNumber INTEGER,
        phoneNumber INTEGER,
        assignedName VARCHAR(20),
        familyName VARCHAR(20)
      )`, handleError);

      // Create ESTABLISHMENT table
      db.run(`CREATE TABLE IF NOT EXISTS ESTABLISHMENT (
        estId INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(20),
        password VARCHAR(20),
        prefixPhoneNumber INTEGER,
        phoneNumber INTEGER,
        contactEmail VARCHAR(20),
        name VARCHAR(20),
        estType VARCHAR(20)
      )`, handleError);

      // Create RESERVATION table (without the BAG reference initially)
      db.run(`CREATE TABLE IF NOT EXISTS RESERVATION (
        reservationId INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        createdAt DATE,
        canceledAt DATE NULL,
        totPrice REAL,
        FOREIGN KEY (userId) REFERENCES USER(UserId)
      )`, handleError);

      // Create BAG table
      db.run(`CREATE TABLE IF NOT EXISTS BAG (
        bagId INTEGER PRIMARY KEY AUTOINCREMENT,
        bagType VARCHAR(12),
        estId INTEGER,
        size VARCHAR(20),
        tags VARCHAR(200),
        price REAL,
        pickupTimeStart DATE,
        pickUpTimeEnd DATE,
        reservedBy INTEGER,
        reservationId INTEGER NULL,
        FOREIGN KEY (estId) REFERENCES ESTABLISHMENT(EstId),
        FOREIGN KEY (reservedBy) REFERENCES USER(UserId),
        FOREIGN KEY (reservationId) REFERENCES RESERVATION(reservationId)
      )`, handleError);

      // Create BAG_ITEM table
      db.run(`CREATE TABLE IF NOT EXISTS BAG_ITEM (
        bagId INTEGER,
        itemId INTEGER,
        name VARCHAR(20),
        quantity REAL,
        measurementUnit VARCHAR(5),
        removed BOOLEAN,
        PRIMARY KEY (bagId, itemId),
        FOREIGN KEY (bagId) REFERENCES BAG(bagId)
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