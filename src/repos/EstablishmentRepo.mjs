import { Establishment } from '../models/index.mjs'
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
        const self = this; // Preserve the 'this' context of the EstablishmentRepo in order to use getEstablishmentById(this.lastID) in the callback
        //the fact is that this.lasstId is related to a scope which is not the same as the one of the class EstablishmentRepo, so we need to save it in a variable to use it later
        return new Promise ((resolve, reject) => {
            this.DB.run(query, [establishment.name, establishment.estType, establishment.address], async function (err) {
                if (err) {
                    console.error('Error inserting establishment: ', err.message);
                    reject(err);
                } else {
                    console.log('Establishment inserted successfully with ID:', this.lastID);
                    let fetchedEstablishment = await self.getEstablishmentById(this.lastID);
                    const bag_list = await self.getBags(fetchedEstablishment);
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
        let query = 'UPDATE ESTABLISHMENT SET name = ?, estType = ?, address = ? WHERE id = ?'
        return new Promise((resolve, reject) => {
            this.DB.run(query, [establishment.name, establishment.estType, establishment.address, establishment.id], (err) => {
                if (err) {
                    console.error('Error updating establishment: ', err.message);
                    reject(err);
                } else {
                    console.log('Establishment updated successfully');
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
                    // since db.all is used:
                    // row is an array of rows, so we need to check if it has any elements, if not, it's because the db doesn't have any establishment with that id
                    if (row && row.length > 0) {
                        let id = parseInt(row[0].id, 10);
                        let name = row[0].name;
                        let estType = row[0].estType;
                        let address = row[0].address;
                        
                        let fetchedEstablishment = new Establishment(id, name, null, estType, address);
                        const bag_list = await this.getBags(fetchedEstablishment);
                        fetchedEstablishment.bags = bag_list;

                        console.log('Establishment retrieved successfully:', fetchedEstablishment);
                        
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
                    console.log('Establishment deleted succesfully: ', id);
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
        const bag_list = await bagRepo.getBagListByEstId(establishment.id);
        return bag_list;
    }

    /**
     * 
     * @returns {Array<Establishment>}
     */

    async listAllEstablishments() {
        let query = 'SELECT * FROM ESTABLISHMENT'
        return new Promise((resolve, reject) => {
            this.DB.all(query, [], async (err, rows) => { //ASYNC CALLBACK SINCE IN THE FOR OF LOOP WE USE AWAIT
                if (err) {
                    console.error('Error retrieving all establishment: ', err.message);
                    reject(err);
                } else {
                    let establishment_list = [];
                    if (rows && rows.length > 0) {
                        for (const row of rows) {
    
                            let id = parseInt(row.id, 10);
                            let name = row.name;
                            let estType = row.estType;
                            let address = row.address;
    
                            let fetchedEstablishment = new Establishment(id, name, null, estType, address);
                            const bag_list = await this.getBags(fetchedEstablishment); // Now await is allowed
    
                            fetchedEstablishment.bags = bag_list;
                            establishment_list.push(fetchedEstablishment);
    
                        }
    
                        console.log('Establishment retrieved successfully:', establishment_list);
                        resolve(establishment_list);
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    }
}
