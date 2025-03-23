import sqlite3 from 'sqlite3';
import {connect, disconnect} from '../../database/index.js';

export class UserRepo {
    /**
     * @param {string} email
     * @param {string} password
     * @param {int} prefixPhoneNumber
     * @param {int} phoneNumber
     * @param {string} assignedName
     * @param {string} familyName
     * @returns {User}
     */
    createUser(email, password, prefixPhoneNumber, phoneNumber, assignedName, familyName) {
        let DB = connect('../../database/reservation_system.db');
        let query = 'INSERT INTO USER (email, password, prefixPhoneNumber, phoneNumber, assignedName, familyName) VALUES (?, ?, ?, ?, ?, ?)';
        DB.run(query, [email, password, prefixPhoneNumber, phoneNumber, assignedName, familyName], (err) =>{
            if (err) {
                console.error('Error inserting user: ', err.message);
            } else {
                console.log('User inserted successfully');
            }
        });
        disconnect(DB);
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
    updateUser(id, email, password, prefixPhoneNumber, phoneNumber, assignedName, familyName) { }
    /**
     * @param {number} id
     * @returns {User}
     */
    getUserById(id) { }
}