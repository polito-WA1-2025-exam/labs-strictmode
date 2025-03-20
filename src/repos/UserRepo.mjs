class UserRepo {
    /**
     * @param {string} email
     * @param {string} assignedName
     * @param {string} familyName
     * @returns {User}
     */
    createUser(email, assignedName, familyName) { }
    /**
     * @param {number} id
     * @param {string} email
     * @param {string} assignedName
     * @param {string} familyName
     */
    updateUser(id, email, assignedName, familyName) { }
    /**
     * @param {number} id
     * @returns {User}
     */
    getUserById(id) { }
}