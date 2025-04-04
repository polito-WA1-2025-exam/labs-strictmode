import sqlite3 from 'sqlite3';
import {pathDbFromRepos, connect} from '../../database/index.js';
import CartItem from '../models/CartItem.mjs';
import { BagRepo } from './BagRepo.mjs';
import { CartSingleElementRepo } from './CartSingleElementRepo.mjs'; 

export class CartItemRepo {

    constructor() {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }

    /**
     * 
     * @param {User} user 
     * @param {Bag} bag
     * @param {CartItem}  
     */

    async getCartItem(user, bag) {
        let bagRepo = new bagRepo();
        bagItem_list = bagRepo.getItems(bag);

        removeItem_list = [];

        let cartSingleElementRepo = CartSingleElementRepo()
        bagItem_list.forEach(bagItem => {
            let isIncluded = cartSingleElementRepo.checkIncludedOrRemoved(user, bagItem);
            if (!isIncluded) {
                removeItem_list.push(bagItem);
            }
        })

        // TODO retrieve addedAt

        let cartItem = new CartItem(bag, removeItem_list);

    }

}