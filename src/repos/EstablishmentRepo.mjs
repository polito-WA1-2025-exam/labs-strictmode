import sqlite3 from 'sqlite3';
import {pathDbFromRepos, connect} from '../../database/index.js';
import Establishment from '../models/index.mjs'

export class EstablishmentRepo {

    constructor() {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }

    /**
     * @param {Establishment} establishment;
     */

    async createEstablishment(establishment) {
        let query = 'INSERT INTO ESTABLISHMENT (email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType) VALUES (?, ?, ?, ?, ?, ?, ?)';
        return new Promise ((resolve, reject) => {
            this.DB.all(query, [establishment.email, establishment.password, establishment.prefixPhoneNumber, establishment.phoneNumber, establishment.contactEmail, establishment.name, establishment.estType], (err)=>{
                if (err) {
                    console.error('Error inserting establishment: ', err.message);
                    reject(err);
                } else {
                    console.log('Establishment inserted successfully with ID:', this.lastID);
                    let fetchedEstablishment = this.getEstablishmentById(this.lastID);
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
        let query = 'UPDATE ESTABLISHMENT SET email = ?, password = ?, prefixPhoneNumber = ?, phoneNumber = ?, contactEmail = ?, name = ?, estType = ? WHERE id = ?'
        return new Promise((resolve, reject) => {
            this.DB.run(query, [establishment.email, establishment.password, establishment.prefixPhoneNumber, establishment.phoneNumber, establishment.contactEmail, establishment.name, establishment.estType, establishment.id], (err) => {
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
                        let email = row[0].email;
                        let password = row[0].password;
                        let prefixPhoneNumber = parseInt(row[0].prefixPhoneNumber, 10);
                        let phoneNumber = parseInt(row[0].phoneNumber, 10);
                        let contactEmail = row[0].contactEmail;
                        let name = row[0].name;
                        let estType = row[0].estType;
                        
                        let fetchedEstablishment = new Establishment(id, bags, email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType);

                        // get bags
                        
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
                            let email = row[0].email;
                            let password = row[0].password;
                            let prefixPhoneNumber = parseInt(row[0].prefixPhoneNumber, 10);
                            let phoneNumber = parseInt(row[0].phoneNumber, 10);
                            let contactEmail = row[0].contactEmail;
                            let name = row[0].name;
                            let estType = row[0].estType;
                            
                            let fetchedEstablishment = new Establishment(id, bags, email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType);

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