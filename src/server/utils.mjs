//This file contains utility functions to validate user input

//Set limits for the user data
//The user data is limited to 100 characters for the email, assignedName and familyName fields
//This is to prevent users from sending too much data and crashing the server
//I create three separate constants for each field, so that if we need to change the limit in the future, we can do it easily
const MAX_EMAIL_LENGTH = 100;
const MAX_ASSIGNED_NAME_LENGTH = 100;
const MAX_FAMILY_NAME_LENGTH = 100;
//limit for default string
const MAX_STRING_LENGTH = 100;


//Functions to verify if parameters passed by users are correct

//Verify email address is valid
function isValidEmail(email){

    //First: check if the email is empty or too long
    if (email.length === 0 || email.length > MAX_EMAIL_LENGTH) {
        return false;
    }

    /**
     * Second: check if the email is valid using a regex
     * The regex below is a simplified version of the one used in RFC 5322, which is quite complex and difficult to mantain.
     * For reference, the real regex is smth like this: ([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])
     * The problem with this regex is that it is too permissive and allows some invalid email addresses, which are not accepted by most email providers.
     * So it's common practice in web applications to use a simplified version of the regex, which is easier to read and maintain:
     */

    /**
     * This Regex is structured as follows:
     * 1 Local part: [^\s@]+: one or more characters that are not whitespace or @    (ex user.name, user-name, user_name, username etc.)
     * 2 @: the @ symbol
     * 3 Domain part: [^\s@]+: one or more characters that are not whitespace or @   (ex gmail, yahoo, etc.)
     * 4 \.: the dot symbol
     * 5 TLD: [^\s@]+: one or more characters that are not whitespace or @   (ex .com, .org, .net, etc.)
     * @see: https://en.wikipedia.org/wiki/Email_address for reference 
    */
    const emailRegxSimplified = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegxSimplified.test(email);
}

function isValidAssignedName(assignedName) {
    //return false if assignedName is empty or too long
    return assignedName.length > 0 && assignedName.length <= MAX_ASSIGNED_NAME_LENGTH;

}

function isValidFamilyName(familyName) {
    //return false if familyName is empty or too long
    return familyName.length > 0 && familyName.length <= MAX_FAMILY_NAME_LENGTH;
}

function isValidString(string) {
    //return false if string is empty or too long
    return string.length > 0 && string.length <= MAX_STRING_LENGTH;
}

function isValidBagSize(size){
    //valid bag sizes are: "small", "medium", "large"
    if (size.length === 0) {
        return false;
    }
    //transform size to lowercase and check if it is valid
    if (size.toLowerCase() === "small" || size.toLowerCase() === "medium" || size.toLowerCase() === "large") {
        return true;
    }
    return false;
}

function isValidBagType(bagType) {
    //valid bag types are: "regular", "surprise"
    if (bagType.length === 0) {
        return false;
    }
    //transform bagType to lowercase and check if it is valid
    if (bagType.toLowerCase() === "regular" || bagType.toLowerCase() === "surprise") {
        return true;
    }
    return false;
}


//function to check wether the date is expressed in ISO 8601 format
function isValidISODate(date) {

    if (date.length === 0) {
        return false;
    }

    /**
     * RegExp to test a string for a ISO 8601 Date spec
     *  YYYY
     *  YYYY-MM
     *  YYYY-MM-DD
     *  YYYY-MM-DDThh:mmTZD
     *  YYYY-MM-DDThh:mm:ssTZD
     *  YYYY-MM-DDThh:mm:ss.sTZD
     * @see: https://www.w3.org/TR/NOTE-datetime
     */
    const regxISO8601 = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i

    return regxISO8601.test(date);
}


export { isValidEmail, isValidAssignedName, isValidFamilyName, isValidString, isValidBagSize, isValidBagType, isValidISODate };
