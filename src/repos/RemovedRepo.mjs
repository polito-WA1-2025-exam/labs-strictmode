import { BagItemRepo } from './BagItemRepo.mjs';

export class RemovedRepo {
    constructor(db) {
        this.DB = db;
    }

    /**
     * @param {number} bagItemId
     * @param {number} cartItemId
     * @returns
     */

    async createRemoved(bagItemId, cartItemId) {
        let query = 'INSERT INTO REMOVED (bagItemId, cartItemId) VALUES (?, ?)';
        return new Promise((resolve, reject) => {
            this.DB.run(query, [bagItemId, cartItemId], (err) => {
                if (err) {
                    console.error('Error creating Removed Item: ', err.message);
                    reject(err); 
                } else {
                    console.log('Removed Item inserted succesfully');
                    resolve(null);
                }
            })
        })
    }

    /**
     * @param {number} bagItemId
     * @param {number} cartItemId
     * @returns
     */

    async getBagItemRemoved(bagItemId, cartItemId) {
        let query = 'SELECT * FROM REMOVED WHERE bagItemId = ? AND cartItemId = ?';
        const db = this.DB;
        return new Promise((resolve, reject) => {
            this.DB.all(query, [bagItemId, cartItemId], async (err, row) => {
                if (err) {
                    console.error('Error retriving the remove Itemd: ', err.message);
                    reject(err);
                } else {
                    if (row) {
                        let bagItemRepo = new BagItemRepo(db);
                        let bagItemRemoved = await bagItemRepo.getItemById(bagItemId);
                        resolve(bagItemRemoved);
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

    async deleteBagItemRemoved(cartItemId) {
        let query = 'DELETE FROM REMOVED WHERE cartItemId = ?';
        return new Promise((resolve, reject) => {
            this.DB.run(query, [cartItemId], (err) => {
                if (err) {
                    console.error('Error deleting bagItem: ', err.message);
                    reject(err);
                } else {
                    console.log('BagItem succesfully delete');
                    resolve(null);
                }
            })
        })
    }

    /**
     * 
     * @param {number} userId
     * @returns {Array<bagItem>} bagItemRemoved_list
     */

    //DISCONTINUED - TO BE REMOVED LATER
    async getAllBagItemRemoved(userId) {
        let query = 'SELECT * FROM REMOVED WHERE userId = ?';
        const db = this.DB;
        return new Promise((resolve, reject) => {
            this.DB.all(query, [userId], (err, rows) => {
                if (err) {
                    console.error('Error retriving bagItem List: ', err.message);
                    reject(err);
                } else {
                    if (rows) {

                        bagItemRemoved_list = [];
                        let bagItemRepo = new BagItemRepo(db); 

                        rows.forEach(async row => {
                            let bagItemId = parseInt(row.bagItemId, 10);
                            let bagItemRemoved = await bagItemRepo.getBagItemById(bagItemId);
                            bagItemRemoved_list.push(bagItemRemoved);
                        })
                        resolve(bagItemRemoved_list);

                    } else {
                        resolve(null);
                    }
                }
            })
        })
    }

    //NEW FUNCTION TO GET REMOVED BAGITEMS
    async getRemovedItems(cartItemId) {
        //Retrieves all removed items for a given cart item.
        const query = 'SELECT * FROM REMOVED WHERE cartItemId = ?';
        const db = this.DB;
        return new Promise((resolve, reject) => {
            db.all(query, [cartItemId], (err, rows) => {
                if (err) {
                    console.error('Error retrieving removed items: ', err.message);
                    reject(err);
                } else {
                    console.log('Removed items retrieved successfully: ', rows);
                    resolve(rows);
                }
            });
        });
    }

}