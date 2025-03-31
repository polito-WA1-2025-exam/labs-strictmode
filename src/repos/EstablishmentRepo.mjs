import sqlite3 from 'sqlite3';
import {pathDbFromRepos, connect} from '../../database/index.js';
import { Establishment } from '../models/index.mjs'

export class EstablishmentRepo {

    constructor() {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }

    /**
     * @param {string} email 
     * @param {string} password 
     * @param {number} prefixPhoneNumber 
     * @param {number} phoneNumber 
     * @param {string} contactEmail 
     * @param {string} name 
     * @param {string} estType 
     */

    async createEstablishment(email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType) {
        let query = 'INSERT INTO ESTABLISHMENT (email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType) VALUES (?, ?, ?, ?, ?, ?, ?)';
        return new Promise ((resolve, reject) => {
            this.DB.run(query, [email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType], (err)=>{
                if (err) {
                    console.error('Error inserting establishment: ', err.message);
                    reject(err);
                } else {
                    console.log('Establishment inserted successfully');
                    resolve(null);
                }
            })
        })
    }

    /**
     * 
     * @param {number} id 
     * @param {string} email 
     * @param {string} password 
     * @param {number} prefixPhoneNumber 
     * @param {number} phoneNumber 
     * @param {string} contactEmail 
     * @param {string} name 
     * @param {string} estType  
     */

    async updateEstablishment(id, email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType) {
        let query = 'UPDATE ESTABLISHMENT SET email = ?, password = ?, prefixPhoneNumber = ?, phoneNumber = ?, contactEmail = ?, name = ?, estType = ? WHERE id = ?'
        return new Promise((resolve, reject) => {
            this.DB.run(query, [email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType, id], (err) => {
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
     * @returns {Establishment}
     */

    async getEstablishment(id) {
        let query = 'SELECT * FROM ESTABLISHMENT WHERE id = ?'
        return new Promise((resolve, reject) => {
            this.DB.all(query, [id], (err, row) => {
                if (err) {
                    console.error('Error retrieving establishment: ', err.message);
                    reject(err); 
                } else {
                    if (row) {
                        let id = row[0].id;
                        let email = row[0].email;
                        let password = row[0].password;
                        let prefixPhoneNumber = parseInt(row[0].prefixPhoneNumber, 10);
                        let phoneNumber = parseInt(row[0].phoneNumber, 10);
                        let contactEmail = row[0].contactEmail;
                        let name = row[0].name;
                        let estType = row[0].estType;
                        let establishment = new Establishment(id, bags, email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType);

                        // get bags
                        
                        resolve(establishment);
                    } else {
                        resolve(null);
                    }
                }
            })
        })
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
                            let id = row[0].id;
                        let email = row[0].email;
                        let password = row[0].password;
                        let prefixPhoneNumber = parseInt(row[0].prefixPhoneNumber, 10);
                        let phoneNumber = parseInt(row[0].phoneNumber, 10);
                        let contactEmail = row[0].contactEmail;
                        let name = row[0].name;
                        let estType = row[0].estType;
                        let establishment = new Establishment(id, bags, email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType);

                        establishment_list.push(establishment);
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