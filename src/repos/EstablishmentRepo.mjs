import sqlite3 from 'sqlite3';
import {pathDbFromRepos, connect} from '../../database/index.js';
import Establishment from '../models/index.mjs'
import { BagRepo } from './index.mjs';

export class EstablishmentRepo {

    constructor() {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }

    /**
     * @param {Establishment} establishment;
     */

    async createEstablishment(establishment) {
        let query = 'INSERT INTO ESTABLISHMENT (name, estType, address) VALUES (?, ?, ?)';
        return new Promise ((resolve, reject) => {
            this.DB.all(query, [establishment.name, establishment.estType, establishment.address], (err)=>{
                if (err) {
                    console.error('Error inserting establishment: ', err.message);
                    reject(err);
                } else {
                    console.log('Establishment inserted successfully with ID:', this.lastID);
                    let fetchedEstablishment = this.getEstablishmentById(this.lastID);
                    bag_list = this.getBags(fetchedEstablishment);
                    fetchedEstablishment.bag_list = bag_list;
                    resolve(fetchedEstablishment);
                }
            })
        })
    }

    /**
     * 
     * @param {Establishment} establishment 
     */

    async updateEstablishment(establishment) {
        let query = 'UPDATE ESTABLISHMENT SET name = ?, estType = ? address = ?, WHERE id = ?'
        return new Promise((resolve, reject) => {
            this.DB.run(query, [establishment.name, establishment.estType, establishment.id, establishment.address], (err) => {
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
     * @param {number} id; 
     * @returns {Establishment} establishment
     */

    async getEstablishmentById(id) {
        let query = 'SELECT * FROM ESTABLISHMENT WHERE id = ?'
        return new Promise((resolve, reject) => {
            this.DB.all(query, [id], (err, row) => {
                if (err) {
                    console.error('Error retrieving establishment: ', err.message);
                    reject(err); 
                } else {
                    if (row) {
                        let id = parseInt(row[0].id, 10);
                        let name = row[0].name;
                        let estType = row[0].estType;
                        let address = row[0].address;
                        
                        let fetchedEstablishment = new Establishment(id, name, estType, address);
                        bag_list = this.getBags(fetchedEstablishment);
                        fetchedEstablishment.bag_list = bag_list;
                        
                        resolve(fetchedEstablishment);
                    } else {
                        resolve(null);
                    }
                }
            })
        })
    }

    /**
     * 
     * @param {Establishment} establishment 
     * @returns {Array<Bag>}
     */

    async getBags(establishment) {
        let bagRepo = new BagRepo();
        bag_list = bagRepo.getBagListByEstId(establishment.id);
        return bag_list;
    }

    /**
     * 
     * @returns {Array<Establishment>}
     */

    async listAllEstablishments() {
        let query = 'SELECT * FROM ESTABLISHMENT'
        return new Promise((resolve, reject) => {
            this.DB.all(query, [], (err, rows) => {
                if (err) {
                    console.error('Error retrieving all establishment: ', err.message);
                    reject(err); 
                } else {

                    let establishment_list = []

                    if (rows) {
                        rows.forEach(row => {
                            let id = parseInt(row[0].id, 10);
                            let name = row[0].name;
                            let estType = row[0].estType;
                            let address = row[0].address;

                            let fetchedEstablishment = new Establishment(id, name, estType, address);
                            bag_list = this.getBags(fetchedEstablishment);
                            fetchedEstablishment.bag_list = bag_list;

                            establishment_list.push(fetchedEstablishment);
                        })
                        resolve(establishment_list)
                    } else {
                        resolve(null);
                    }
                }
            })
        })
    }
}