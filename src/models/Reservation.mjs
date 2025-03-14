import dayjs from 'dayjs';

class Reservation {
    constructor(id, userId, estId, createdAt) {
        this.id = id;
        this.userId = userId;
        this.estId = estId;
        this.createdAt = dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss');
    }
}

export default Reservation;
