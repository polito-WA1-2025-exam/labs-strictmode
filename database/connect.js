import sqlite3 from 'sqlite3';

function connect(pathDB) {
    const sql3 = sqlite3.verbose();
    
    return new Promise((resolve, reject) => {
        const DB = new sql3.Database(pathDB, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error('ERROR connecting to the DB:', err.message);
                reject(err);
            } else {
                console.log('SUCCESSFULLY Connected to DB');
                resolve(DB);
            }
        });
    });
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

export {connect, disconnect};