import sqlite3 from 'sqlite3';
import {connect, disconnect} from '../../database/index.js';

export class EstablishmentRepo {
    createEstablishment(email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType) {
        let DB = connect('../../database/reservation_system.db');
        let query = 'INSERT INTO ESTABLISHMENT (email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType) VALUES (?, ?, ?, ?, ?, ?, ?)';
        DB.run(query, [email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType], (err)=>{
            if(err){
                console.error('Error inserting establishment: ', err.message);
            } else {
                console.log('Establishment inserted successfully');
            }
        })
        disconnect(DB);
    }
    getEstablishment(id) {}
    listAllEstablishments() {}
}