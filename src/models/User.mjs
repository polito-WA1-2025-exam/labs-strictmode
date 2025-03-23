/**
 * Represents a User.
 * @class
 */
export class User {
    /**
     * @param {number} id
     * @param {string} email
     * @param {string} password
     * @param {int} prefixPhoneNumber
     * @param {int} phoneNumber
     * @param {string} assignedName
     * @param {string} familyName
     */
    constructor(id, email, password, prefixPhoneNumber, phoneNumber, assignedName, familyName) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.prefixPhoneNumber = prefixPhoneNumber;
        this.phoneNumber = phoneNumber;
        this.assignedName = assignedName;
        this.familyName = familyName;
    }
}

export default User;
