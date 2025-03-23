export class Establishment {
    constructor(id, bags, email, password, prefixPhoneNumber, phoneNumber, contactEmail, name, estType) {
        this.id = id;
        this.bags = bags;
        this.email = email;
        this.password = password;
        this.prefixPhoneNumber = prefixPhoneNumber;
        this.phoneNumber = phoneNumber;
        this.contactEmail = contactEmail;
        this.name = name;
        this.estType = estType;
    }
}

export default Establishment;
