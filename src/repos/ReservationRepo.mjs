import Reservation from "../models/Reservation.mjs";

export class ReservationRepo {
    /**
     * Creates a new reservation for each cart item.
     * If any of the cart items cannot be reserved, no reservations should be created.
     * @param {number} userId
     * @param {Array<number>} cartItems - The IDs of the cart items to be reserved.
     * @returns {Array<Reservation>} - The IDs of the reservations
     */
    async createReservations(userId, cartItems) {
    }

    /**
     * Returns ALL the reservations made by a user, even the cancelled ones.
     * @param {number} userId
     * @returns {Array<Reservation>} - The IDs of the reservations
     */
    async listReservationsByUser(userId) {
    }

    /**
     * Returns ALL the reservations made for an establishment, even the cancelled ones.
     * @param {number} estId
     * @returns {Array<Reservation>} - The IDs of the reservations
     */
    async listReservationsByEstablishment(estId) {}

    /**
     * Cancel a reservation, without deleting it.
     * @param {number} resId - The ID of the reservation to be cancelled.
     */
    async cancelReservation(resId) {}
}
