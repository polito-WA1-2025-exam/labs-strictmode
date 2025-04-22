import CartItem from '../models/CartItem.mjs';
import { RemovedRepo, BagRepo } from './index.mjs';

export class CartItemRepo {
    constructor(db) {
        this.DB = db;
    }

    /**
     * 
     * @param {CartItem} cartItem 
     * @param {User} user
     * @param {CartItem}  
     */

    async createCartItem(cartItem) {
        let query = 'INSERT INTO CART_ITEM (bagId, userId) VALUES (?, ?)';
        const db = this.DB;
        return new Promise((resolve, reject) => {
            this.DB.run(query, [cartItem.bag.id, cartItem.userId], function (err) {
                if (err) {
                    console.error('Error creating cartItem: ', err.message);
                    reject(err);
                } else {
                    cartItem.id = this.lastID;
                    let removedRepo = new RemovedRepo(db);
                    
                    cartItem.removedItems.forEach(async bagItem => {
                        await removedRepo.createRemoved(bagItem.id, cartItem.id);
                    })


                    console.log('Cart Item inserted succesfully: ', cartItem);
                    resolve(cartItem);
                }
            })
        })
    }

    /**
     * @param {User} 
     */

    async getCartItem(bagId, userId) {
        let query = 'SELECT * FROM CART_ITEM WHERE bagId = ? AND userId = ?';
        const db = this.DB;
        return new Promise((resolve, reject) => {
            this.DB.run(query, [bagId, userId], async function(err, row) {
                if (err) {
                    console.error('Error retriving cartItem: ', err.message);
                    reject(err);
                } else {
                    console.log("CAZZZZZZZZ", row);
                    if (row) {
                        let id = parseInt(row[0].id, 10);
                        let bagId = parseInt(row[0].bagId, 10);
                        let userId = parseInt(row[0].userId, 10);

                        let fetchedCartItem = new CartItem(id, bagId, null);
                        let removedRepo = new RemovedRepo(db);
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
        const db = this.DB;
        return new Promise((resolve, reject) => {
            this.DB.run(query, [bagId, userId], async function(err, row) {
                if (err) {
                    console.error('Error retriving cartItem: ', err.message);
                    reject(err);
                } else {
                    if (row) {
                        let id = parseInt(row[0].id, 10);
                        let bagId = parseInt(row[0].bagId, 10);
                        let userId = parseInt(row[0].userId, 10);

                        let fetchedCartItem = new CartItem(id, bagId, null);
                        let removedRepo = new RemovedRepo(db);
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
        const db = this.DB;
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
                        let removedRepo = new RemovedRepo(db);
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
        const db = this.DB;
        return new Promise((resolve, reject) => {
            this.DB.run(query, [id], async (err) => {
                if (err) {
                    console.error('Error deleting cartItem: ', err.message);
                    reject(err);
                } else {
                    console.log('cartItem deleting succesfully');
                    let removedRepo = new RemovedRepo(db);
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
            this.DB.all(query, [userId], async (err, rows) => {
                if (err) {
                    console.error('Error retriving all cartItems: ', err.message);
                    reject(err);
                } else {
                    if (rows && rows.length > 0) {

                        let cartItem_list = [];

                        const bRepo = new BagRepo(this.DB);
                        const removedRepo = new RemovedRepo(this.DB);

                        for (const row of rows) {
                            /*
                            const bagId = row.bagId;
                            const cartItem = await this.getCartItem(bagId, userId);
                            cartItem_list.push(cartItem);
                            */

                            //cartItem has got: id, bag, userId, removedItems
                            //id, userId I already have from the row.
                            //I need to fetch teh bag from the corresponding bagId.
                            const fetchedBag = await bRepo.getBagById(row.bagId);
                            if (!fetchedBag){
                                //ERROR: bag not found
                                console.error("ERROR: bag not found for bagId: ", row.bagId);
                                reject(new Error("ERROR: bag not found for bagId: ", row.bagId));
                            }

                            //for the removed items, I need to fetch the bagItemId from the removed table.
                            const cartItemRemovedItems = await removedRepo.getRemovedItems(row.id)

                            //craft the cartItem object
                            const cartItem = new CartItem(row.id, fetchedBag, row.userId, cartItemRemovedItems);

                            cartItem_list.push(cartItem);


                        }


                        console.log("CARTITEM_LIST: ", cartItem_list);
                        resolve(cartItem_list);

                    } else {
                        resolve(null);
                    }
                }
            })
        })
    }


    async 

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