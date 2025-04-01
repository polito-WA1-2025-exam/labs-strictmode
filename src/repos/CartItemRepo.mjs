import sqlite3 from 'sqlite3';
import {pathDbFromRepos, connect} from '../../database/index.js';

export class CartItemRepo {

    constructor() {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }

    /**
     * 
     * @param {number} userId 
     * @param {number} bagId 
     * @param {number} bagItemId 
     * @param {boolean} included_in_cart 
     * @returns 
     */
    async createCartElement(userId, bagId, bagItemId, included_in_cart) {
        let query = 'INSERT INTO CART_ELEMENT (userId, bagId, bagItemId, included_in_cart) VALUES (?, ?, ?, ?)'
        return new Promise ((resolve, reject) => {
            this.DB.run(query, [userId, bagId, bagItemId, included_in_cart], (err) => {
                if (err) {
                    console.error('Error inserting cartElement: ', err.message);
                    reject(err);
                } else {
                    console.log('CartElement inserted successfully');
                    resolve(null);
                }
            })
        })
    }

    /**
     * 
     * @param {number} id 
     * @param {number} userId 
     * @param {number} bagId 
     * @param {number} bagItemId 
     * @param {boolean} included_in_cart 
     * @returns 
     */
    async updateCartElement(id, userId, bagId, bagItemId, included_in_cart) {
        let query = 'UPDATE CART_ELEMENT SET userId = ?, bagId = ?, bagItemId = ?, included_in_cart = ? WHERE id = ?';
        return new Promise ((resolve, reject) => {
            this.DB.run(query, [userId, bagId, bagItemId, included_in_cart, id], (err) => {
                if (err) {
                    console.error('Error updating cartElement: ', err.message);
                    reject(err);
                } else {
                    console.log('CartElement updated successfully');
                    resolve(null);
                }
            })
        })
    }

}