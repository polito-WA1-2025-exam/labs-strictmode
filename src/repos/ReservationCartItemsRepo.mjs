import sqlite3 from 'sqlite3';
import {pathDbFromRepos, connect} from '../../database/index.js';

export class ReservationCartItemsRepo {

    constructor() {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }


    async createPurchase(reservationId, cartElementId) {
        let query = 'INSERT INTO CART_ELEMENT (reservationId, cartElementId) VALUES (?, ?)'
        return new Promise ((resolve, reject) => {
            this.DB.run(query, [reservationId, cartElementId], (err) => {
                if (err) {
                    console.error('Error inserting purchase: ', err.message);
                    reject(err);
                } else {
                    console.log('Purchase inserted successfully');
                    resolve(null);
                }
            })
        })
    }

    async updatePurchase(id, reservationId, cartElementId) {
        let query = 'UPDATE CART_ELEMENT SET reservationId = ?, cartElementId = ? WHERE id = ?';
        return new Promise ((resolve, reject) => {
            this.DB.run(query, [reservationId, cartElementId, id], (err) => {
                if (err) {
                    console.error('Error updating purchase: ', err.message);
                    reject(err);
                } else {
                    console.log('Purchase updated successfully');
                    resolve(null);
                }
            })
        })
    }
}