import sqlite3 from 'sqlite3';
import {pathDbFromRepos, connect} from '../../database/index.js';
import {User} from '../models/index.mjs';

export class UserRepo {

    constructor() {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }

    /**
     * @param {string} email
     * @param {string} password
     * @param {int} prefixPhoneNumber
     * @param {int} phoneNumber
     * @param {string} assignedName
     * @param {string} familyName
     * @returns {User}
     */
    async createUser(email, password, prefixPhoneNumber, phoneNumber, assignedName, familyName) {
        let query = 'INSERT INTO USER (email, password, prefixPhoneNumber, phoneNumber, assignedName, familyName) VALUES (?, ?, ?, ?, ?, ?)';
        this.DB.run(query, [email, password, prefixPhoneNumber, phoneNumber, assignedName, familyName], (err) =>{
            if (err) {
                console.error('Error inserting user: ', err.message);
            } else {
                console.log('User inserted successfully');
            }
        });
    }
    /**
     * @param {number} id
     * @param {string} email
     * @param {string} password
     * @param {int} prefixPhoneNumber
     * @param {int} phoneNumber
     * @param {string} assignedName
     * @param {string} familyName
     */
    async updateUser(id, email, password, prefixPhoneNumber, phoneNumber, assignedName, familyName) { }
    /**
     * @param {number} id
     * @returns {User}
     */
    async getUserById(id) { 
        let query = 'SELECT * FROM USER WHERE userId = ?';
        return new Promise ((resolve, reject) => {
            this.DB.all(query, [id], (err, row) => {
                if (err) {
                    console.error('Error inserting user: ', err.message);
                    reject(err);
                } else {
                    if (row) {
                        let id = row[0].userId;
                        let email = row[0].email;
                        let password = row[0].password;
                        let prefixPhoneNumber = parseInt(row[0].password, 10);
                        let phoneNumber = parseInt(row[0].phoneNumber, 10);
                        let assignedName = row[0].assignedName;
                        let familyName = row[0].familyName;
    
                        let user = new User(id, email, password, prefixPhoneNumber, phoneNumber, assignedName, familyName)
                        resolve(user);
                    } else {
                        resolve(null);
                    }
                }
            })
        })
    }
}