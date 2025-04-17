import { User } from '../models/index.mjs';

export class UserRepo {
    constructor(db) {
        this.DB = db;
    }

    /**
     * @param {User} user
     * @returns {User}
     */
    async createUser(user) {
        let query = 'INSERT INTO USER (email, password, assignedName, familyName) VALUES (?, ?, ?, ?)';
        const self = this;
        return new Promise ((resolve, reject) => {
            this.DB.run(query, [user.email, user.password, user.assignedName, user.familyName], async function (err) {
                if (err) {
                    console.error('Error inserting user: ', err.message);
                    reject(err);
                } else {
                    console.log('User inserted successfully with ID:', this.lastID);
                    let fetchedUser = await self.getUserById(this.lastID);
                    resolve(fetchedUser);
                }
            });
        })
    }
    /**
     * @param {User} user 
     */
    async updateUser(user) {
        let query = "UPDATE USER SET email = ?, password = ?, assignedName = ?, familyName = ? WHERE id = ?"
        return new Promise ((resolve, reject) => {
            this.DB.run(query, [user.email, user.password, user.assignedName, user.familyName, user.id], (err) => {
                if (err) {
                    console.error('Error updating user: ', err.message);
                    reject(err);
                } else {
                    console.log('User updated successfully');
                    resolve(null);
                }
            })
        })
    }

    async deleteUser(id) {
        let query = 'DELETE FROM USER WHERE id = ?';
        return new Promise((resolve, reject) => {
            this.DB.run(query, [id], (err) => {
                if (err) {
                    console.error('Error deleting user: ', err.message);
                    reject(err);
                } else {
                    console.error('User delete succesfully');
                    resolve(null);
                }
            })
        })
    }

    /**
     * @param {number} id
     * @returns {User}
     */
    async getUserById(id) { 
        let query = 'SELECT * FROM USER WHERE id = ?';
        return new Promise ((resolve, reject) => {
            this.DB.all(query, [id], (err, row) => {
                if (err) {
                    console.error('Error retriving user: ', err.message);
                    reject(err);
                } else {
                    if (row) {
                        let id = parseInt(row[0].id, 10);
                        let email = row[0].email;
                        let password = row[0].password;
                        let assignedName = row[0].assignedName;
                        let familyName = row[0].familyName;
    
                        let fetchedUser = new User(id, email, password, assignedName, familyName);
                        resolve(fetchedUser);
                    } else {
                        resolve(null);
                    }
                }
            })
        })
    }
}
