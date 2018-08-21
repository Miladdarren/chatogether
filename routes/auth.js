const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

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

    // Find user by email
    User.findOne({ email: email })
        .then(user => {
            // Email exist
            if (user) {
                errors.emailexist = 'Email already exist!';
                return res.status(400).json(errors);
            }

            // Find user by username
            User.findOne({ username: username })
                .then(user => {
                    // Username exist
                    if (user) {
                        errors.usernameexist = 'Username already exist!';
                        return res.status(400).json(errors);
                    }

                    // Registering user //

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
router.post('/login', (req, res) => {
    const errors = {};
    const emailOrUsername = req.body.emailOrUsername;
    const password = req.body.password;

    // Find
    User.findOne()
        .or([{ username: emailOrUsername }, { email: emailOrUsername }])
        .then(user => {
            if (!user) {
                errors.nouser = 'User not found';
                return res.status(404).json(errors);
            }

            // Check password
            bcrypt.compare(password, user.password).then(isMatch => {
                // Password does not match
                if (!isMatch) {
                    errors.badpassword = 'Incorrect password';
                    return res.status(400).json(errors);
                }

                // User matched //

                // Create JWT payload
                const payload = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    avatar: user.avatar
                };

                // Sign token
                jwt.sign(
                    payload,
                    keys.secretKey,
                    {
                        expiresIn: 3600
                    },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        });
                    }
                );
            });
        })
        .catch(err => console.log(err));
});

module.exports = router;
