import sqlite3 from 'sqlite3';
import dayjs from 'dayjs';
import {pathDbFromRepos, connect} from '../../database/index.js';
import Establishment from '../models/index.mjs'
import { BagRepo } from './index.mjs';

export class EstablishmentRepo {
    constructor(db) {
        this.DB = db;
    }

    /**
     * @param {Establishment} establishment;
     */

    async createEstablishment(establishment) {
        let query = 'INSERT INTO ESTABLISHMENT (name, estType, address) VALUES (?, ?, ?)';
        return new Promise ((resolve, reject) => {
            this.DB.all(query, [establishment.name, establishment.estType, establishment.address], async function (err){
                if (err) {
                    console.error('Error inserting establishment: ', err.message);
                    reject(err);
                } else {
                    console.log('Establishment inserted successfully with ID:', this.lastID);
                    let fetchedEstablishment = await this.getEstablishmentById(this.lastID);
                    bag_list = await this.getBags(fetchedEstablishment);
                    fetchedEstablishment.bags = bag_list;
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
                    console.error('Error updating establishment: ', err.message);
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
            this.DB.all(query, [id], async (err, row) => {
                if (err) {
                    console.error('Error retrieving establishment: ', err.message);
                    reject(err); 
                } else {
                    if (row) {
                        let id = parseInt(row[0].id, 10);
                        let name = row[0].name;
                        let estType = row[0].estType;
                        let address = row[0].address;
                        
                        let fetchedEstablishment = new Establishment(id, name, null, estType, address);
                        bag_list = await this.getBags(fetchedEstablishment);
                        fetchedEstablishment.bags = bag_list;
                        
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
     * @param {number} id 
     * @returns 
     */

    async deleteEstablishment(id) {
        let query = 'DELETE FROM ESTABLISHMENT WHERE id = ?';
        return new Promise((resolve, reject) => {
            this.DB.run(query, [id], (err) => {
                if (err) {
                    console.error('Error deleting establishment: ', err.message);
                    reject(err);
                } else {
                    console.log('Establishment deleted succesfully: ', err.message);
                    resolve(null);
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
        let bagRepo = new BagRepo(this.DB);
        bag_list = await bagRepo.getBagListByEstId(establishment.id);
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
                        rows.forEach(async row => {
                            let id = parseInt(row[0].id, 10);
                            let name = row[0].name;
                            let estType = row[0].estType;
                            let address = row[0].address;

                            let fetchedEstablishment = new Establishment(id, name, null, estType, address);
                            bag_list = await this.getBags(fetchedEstablishment);
                            fetchedEstablishment.bags = bag_list;

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