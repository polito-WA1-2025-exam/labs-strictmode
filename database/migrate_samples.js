import { DEFAULT_PATH, createDb } from "./index.js";
import fs from "fs";


//first delete the database file if it exists
if (fs.existsSync(DEFAULT_PATH)) {
    fs.unlinkSync(DEFAULT_PATH);
    console.log(`Deleted existing database at ${DEFAULT_PATH}`);
}


//second parameter is to insert sample data if set to true!
createDb(DEFAULT_PATH, true)
    .then(() => {
        console.log(`Database created at ${DEFAULT_PATH}`);
    })
    .catch((err) => {
        console.error("Error creating database:", err);
    });