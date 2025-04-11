import bcrypt from "bcrypt"; //for password hashing

//Hash function 
async function hashPassword(password) {
    //for saltRounds:
    //10 is a good compromise between security and performance
    //12 is the default value for bcrypt
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}


//Compare function
async function comparePassword(password, hash) {
    const res = await bcrypt.compare(password, hash);
    return res;
}


//Export the functions
export { hashPassword, comparePassword };

