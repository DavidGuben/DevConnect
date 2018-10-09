// Dependencies
const Validator = require('validator');

// is-empty checks if null, undefined, object and strings are empty
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data) {
    // create an empty object to store the errors
    let errors = {};
    
    // set fields to empty
    //  The conditional (?) operator assigns a value to a variable based on a condition.
    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    // shoot error if length is too short
    if(!Validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = "Name must be between 2 and 30 characters.";
    }
    // shoot error if name field is empty
    if(Validator.isEmpty(data.name)) {
        errors.name = 'Name is required.';
    }
    // shoot error if e-mail field is empty
    if(Validator.isEmpty(data.email)) {
        errors.email = 'Email is required.';
    }
    // shoot error if email field is not an email
    if(!Validator.isEmail(data.email)) {
        errors.email = 'Email is invalid.';
    }
    // shoot error if password field is empty
    if(Validator.isEmpty(data.password)) {
        errors.password = 'Password is requird.';
    }
    // shoot error if password is less than 6 characters or over 30
    if(!Validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = 'Password must be at least 6 characters.';
    }
    // shoot error if password2 field is empty
    if(Validator.isEmpty(data.password2)) {
        errors.password2 = 'Confirm password is required.';
    }
    // shoot error if passwords don't match
    if(!Validator.equals(data.password, data.password2)) {
        errors.password2 = 'Passwords must match.';
    }
    
    return {
        // errors is an object that contains all the errors defined above
        errors,
        isValid: isEmpty(errors)
    };
};