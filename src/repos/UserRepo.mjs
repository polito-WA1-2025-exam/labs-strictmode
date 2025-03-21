export class UserRepo {
    /**
     * @param {string} email
     * @param {string} assignedName
     * @param {string} familyName
     * @returns {User}
     */
    async createUser(email, assignedName, familyName) { }
    /**
     * @param {number} id
     * @param {string} email
     * @param {string} assignedName
     * @param {string} familyName
     */
    async updateUser(id, email, assignedName, familyName) { }
    /**
     * @param {number} id
     * @returns {User}
     */
    async getUserById(id) { }
}