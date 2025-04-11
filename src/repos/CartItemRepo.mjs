import sqlite3 from 'sqlite3';
import dayjs from 'dayjs';
import {pathDbFromRepos, connect} from '../../database/index.js';
import CartItem from '../models/CartItem.mjs';
import { BagRepo } from './BagRepo.mjs';
import { CartSingleElementRepo } from './CartSingleElementRepo.mjs'; 
import { RemovedRepo, RemovedRepo } from './RemovedRepo.mjs';

export class CartItemRepo {

    constructor() {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }

    /**
     * 
     * @param {CartItem} cartItem 
     * @param {User} user
     * @param {CartItem}  
     */

    async createCartItem(cartItem, user) {
        let query = 'INSERT INTO CART_ITEM (bagId, userId) VALUES (?, ?)';
        return new Promise((resolve, reject) => {
            this.DB.run(query, [cartItem.bag.id, user.id], (err) => {
                if (err) {
                    console.error('Error creating cartItem: ', err.message);
                    reject(err);
                } else {
                    console.log('Cart Item inserted succesfully: ', this.lastID);
                    cartItem.id = this.lastID;
                    let removedRepo = new RemovedRepo();
                    
                    cartItem.removedItems.forEach(async bagItem => {
                        await removedRepo.createRemoved(bagItem.id, cartItem.id);
                    })
                    resolve(cartItem);
                }
            })
        })
    }

    /**
     * @param {User} 
     */

    async getCartItem(bag, user) {
        let query = 'SELECT * FROM CART_ITEM WHERE bagId = ? AND userId = ?';
        return new Promise((resolve, reject) => {
            this.DB.run(query, [bag.id, user.id], async (err, row) => {
                if (err) {
                    console.error('Error retriving cartItem: ', err.message);
                    reject(err);
                } else {
                    if (row) {
                        let id = parseInt(row[0].id, 10);
                        let bagId = parseInt(row[0].bagId, 10);
                        let userId = parseInt(row[0].userId, 10);

                        let fetchedCartItem = new CartItem(id, bagId, null);
                        let removedRepo = new RemovedRepo();
                        let bagItemRemoved_list = await removedRepo.getAllBagItemRemoved(userId);
                        fetchedCartItem.removedItems = bagItemRemoved_list;
                        resolve(fetchedCartItem);
                    } else {
                        resolve (null);
                    }
                }
            })
        })
    }

    async getCartItemByBagIdUserID(bagId, userId) {
        let query = 'SELECT * FROM CART_ITEM WHERE bagId = ? AND userId = ?';
        return new Promise((resolve, reject) => {
            this.DB.run(query, [bagId, userId], async (err, row) => {
                if (err) {
                    console.error('Error retriving cartItem: ', err.message);
                    reject(err);
                } else {
                    if (row) {
                        let id = parseInt(row[0].id, 10);
                        let bagId = parseInt(row[0].bagId, 10);
                        let userId = parseInt(row[0].userId, 10);

                        let fetchedCartItem = new CartItem(id, bagId, null);
                        let removedRepo = new RemovedRepo();
                        let bagItemRemoved_list = await removedRepo.getAllBagItemRemoved(userId);
                        fetchedCartItem.removedItems = bagItemRemoved_list;
                        resolve(fetchedCartItem);
                    } else {
                        resolve (null);
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

    async getCartItemById(id) {
        let query = 'SELECT * FROM CART_ITEM WHERE id = ?';
        return new Promise((resolve, reject) => {
            this.DB.run(query, [id], async (err, row) => {
                if (err) {
                    console.error('Error retriving cartItem: ', err.message);
                    reject(err);
                } else {
                    if (row) {
                        let id = parseInt(row[0].id, 10);
                        let bagId = parseInt(row[0].bagId, 10);
                        let userId = parseInt(row[0].userId, 10);

                        let fetchedCartItem = new CartItem(id, bagId, null);
                        let removedRepo = new RemovedRepo();
                        let bagItemRemoved_list = await removedRepo.getAllBagItemRemoved(userId);
                        fetchedCartItem.removedItems = bagItemRemoved_list;
                        resolve(fetchedCartItem);
                    } else {
                        resolve (null);
                    }
                }
            })
        })
    }

    // Used in getReservationByCartItemId() in 'ReservationRepo' for retriving 'userId' given 'CartItemId' from the table CART_ITEM.
    // It's for knowing which user added that bag in his cart. 

    /**
     * 
     * @param {number} id 
     * @return {number} userId
     */

    async getUserIdByCartItemId(id) {
        let query = 'SELECT userId FROM CART_ITEM WHERE id = ?';
        return new Promise((resolve, reject) => {
            this.DB.all(query, [id], (err, row) => {
                if (err) {
                    console.error('Error retriving userId: ', err.message);
                    reject(err);
                } else {
                    if (row) {
                        let userId = parseInt(row[0].userId, 10); 
                        resolve(userId);
                    } else {
                        resolve(null);
                    }
                }
            })
        })
    }

    /**
     * @param {number} id
     * @returns
     */

    async deleteCartItem(id) {
        let query = 'DELETE FROM CART_ITEM WHERE id = ?';
        return new Promise((resolve, reject) => {
            this.DB.run(query, [id], async (err) => {
                if (err) {
                    console.error('Error deleting cartItem: ', err.message);
                    reject(err);
                } else {
                    console.log('cartItem deleting succesfully');
                    let removedRepo = new RemovedRepo();
                    await removedRepo.deleteBagItemRemoved(id);
                    resolve(null);
                }
            })
        })
    }

    /**
     * @param {number} userId;
     * @returns {Array<CartItem>} cartItem_list
     */

    async getCartItemListByUserId(userId) {
        let query = 'SELECT * FROM CART_ITEM WHERE userId = ?';
        return new Promise((resolve, reject) => {
            this.DB.all(query, [userId], (err, rows) => {
                if (err) {
                    console.error('Error retriving all cartItems: ', err.message);
                    reject(err);
                } else {
                    if (rows) {

                        cartItem_list = [];

                        rows.forEach(async row => {
                            let bagId = row.bagId;
                            let cartItem = await this.getCartItem(bagId, userId);
                            cartItem_list.push(cartItem);
                        })
                        resolve(cartItem_list);

                    } else {
                        resolve(null);
                    }
                }
            })
        })
    }

    /**
     * @param {number} cartItemId
     * @returns
     */

    async getBagIdListFromCartItemId(cartItemId) {
        let query = 'SELECT bagId FROM CART_ITEM WHERE cartItemId = ?';
        return new Promise((resolve, reject) => {
            this.DB.all(query, [cartItemId], (err, rows) => {
                if (err) {
                    console.error('Error retriving bagId List: ', err.message);
                    reject(err);
                } else {
                    if (rows) {
                        resolve(rows);  // rows is a list where each element is a bagId;
                    } else {
                        resolve(null);
                    }
                }
            })
        })
    }

}