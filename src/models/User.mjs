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
     */
    constructor(id, email, assignedName, familyName) {
        this.id = id;
        this.email = email;
        this.assignedName = assignedName;
        this.familyName = familyName;
    }
}

export default User;
