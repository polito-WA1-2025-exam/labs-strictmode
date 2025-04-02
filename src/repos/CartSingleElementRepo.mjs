import sqlite3 from 'sqlite3';
import {pathDbFromRepos, connect} from '../../database/index.js';
import CartItem from '../models/CartItem.mjs';

export class CartSingleElementRepo {

    constructor() {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }

    /**
     * 
     * @param {User} user
     * @param {BagItem} bagItem 
     * @param {boolean} included_in_cart 
     * @param {Date} addedAt
     * @returns 
     */
    async createCartSingleElement(user, bagItem, addedAt) {
        let query = 'INSERT INTO CART_ELEMENT (userId, bagItemId, included_in_cart, addedAt) VALUES (?, ?, ?, ?)'
        return new Promise ((resolve, reject) => {
            this.DB.run(query, [user.id, bagItem.id, 1, addedAt], (err) => {
                if (err) {
                    console.error('Error inserting cartSingleElement: ', err.message);
                    reject(err);
                } else {
                    console.log('CartSingleElement inserted successfully');
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
    async updateCartSingleElement(id, userId, bagId, bagItemId, included_in_cart) {
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

    /**
     * 
     * @param {User} user 
     * @param {BagItem} bagItem 
     * @returns 
     */

    async deleteCartSingleElement(user, bagItem) {
        let query = 'DELETE FROM CART_SINGLE_ELEMENT WHERE userId = ? AND bagItem = ?'
        return new Promise ((resolve, reject) => {
            this.DB.run(query, [user.id, bagItem.id], (err) => {
                if (err) {
                    console.log('Error deleting cartSingleElement: ', err.message);
                    reject(err);
                } else {
                    console.log('CartSingleElement deleted succesfully');
                    resolve(null);
                }
            })
        })
    }

}

