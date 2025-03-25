import Bag from "../models/Bag.mjs";
import sqlite3, { CONSTRAINT } from 'sqlite3';
import {pathDbFromRepos, connect} from '../../database/index.js';
import { BagItem } from '../models/index.mjs'

export class BagItemRepo {
    
    constructor () {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }

    async createBagItem(id, bagid, name, quantity, measurementUnit, removed) {
        let query = 'INSERT INTO BAG_ITEM (itemId, bagId, name, quantity, measurementunit, removed) VALUES (?, ?, ?, ?, ?, ?)';
        this.DB.run(query, [id, bagid, name, quantity, measurementUnit, removed], (err) => {
            if (err) {
                console.error('Error inserting bagItem: ', err.message);
            } else {
                console.log('BagItem inserted successfully');
            }
        });
    }

}