import sqlite3 from 'sqlite3';
import {pathDbFromRepos, connect} from '../../database/index.js';
import BagItem from '../models/index.mjs'

export class BagItemRepo {
    
    constructor () {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }

    /**
     * 
     * @param {number} bagId 
     * @param {string} name 
     * @param {real} quantity 
     * @param {string} measurementUnit 
     * @returns 
     */

    async createBagItem(bagId, name, quantity, measurementUnit) {
        let query = 'INSERT INTO BAG_ITEM (bagId, name, quantity, measurementUnit) VALUES (?, ?, ?, ?)';
        return new Promise((resolve, reject) => {
            this.DB.run(query, [bagId, name, quantity, measurementUnit], function (err) {
                if (err) {
                    console.error('Error inserting bagItem:', err.message);
                    reject(null);
                } else {
                    console.log('BagItem inserted successfully with ID:', this.lastID);
                    let bagItem = this.getBagItem(this.lastID);
                    resolve(bagitem);
                }
            });
        });
    }

    async getBagItem(id) {
        // FINISH THIS
    }
    
    /**
     * Updates the attributes of an item in the bag.
     * @param {number} bagId
     * @param {string} name
     * @param {number} quantity - Must always be greater than 0.
     * @param {string} measurementUnit
     */
    async updateItem(id, bagId, name, quantity, measurementUnit) {
        let query = 'UPDATE BAG_ITEM SET bagId = ?, name = ?, quantity = ?, measurementUnit = ? WHERE id = ?';
        return new Promise((resolve, reject) => {
            this.DB.run(query, [bagId, name, quantity, measurementUnit, id], (err) => {
                if (err) {
                    console.error('Error updating bagItem: ', err.message);
                    reject(err);
                } else {
                    console.log('BagItem updated successfully');
                    resolve(null);
                }
            })
        })
    }

    async deleteItem(id) {
        let query = 'DELETE FROM BAG_ITEM WHERE id = ?';
        return new Promise((resolve, reject) => {
            this.DB.run(query, [id], (err) => {
                if(err) {
                    console.log('Error removing bagItem: ', err.message);
                    reject(err);
                } else {
                    console.log('BagItem succesfully removed');
                    resolve(null);
                }
            })
        })
    }

}