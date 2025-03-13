import dayjs from 'dayjs';

class Reservations {
    constructor() {
        this.list = [];
    }

    add(reservation) {
        this.list.push(reservation);
    }

    getByUser(userId) {
        return this.list.filter(res => res.userId === userId);
    }

    getByEstablishment(estId) {
        return this.list.filter(res => res.estId === estId);
    }

    getById(resId) {
        return this.list.find(res => res.id === resId);
    }

    getCreatedAt_ByDay(day) {
        return this.list.filter(res => dayjs(res.createdAt).isSame(day, 'day'));
    }

    getStartAt_ByDay(day) {
        return this.list.filter(res => dayjs(res.startAt).isSame(day, 'day'));
    }

    getEndAt_ByDay(day) {
        return this.list.filter(res => dayjs(res.endAt).isSame(day, 'day'));
    }
}

export default Reservations;
