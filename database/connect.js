import sqlite3 from 'sqlite3';

const pathDbFromRepos = '../../database/reservation_system.db';

function connect(pathDB = '../database/reservation_system.db') {
    const sql3 = sqlite3.verbose();
    
    const DB = new sql3.Database(pathDB, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('ERROR connecting to the DB:', err.message);
        } else {
            console.log('SUCCESSFULLY Connected to DB');
        }
    });

    return DB; // Return the database connection if needed
}

function disconnect(DB) {
    DB.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
}

export {pathDbFromRepos, connect, disconnect};