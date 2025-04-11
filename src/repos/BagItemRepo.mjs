import sqlite3 from 'sqlite3';
import dayjs from 'dayjs';
import {pathDbFromRepos, connect} from '../../database/index.js';
import BagItem from '../models/index.mjs'

export class BagItemRepo {
    
    constructor () {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }

    /**
     * 
     * @param {BagItem} bagItem
     * @returns {BagItem}
     */

    async createBagItem(bagItem) {
        let query = 'INSERT INTO BAG_ITEM (bagId, name, quantity, measurementUnit) VALUES (?, ?, ?, ?)';
        return new Promise((resolve, reject) => {
            this.DB.all(query, [bagItem.bagId, bagItem.name, bagItem.quantity, bagItem.measurementUnit], async function (err) {
                if (err) {
                    console.error('Error inserting bagItem:', err.message);
                    reject(err);
                } else {
                    console.log('BagItem inserted successfully with ID:', this.lastID);
                    let fetchedBagItem = await this.getBagItemById(this.lastID);
                    resolve(fetchedBagItem);
                }
            });
        });
    }

    /**
     * Updates the attributes of an item in the bag.
     * @param {BagItem} bagItem
     */
    async updateItem(bagItem) {
        let query = 'UPDATE BAG_ITEM SET bagId = ?, name = ?, quantity = ?, measurementUnit = ? WHERE id = ?';
        return new Promise((resolve, reject) => {
            this.DB.run(query, [bagItem.bagId, bagItem.name, bagItem.quantity, bagItem.measurementUnit, bagItem.id], (err) => {
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
    /**
     * 
     * @param {number} id 
     * @returns 
     */

    async getBagItemById(id) {
        let query = 'SELECT * FROM BAG_ITEM WHERE id = ?';
        return new Promise((resolve, reject) => {
            this.DB.all(query, [id], (err, row) => {
                if (err) {
                    console.log('Error retriving bagItem: ', err.message);
                    reject(err);
                } else {
                    if (row) {
                        let id = parseInt(row[0].id, 10);
                        let bagId = parseInt(row[0].bagId, 10);
                        let name = row[0].name;
                        let quantity = parseFloat(row[0].quantity);
                        let measurementUnit = row[0].measurementUnit;
                        
                        let fetchedBagItem = new BagItem(id, bagId, name, quantity, measurementUnit);
                        resolve(fetchedBagItem);
                    } else {
                        resolve(null);
                    }
                }
            })
        })
    }

    /**
     * 
     * @param {number} id 
     * @returns {Array<bagItem>}
     */

    async getBagItemListByBagItemId(id) {
        let query = 'SELECT * FROM CART_SINGLE_ELEMENT WHERE bagItemId = ?';
        return new Promise((resolve, reject) => {
            this.DB.all(query, [id], (err, rows) => {
                if(err) {
                    console.log('Error retriving bagItem List: ', err.message);
                    reject(err);
                } else {
                    let bagItem_list = [];

                    if (rows) {
                    rows.forEach(row => {
                        let id = parseInt(row.id, 10);
                        let bagId = parseInt(row.bagId, 10);
                        let name = row.name;
                        let quantity = parseFloat(row.quantity);
                        let measurementUnit = row.measurementUnit;

                        let fetchedBagItem = new BagItem(id, bagId, name, quantity, measurementUnit);
                        bagItem_list.push(fetchedBagItem);
                    })
                    resolve(bagItem_list)

                    } else {
                        resolve(null);
                    }
                }
            })
        })
    }

    /**
     * 
     * @param {number} id 
     * @returns 
     */
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