import sqlite3 from 'sqlite3';
import {pathDbFromRepos, connect} from '../../database/index.js';
import { Establishment } from '../models/index.mjs'

export class EstablishmentRepo {

    constructor() {
        this.pathDB = pathDbFromRepos;
        this.DB = connect(this.pathDB);
    }

    async createEstablishment(email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType) {
        let query = 'INSERT INTO ESTABLISHMENT (email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType) VALUES (?, ?, ?, ?, ?, ?, ?)';
        this.DB.run(query, [email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType], (err)=>{
            if(err){
                console.error('Error inserting establishment: ', err.message);
            } else {
                console.log('Establishment inserted successfully');
            }
        })
    }

    async getEstablishment(id) {
        let query = 'SELECT * FROM ESTABLISHMENT WHERE = ?'
        return new Promise((resolve, reject) => {
            this.DB.all(query, [id], (err, row) => {
                if (err) {
                    console.error('Error retrieving establishment: ', err.message);
                    reject(err); 
                } else {
                    if (row) {
                        let id = row[0].estId;
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

    async listAllEstablishments() {}
}