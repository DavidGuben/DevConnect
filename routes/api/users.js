// Dependencies
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load User model
const User = require('../../models/User');

// @route  GET api/users/test
// @desc   Tests users route
// @access Public
router.get('/test', (req, res) => res.json({ msg: "Users route works" }));

// @route  POST api/users/register
// @desc   Register user
// @access Public
router.post(
    '/register',
    (req, res) => {
    // extract errors and isValid from '../../validation/register' using destructuring
    // Parse incoming request bodies(body-parser) in a middleware(Validator) before handlers,
    // available under the req.body property.
    const { errors, isValid } = validateRegisterInput(req.body);

    // if validation fails shoot error
    if(!isValid) {
        // return all triggered errors
        return res.status(400).json(errors);
    }
    
    // User is the mongoose model defined in '../../models/User'
    // find one user in the db with that email
    User.findOne({ email: req.body.email })
        .then(user => { // then take the result and assign it to user
            if(user) {  // if the result exists shoot error
                errors.email = 'Email already exists.'
                return res.status(400).json(errors);
            } else { 
                // create a variable that holds the avatar associated with that email
                // the default property holds a default img for no associated pictures
                const avatar = gravatar.url(req.body.email, {
                    s: '200', // Size
                    r: 'pg', // Rating
                    d: 'mm'  // Default
                });

                // Create a new user using the mongoose User model
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar: avatar,
                    password: req.body.password
                });

                // Encrypt password: 
                // Generate salt w/ bcryptjs, hash password w/ salt, set password to hash.
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        // set password to encrypted hash
                        newUser.password = hash;
                        // Save newUser to MongoDB
                        newUser.save()
                        .then(user => res.json(user))  // return user in json format
                        .catch(err => console.log(err)); // log any errors
                    })
                })
            }
        })
});

// @route  GET api/users/login
// @desc   Login user / Returns JWT Token
// @access Public
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find user be email
    User.findOne({ email }).then(user => {
            // Check for user
            if(!user) {
                errors.email = 'User not found';
                return res.status(404).json(errors);
            }

            // Check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch) {
                        // User matched
                        const payload = { id: user.id, name: user.name, avatar: user.avatar } // Create JWT Payload
                        // Sign token
                        jwt.sign(
                         payload, 
                         keys.secretOrKey, 
                         { expiresIn: 3600 }, 
                         (err, token) => {
                            res.json({
                                success: true, 
                                token: 'Bearer '+ token
                            })
                        });
                    } else {
                        errors.password = 'Password is incorrect';
                        return res.status(404).json(errors)
                    }
                });
        });
});

// @route  GET api/users/current
// @desc   Return current user
// @access Private
router.get('/current', passport.authenticate('jwt', { session: false }),
 (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

module.exports = router;