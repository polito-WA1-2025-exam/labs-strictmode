import { DEFAULT_PATH, createDb } from "./index.js";

createDb(DEFAULT_PATH)
    .then(() => {
        console.log(`Database created at ${DEFAULT_PATH}`);
    })
    .catch((err) => {
        console.error("Error creating database:", err);
    });