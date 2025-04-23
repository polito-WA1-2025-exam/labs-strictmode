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

        //CONTRAINT: 
        //Each authenticated user can add to the shopping cart just one bag per establishment within the
        //same day to ensure fairness and allow more users to benefit from the program

        //so, first of all, see if the user has already added a bag from the same establishment today.
        //if yes, then throw an error.

        const cartItemListUser = await this.getCartItemListByUserId(cartItem.userId);

        //check if the user has already added a bag from the same establishment today
        //ofc if the cart of the user is empty, then cartItemListUser will be null or empty.
        //so it's useless to make this check in that case.
        if (cartItemListUser && cartItemListUser.length > 0) {

            const establishmentToBeChecked = cartItem.bag.estId;

            //iterate through each bag of the cartItemListUser and check if the establishment is the same
            for (const cartItemUser of cartItemListUser) {

                if (cartItemUser.bag.estId === establishmentToBeChecked) {
                    //compare the two daysjs objects and check if the DAY (in the sense YYYY-MM-DD) is the same
                    if (cartItemUser.addedAt && cartItem.addedAt && cartItemUser.addedAt.isSame(cartItem.addedAt, 'day')) {
                        //throw an error: the user has already added a bag from the same establishment today
                        throw new Error('You have already added a bag from this establishment today. Please try again tomorrow.');
                    }
                }
            }
        }

        //AFTER THIS CHECK, I CAN PROCEED TO INSERT THE CART ITEM IN THE DB.


        let query = 'INSERT INTO CART_ITEM (bagId, userId, addedAt) VALUES (?, ?, ?)';
        const db = this.DB;
        return new Promise((resolve, reject) => {
            this.DB.run(query, [cartItem.bag.id, cartItem.userId, cartItem.addedAt], function (err) {
                if (err) {
                    console.error('Error creating cartItem: ', err.message);
                    reject(err);
                } else {
                    cartItem.id = this.lastID;
                    let removedRepo = new RemovedRepo(db);
                    
                    cartItem.removedItems.forEach(async bagItem => {
                        await removedRepo.createRemoved(bagItem.id, cartItem.id);
                    })


                    //console.log('Cart Item inserted succesfully: ', cartItem);
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
            this.DB.get(query, [bagId, userId], async function(err, row) {
                if (err) {
                    console.error('Error retriving cartItem: ', err.message);
                    reject(err);
                } else {
                    if (row) {
                        let id = parseInt(row.id, 10);
                        let bagId = parseInt(row.bagId, 10);
                        let userId = parseInt(row.userId, 10);

                        //fetch bag
                        const bagRepo = new BagRepo(db);
                        const fetchedBag = await bagRepo.getBagById(bagId);
                        if (!fetchedBag){
                            //ERROR: bag not found
                            console.error("ERROR: bag not found for bagId: ", bagId);
                            reject(new Error("ERROR: bag not found for bagId: ", bagId));
                        }

                        let fetchedCartItem = new CartItem(id, fetchedBag, userId, []);
                        let removedRepo = new RemovedRepo(db);
                        //let bagItemRemoved_list = await removedRepo.getAllBagItemRemoved(userId);
                        let bagItemRemoved_list = await removedRepo.getRemovedItems(id);
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
            this.DB.all(query, [id], async (err, row) => {
                if (err) {
                    console.error('Error retriving cartItem: ', err.message);
                    reject(err);
                } else {
                    console.log("ROW: ", row);
                    if (row && row.length > 0) {
                        let id = parseInt(row[0].id, 10);
                        let bagId = parseInt(row[0].bagId, 10);
                        let userId = parseInt(row[0].userId, 10);


                        //fetch bag
                        const bagRepo = new BagRepo(db);
                        const fetchedBag = await bagRepo.getBagById(bagId);
                        if (!fetchedBag){
                            //ERROR: bag not found
                            console.error("ERROR: bag not found for bagId: ", bagId);
                            reject(new Error("ERROR: bag not found for bagId: ", bagId));
                        }

                        //                                id, bag, userId, removed = []
                        let fetchedCartItem = new CartItem(id, fetchedBag, userId);
                        let removedRepo = new RemovedRepo(db);
                        let bagItemRemoved_list = await removedRepo.getRemovedItems(id);
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
        const query = 'DELETE FROM CART_ITEM WHERE id = ?';
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


    async deleteCartItemByBagIdUserId(bagId, userId) {
        const query = 'DELETE FROM CART_ITEM WHERE bagId = ? AND userId = ?';
        const db = this.DB;
        return new Promise((resolve, reject) => {
            this.DB.run(query, [bagId, userId], async (err) => {
                if (err) {
                    console.error('Error deleting cartItem: ', err.message);
                    reject(err);
                } else {
                    console.log('cartItem deleting succesfully');
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
                    console.log("CAZZOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO: ", rows);
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