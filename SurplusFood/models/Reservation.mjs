import dayjs from 'dayjs';

class Reservation {
    constructor(id, userId, estId, createdAt, startAt, endAt) {
        this.id = id;
        this.userId = userId;
        this.estId = estId;
        this.createdAt = dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss');
        this.startAt = dayjs(startAt).format('YYYY-MM-DD HH:mm:ss');
        this.endAt = dayjs(endAt).format('YYYY-MM-DD HH:mm:ss');
    }
}

export default Reservation;
