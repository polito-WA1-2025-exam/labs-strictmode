import sqlite3 from 'sqlite3';
import {pathDbFromRepos, connect} from '../../database/index.js';
import Bag from '../models/index.mjs'
import BagItem from '../models/index.mjs';
import BagItemRepo from '../repos/index.mjs'

export class BagRepo {

    constructor() {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }

    /** 
     * Creates a new empty bag.
     * @param {Bag} bag
     * @returns {Bag} - The bag that was added to the cart, with the new ID generated by the system.
     */
    async createBag(bag) {
        let query = 'INSERT INTO BAG (estId, size, bagType, tags, price, pickupTimeStart, pickupTimeEnd, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        return new Promise((resolve, reject) => {
            this.DB.all(query, [bag.estId, bag.size, bag.bagType, bag.tags, bag.price, bag.pickupTimeStart, bag.pickupTimeEnd, bag.available], (err) => {
                if (err) {
                    console.error('Error inserting bag: ', err.message);
                    reject(err);
                } else {
                    console.log('Bag inserted successfully with ID:', this.lastID);
                    let fetchedBag = this.getBagById(this.lastID);
                    bagItem_list = this.getItemsInBag(fetchedBag);
                    fetchedBag.items = bagItem_list;
                    resolve(fetchedBag);
                }
            })
        })
    }

    /**
     * 
     * @param {Bag} bag 
     * @returns 
     */
    async updateBag(bag) {
        let query = 'UPDATE BAG SET estId = ?, size = ?, bagType = ?, tags = ?, price = ?, pickupTimeStart = ?, pickupTimeEnd = ?, available = ? WHERE id = ?'
        return new Promise((resolve, reject) => {
            this.DB.run(query, [bag.estId, bag.size, bag.bagType, bag.tags, bag.price, bag.pickupTimeStart, bag.pickupTimeEnd, bag.available, bag.id], (err) => {
                if (err) {
                    console.error('Error inserting bag: ', err.message);
                    reject(err);
                } else {
                    console.log('Bag inserted successfully');
                    resolve(null);
                }
            })
        })
    }
    
    /**
     * Returns the bag with the given ID.
     * @param {number} id
     * @returns {Bag}
     */
    async getBagById(id) {
        let query = 'SELECT * FROM BAG WHERE id = ?'
        return new Promise((resolve, reject) => {
            this.DB.all(query, [resolve, reject], (err, row) => {
                if (err) {
                    console.error('Error inserting bag: ', err.message);
                    reject(err);
                } else {
                    if (row) {
                        let id = parseInt(row[0].id, 10);
                        let estId = parseInt(row[0].estId, 10);
                        let size = row[0].size;
                        let bagType = row[0].bagType;
                        let tags = row[0].tags;
                        let price = parseFloat(row[0].price);
                        pickupTimeStart = row[0].pickupTimeStart;
                        pickupTimeEnd = row[0].pickupTimeEnd;
                        let available = Boolean(row[0].available);

                        let fetchedBag = new Bag(id, estId, size, bagType, tags, price, pickupTimeStart, pickupTimeEnd, available);
                        bagItem_list = this.getItemsInBag(fetchedBag);
                        fetchedBag.items = bagItem_list;
                        resolve(fetchedBag);
                    } else {
                        resolve(null);
                    }
                }
            })
        })
    }

    

    /**
     * Lists all the available bags, from every establishment.
     * A bag is available if no one reserved it yet and it can be picked up now.
     * 
     * @returns {Array<Bag>}
     */
    async listAvailable() {
        let query = 'SELECT * FROM BAG WHERE available = 1'
        return new Promise((resolve, reject) => {
            this.DB.all(query, [resolve, reject], (err, rows) => {
                if (err) {
                    console.error('error retriving all available bags', err.message);
                    reject(err);
                } else {
                    let bag_list = [];

                    if (rows) {
                        rows.forEach(row => {
                            let id = parseInt(row.id, 10);
                            let estId = parseInt(row.estId, 10);
                            let size = row.size;
                            let bagType = row.bagType;
                            let tags = row.tags;
                            let price = parseFloat(row.price);
                            let pickupTimeStart = row.pickupTimeStart;
                            let pickupTimeEnd = row.pickupTimeEnd;
                            let available = Boolean(row.available);
    
                            let fetchedBag = new Bag(id, estId, size, bagType, tags, price, pickupTimeStart, pickupTimeEnd, available);
                            bagItem_list = this.getItemsInBag(fetchedBag);
                            fetchedBag.items = bagItem_list;

                            bag_list.push(fetchedBag);
                        })
                        resolve(bag_list);
                    } else {
                        resolve(null);
                    }
                }                   
            })
        })
    }


    /**
     * @param {Bag} bag
     * @returns {Array<BagItem>}
     */

    async getItemsInBag(bag) {
        // TODO
        let bagItemRepo = new BagItemRepo();
        bagItem_list = bagItemRepo.getBagItemListByBagItemId(bag.id);
        return bagItem_list;
    }
    

    /**
     * Creates and adds a new item to the bag.
     * @param {BagItem} bagItem
     * @returns {BagItem} - The item that was added to the bag, with the ID generated by the system.
     */
    async addItem(bagItem) {
        let bagItemRepo = new BagItemRepo();
        let bagItem = bagItemRepo.createBagItem(bagItem.bagId, bagItem.name, bagItem.quantity, bagItem.measurementUnit);

        return bagItem;
    }

    /**
     * Remove and deletes the item in the bag.
     * @param {BagItem} bagItem
     */
    async removeItem(bagItem) {
        let bagItemRepo = new BagItemRepo();
        let msg = bagItemRepo.deleteItem(bagItem.id);
    }

}