/**
 * Represents a User.
 * @class
 */
export class User {
    /**
     * @param {number} id
     * @param {string} email
     * @param {string} assignedName
     * @param {string} familyName
     * @param {string} password
     */

    constructor(id, email, assignedName, familyName, password) {
        this.id = id;
        this.email = email;
        this.assignedName = assignedName;
        this.familyName = familyName;
        this.password = password;
    }
}

export default User;
