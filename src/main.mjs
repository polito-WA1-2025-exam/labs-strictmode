import {createServer} from './server/server.mjs';
import {connect as connectDb, DEFAULT_PATH as DEFAULT_PATH_DB} from '../database/index.js';
import {BagRepo, UserRepo, CartRepo, EstablishmentRepo, ReservationRepo} from './repos/index.mjs';


const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const db = await connectDb(DEFAULT_PATH_DB);
const repos = {
    bagRepo: new BagRepo(db),
    userRepo: new UserRepo(db),
    cartRepo: new CartRepo(db),
    estRepo: new EstablishmentRepo(db),
    resRepo: new ReservationRepo(db),
}
createServer(repos).listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
});
