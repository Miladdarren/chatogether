const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const passport = require('passport');

// Load User model
const User = require('../models/User');

// @route  POST auth/register
// @desc   Register user
// @access Public
router.post('/register', (req, res) => {
    const errors = {};

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    // Search for user by email
    User.findOne({ email: email })
        .then(user => {
            // Email exist
            if (user) {
                errors.emailexist = 'Email already exist!';
                return res.status(400).json(errors);
            }

            // Search for user by username
            User.findOne({ username: username })
                .then(user => {
                    // Username exist
                    if (user) {
                        errors.usernameexist = 'Username already exist!';
                        return res.status(400).json(errors);
                    }

                    /// Registering user ///

                    // Creating new user
                    const newUser = new User({
                        firstName: firstName,
                        lastName: lastName,
                        username: username,
                        email: email,
                        password: password
                    });

                    // Hashing password
                    bcrypt
                        .hash(password, keys.saltFactor)
                        .then(hash => {
                            newUser.password = hash;

                            // Saving user in database
                            newUser
                                .save()
                                .then(user => res.json(user))
                                .catch(err => console.log(err));
                        })
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

// @route  POST auth/login
// @desc   Login user
// @access Public
router.post('/login', (req, res) => {});

module.exports = router;
